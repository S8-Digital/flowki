<?php

namespace App\Ai\Tools;

use App\Ai\Concerns\ValidatesRemoteUrl;
use App\Models\User;
use Illuminate\Contracts\JsonSchema\JsonSchema;
use Illuminate\Support\Facades\Http;
use Laravel\Ai\Contracts\Tool;
use Laravel\Ai\Tools\Request;
use Psr\Http\Message\RequestInterface;
use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\UriInterface;

class FetchUrlContent implements Tool
{
    use ValidatesRemoteUrl;

    public function __construct(protected User $user) {}

    public function description(): string
    {
        return 'Fetch the plain-text content of a public web page (e.g. a recipe URL). Use this to retrieve the recipe details from a URL before calling ImportRecipe.';
    }

    public function handle(Request $request): string
    {
        $url = trim($request['url'] ?? '');

        if (! filter_var($url, FILTER_VALIDATE_URL)) {
            return 'Error: invalid URL provided.';
        }

        $scheme = strtolower(parse_url($url, PHP_URL_SCHEME) ?? '');
        if (! in_array($scheme, ['http', 'https'], true)) {
            return 'Error: only http and https URLs are supported.';
        }

        // Resolve the host to IPs and block private / reserved ranges (SSRF protection).
        // We resolve both A (IPv4) and AAAA (IPv6) records, validate every returned address,
        // and pin them all via CURLOPT_RESOLVE so the same IPs are used for both validation
        // and the actual connection, preventing DNS rebinding attacks.
        $host = parse_url($url, PHP_URL_HOST) ?? '';
        // parse_url() may return IPv6 literals with surrounding brackets (e.g. "[::1]");
        // strip them so FILTER_VALIDATE_IP can recognise the address.
        if (str_starts_with($host, '[') && str_ends_with($host, ']')) {
            $host = substr($host, 1, -1);
        }
        $port = (int) (parse_url($url, PHP_URL_PORT) ?? ($scheme === 'https' ? 443 : 80));

        $resolveEntries = [];

        if (filter_var($host, FILTER_VALIDATE_IP)) {
            if ($this->isPrivateIp($host)) {
                return 'Error: requests to private or reserved IP addresses are not allowed.';
            }
            $resolveEntries[] = "{$host}:{$port}:{$host}";
        } else {
            $records = @dns_get_record($host, DNS_A | DNS_AAAA);
            if ($records === false || empty($records)) {
                return 'Error: could not resolve host.';
            }
            foreach ($records as $record) {
                $ip = $record['ip'] ?? $record['ipv6'] ?? null;
                if ($ip === null) {
                    continue;
                }
                if ($this->isPrivateIp($ip)) {
                    return 'Error: requests to private or reserved IP addresses are not allowed.';
                }
                $resolveEntries[] = "{$host}:{$port}:{$ip}";
            }
            if (empty($resolveEntries)) {
                return 'Error: could not resolve host.';
            }
        }

        // Validate every redirect destination to prevent SSRF via 302 → internal host.
        $onRedirect = function (
            RequestInterface $req,
            ResponseInterface $res,
            UriInterface $uri
        ): void {
            $redirectHost = $uri->getHost();
            $redirectScheme = strtolower($uri->getScheme());
            if (! in_array($redirectScheme, ['http', 'https'], true)) {
                throw new \RuntimeException('Redirect to non-HTTP scheme blocked.');
            }
            if (filter_var($redirectHost, FILTER_VALIDATE_IP)) {
                if ($this->isPrivateIp($redirectHost)) {
                    throw new \RuntimeException('Redirect to private/reserved address blocked.');
                }
            } else {
                $records = @dns_get_record($redirectHost, DNS_A | DNS_AAAA);
                if ($records === false || empty($records)) {
                    throw new \RuntimeException('Redirect to unresolvable host blocked.');
                }
                foreach ($records as $record) {
                    $ip = $record['ip'] ?? $record['ipv6'] ?? null;
                    if ($ip !== null && $this->isPrivateIp($ip)) {
                        throw new \RuntimeException('Redirect to private/reserved address blocked.');
                    }
                }
            }
        };

        try {
            $response = Http::timeout(15)
                ->withHeaders(['User-Agent' => 'Mozilla/5.0 (compatible; Flowki/1.0)'])
                ->withOptions([
                    'allow_redirects' => [
                        'max' => 5,
                        'protocols' => ['http', 'https'],
                        'track_redirects' => false,
                        'on_redirect' => $onRedirect,
                    ],
                    // Pin initial hostname → IPs to prevent DNS rebinding on the first hop.
                    'curl' => [CURLOPT_RESOLVE => $resolveEntries],
                ])
                ->get($url);
        } catch (\Throwable $e) {
            return 'Error: could not fetch URL – '.$e->getMessage();
        }

        if (! $response->successful()) {
            return 'Error: URL returned HTTP '.$response->status().'.';
        }

        $contentType = $response->header('Content-Type') ?? '';
        if (! str_contains($contentType, 'text/html') && ! str_contains($contentType, 'text/plain')) {
            return 'Error: URL did not return an HTML or plain-text response.';
        }

        $html = $response->body();

        // Extract the og:image URL before stripping tags so ImportRecipe can save a photo.
        $imageUrl = null;
        if (preg_match('/<meta[^>]+property=["\']og:image["\'][^>]+content=["\']([^"\']+)["\'][^>]*>/i', $html, $m)
            || preg_match('/<meta[^>]+content=["\']([^"\']+)["\'][^>]+property=["\']og:image["\'][^>]*>/i', $html, $m)) {
            $candidate = trim($m[1]);
            if (filter_var($candidate, FILTER_VALIDATE_URL) && in_array(strtolower(parse_url($candidate, PHP_URL_SCHEME) ?? ''), ['http', 'https'], true)) {
                $imageUrl = $candidate;
            }
        }

        // Strip tags and normalise whitespace
        $text = strip_tags($html);
        $text = preg_replace('/\s+/', ' ', $text);
        $text = trim($text ?? '');

        // Truncate to keep within reasonable token limits
        if (strlen($text) > 8000) {
            $text = substr($text, 0, 8000).'…';
        }

        if ($text === '') {
            return 'Error: the page returned no readable content.';
        }

        // Prepend the image URL as a structured hint so the AI can pass it to ImportRecipe.
        if ($imageUrl !== null) {
            $text = "Recipe Image URL: {$imageUrl}\n\n".$text;
        }

        return $text;
    }

    /** @return array<string, JsonSchema> */
    public function schema(JsonSchema $schema): array
    {
        return [
            'url' => $schema->string()->description('The full URL of the web page to fetch')->required(),
        ];
    }
}
