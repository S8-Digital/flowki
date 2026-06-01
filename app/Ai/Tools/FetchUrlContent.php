<?php

namespace App\Ai\Tools;

use App\Models\User;
use Illuminate\Contracts\JsonSchema\JsonSchema;
use Illuminate\Support\Facades\Http;
use Laravel\Ai\Contracts\Tool;
use Laravel\Ai\Tools\Request;

class FetchUrlContent implements Tool
{
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
        // Redirects are disabled to prevent SSRF via 302 responses pointing at internal hosts.
        $host = parse_url($url, PHP_URL_HOST) ?? '';
        $port = (int) (parse_url($url, PHP_URL_PORT) ?? ($scheme === 'https' ? 443 : 80));

        $resolveEntries = [];

        if (filter_var($host, FILTER_VALIDATE_IP)) {
            // Host is already an IP literal (IPv4 or IPv6) — validate it directly.
            if ($this->isPrivateIp($host)) {
                return 'Error: requests to private or reserved IP addresses are not allowed.';
            }
            $resolveEntries[] = "{$host}:{$port}:{$host}";
        } else {
            // dns_get_record() returns false on hard DNS failure; treat that the same as no records.
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

        try {
            $response = Http::timeout(15)
                ->withHeaders(['User-Agent' => 'Mozilla/5.0 (compatible; Flowki/1.0)'])
                ->withOptions([
                    // Disable redirects to prevent SSRF via 302 to internal addresses.
                    'allow_redirects' => false,
                    // Pin hostname → IPs (all A/AAAA records) to prevent DNS rebinding;
                    // TLS still validates the hostname.
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

        // Strip tags and normalise whitespace
        $text = strip_tags($response->body());
        $text = preg_replace('/\s+/', ' ', $text);
        $text = trim($text ?? '');

        // Truncate to keep within reasonable token limits
        if (strlen($text) > 8000) {
            $text = substr($text, 0, 8000).'…';
        }

        if ($text === '') {
            return 'Error: the page returned no readable content.';
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

    private function isPrivateIp(string $ip): bool
    {
        if (! filter_var($ip, FILTER_VALIDATE_IP)) {
            return true; // Cannot resolve — block it
        }

        return ! filter_var(
            $ip,
            FILTER_VALIDATE_IP,
            FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE,
        );
    }
}
