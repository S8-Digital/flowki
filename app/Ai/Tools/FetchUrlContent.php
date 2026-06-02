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
        $ogImageUrl = null;
        if (preg_match('/<meta[^>]+property=["\']og:image["\'][^>]+content=["\']([^"\']+)["\'][^>]*>/i', $html, $m)
            || preg_match('/<meta[^>]+content=["\']([^"\']+)["\'][^>]+property=["\']og:image["\'][^>]*>/i', $html, $m)) {
            $candidate = trim($m[1]);
            if (filter_var($candidate, FILTER_VALIDATE_URL) && in_array(strtolower(parse_url($candidate, PHP_URL_SCHEME) ?? ''), ['http', 'https'], true)) {
                $ogImageUrl = $candidate;
            }
        }

        // Prefer structured JSON-LD recipe data when available.
        $jsonLdText = $this->extractJsonLdRecipe($html, $ogImageUrl);
        if ($jsonLdText !== null) {
            // Truncate to keep within reasonable token limits.
            if (strlen($jsonLdText) > 8000) {
                $jsonLdText = substr($jsonLdText, 0, 8000).'…';
            }

            return $jsonLdText;
        }

        // Fall back to a structure-preserving HTML → plain-text conversion.
        $text = $this->htmlToStructuredText($html);

        // Truncate to keep within reasonable token limits
        if (strlen($text) > 8000) {
            $text = substr($text, 0, 8000).'…';
        }

        if ($text === '') {
            return 'Error: the page returned no readable content.';
        }

        // Prepend the image URL as a structured hint so the AI can pass it to ImportRecipe.
        if ($ogImageUrl !== null) {
            $text = "Recipe Image URL: {$ogImageUrl}\n\n".$text;
        }

        return $text;
    }

    /**
     * Try to find a schema.org/Recipe node in any JSON-LD block on the page.
     * Returns a pre-formatted text representation ready for the AI, or null if none found.
     */
    private function extractJsonLdRecipe(string $html, ?string $fallbackImageUrl): ?string
    {
        preg_match_all('/<script[^>]+type=["\']application\/ld\+json["\'][^>]*>(.*?)<\/script>/si', $html, $matches);

        foreach ($matches[1] as $jsonBlock) {
            $data = json_decode(trim($jsonBlock), true);
            if (! is_array($data)) {
                continue;
            }

            // Some pages wrap everything in an @graph array or as a top-level array.
            if (isset($data['@graph']) && is_array($data['@graph'])) {
                $items = $data['@graph'];
            } elseif (array_is_list($data)) {
                $items = $data;
            } else {
                $items = [$data];
            }

            foreach ($items as $item) {
                if (! is_array($item)) {
                    continue;
                }
                $type = $item['@type'] ?? '';
                if ($type === 'Recipe' || (is_array($type) && in_array('Recipe', $type, true))) {
                    return $this->formatJsonLdRecipe($item, $fallbackImageUrl);
                }
            }
        }

        return null;
    }

    /** @param array<string, mixed> $recipe */
    private function formatJsonLdRecipe(array $recipe, ?string $fallbackImageUrl): string
    {
        $lines = [];

        // Image URL — prefer JSON-LD over og:image.
        $imageUrl = $this->imageFromJsonLd($recipe) ?? $fallbackImageUrl;
        if ($imageUrl !== null) {
            $lines[] = "Recipe Image URL: {$imageUrl}";
            $lines[] = '';
        }

        if (! empty($recipe['name'])) {
            $lines[] = 'Title: '.strip_tags((string) $recipe['name']);
        }

        if (! empty($recipe['description'])) {
            $lines[] = 'Description: '.strip_tags((string) $recipe['description']);
        }

        if (! empty($recipe['recipeCategory'])) {
            $cat = is_array($recipe['recipeCategory'])
                ? implode(', ', $recipe['recipeCategory'])
                : $recipe['recipeCategory'];
            $lines[] = 'Category: '.strip_tags((string) $cat);
        }

        if (! empty($recipe['recipeYield'])) {
            $yield = is_array($recipe['recipeYield']) ? ($recipe['recipeYield'][0] ?? '') : $recipe['recipeYield'];
            $lines[] = 'Servings: '.strip_tags((string) $yield);
        }

        if (! empty($recipe['prepTime'])) {
            $mins = $this->isoDurationToMinutes((string) $recipe['prepTime']);
            if ($mins > 0) {
                $lines[] = "Prep time: {$mins} minutes";
            }
        }

        if (! empty($recipe['cookTime'])) {
            $mins = $this->isoDurationToMinutes((string) $recipe['cookTime']);
            if ($mins > 0) {
                $lines[] = "Cook time: {$mins} minutes";
            }
        }

        // Ingredients
        if (! empty($recipe['recipeIngredient']) && is_array($recipe['recipeIngredient'])) {
            $lines[] = '';
            $lines[] = 'Ingredients:';
            foreach ($recipe['recipeIngredient'] as $ingredient) {
                $lines[] = '- '.strip_tags((string) $ingredient);
            }
        }

        // Instructions
        if (! empty($recipe['recipeInstructions'])) {
            $lines[] = '';
            $lines[] = 'Instructions:';
            $instructions = $recipe['recipeInstructions'];

            if (is_string($instructions)) {
                $lines[] = strip_tags($instructions);
            } elseif (is_array($instructions)) {
                $step = 1;
                foreach ($instructions as $instruction) {
                    $text = '';
                    if (is_string($instruction)) {
                        $text = strip_tags($instruction);
                    } elseif (is_array($instruction)) {
                        $text = strip_tags((string) ($instruction['text'] ?? $instruction['name'] ?? ''));
                    }
                    $text = trim($text);
                    if ($text !== '') {
                        $lines[] = "{$step}. {$text}";
                        $step++;
                    }
                }
            }
        }

        return implode("\n", $lines);
    }

    /** @param array<string, mixed> $recipe */
    private function imageFromJsonLd(array $recipe): ?string
    {
        $image = $recipe['image'] ?? null;
        if ($image === null) {
            return null;
        }

        $candidates = is_array($image) ? $image : [$image];

        foreach ($candidates as $candidate) {
            $url = null;
            if (is_string($candidate)) {
                $url = $candidate;
            } elseif (is_array($candidate)) {
                $url = $candidate['url'] ?? $candidate['@id'] ?? null;
                $url = is_string($url) ? $url : null;
            }

            if ($url !== null
                && filter_var($url, FILTER_VALIDATE_URL)
                && in_array(strtolower(parse_url($url, PHP_URL_SCHEME) ?? ''), ['http', 'https'], true)) {
                return $url;
            }
        }

        return null;
    }

    /** Convert an ISO 8601 duration (PT15M, PT1H30M, …) to total minutes. */
    private function isoDurationToMinutes(string $duration): int
    {
        if (preg_match('/PT(?:(\d+)H)?(?:(\d+)M)?/i', $duration, $m)) {
            return ((int) ($m[1] ?? 0)) * 60 + (int) ($m[2] ?? 0);
        }

        return 0;
    }

    /**
     * Convert HTML to plain text while preserving list and paragraph structure
     * so the AI can better identify recipe sections without JSON-LD.
     */
    private function htmlToStructuredText(string $html): string
    {
        // List items become "- item"
        $text = preg_replace('/<li[^>]*>/i', "\n- ", $html) ?? $html;
        // Block-level elements become newlines
        $text = preg_replace('/<\/?(p|div|section|article|header|footer|main|h[1-6]|ul|ol|blockquote|br|tr)[^>]*>/i', "\n", $text) ?? $text;
        // Strip remaining tags
        $text = strip_tags($text);
        // Normalise horizontal whitespace
        $text = preg_replace('/[ \t]+/', ' ', $text) ?? $text;
        // Remove spaces around newlines
        $text = preg_replace('/[ \t]*\n[ \t]*/', "\n", $text) ?? $text;
        // Collapse excess blank lines
        $text = preg_replace('/\n{3,}/', "\n\n", $text) ?? $text;

        return trim($text);
    }

    /** @return array<string, JsonSchema> */
    public function schema(JsonSchema $schema): array
    {
        return [
            'url' => $schema->string()->description('The full URL of the web page to fetch')->required(),
        ];
    }
}
