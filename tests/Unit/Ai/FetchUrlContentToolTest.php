<?php

namespace Tests\Unit\Ai;

use App\Ai\Tools\FetchUrlContent;
use App\Models\User;
use Illuminate\Contracts\JsonSchema\JsonSchema;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Laravel\Ai\Tools\Request;
use Mockery\MockInterface;
use Tests\TestCase;

class FetchUrlContentToolTest extends TestCase
{
    use RefreshDatabase;

    /** A routable, non-private IP used in tests to bypass DNS resolution. */
    private const PUBLIC_IP = '1.2.3.4';

    private function makeTool(): FetchUrlContent
    {
        return new FetchUrlContent(User::factory()->withFamily()->create());
    }

    public function test_handle_returns_page_text_on_success(): void
    {
        Http::fake([
            '*' => Http::response('<html><body>  Hello   World  </body></html>', 200, ['Content-Type' => 'text/html']),
        ]);

        $result = $this->makeTool()->handle(new Request(['url' => 'http://'.self::PUBLIC_IP.'/']));

        $this->assertStringContainsString('Hello', $result);
        $this->assertStringContainsString('World', $result);
    }

    public function test_handle_truncates_long_content(): void
    {
        $longContent = str_repeat('a', 9000);
        Http::fake([
            '*' => Http::response("<html><body>{$longContent}</body></html>", 200, ['Content-Type' => 'text/html']),
        ]);

        $result = $this->makeTool()->handle(new Request(['url' => 'http://'.self::PUBLIC_IP.'/']));

        $this->assertLessThanOrEqual(8010, strlen($result)); // 8000 chars + ellipsis
        $this->assertStringEndsWith('…', $result);
    }

    public function test_handle_returns_error_for_invalid_url(): void
    {
        $result = $this->makeTool()->handle(new Request(['url' => 'not-a-url']));

        $this->assertStringContainsString('Error', $result);
        $this->assertStringContainsString('invalid URL', $result);
    }

    public function test_handle_returns_error_for_non_http_scheme(): void
    {
        $result = $this->makeTool()->handle(new Request(['url' => 'ftp://example.com/file.txt']));

        $this->assertStringContainsString('Error', $result);
        $this->assertStringContainsString('http', $result);
    }

    public function test_handle_blocks_private_ipv4_address(): void
    {
        $result = $this->makeTool()->handle(new Request(['url' => 'http://192.168.1.100/']));

        $this->assertStringContainsString('Error', $result);
        $this->assertStringContainsString('private', $result);
    }

    public function test_handle_blocks_loopback_address(): void
    {
        $result = $this->makeTool()->handle(new Request(['url' => 'http://127.0.0.1/']));

        $this->assertStringContainsString('Error', $result);
        $this->assertStringContainsString('private', $result);
    }

    public function test_handle_blocks_private_ipv6_address(): void
    {
        $result = $this->makeTool()->handle(new Request(['url' => 'http://[::1]/']));

        $this->assertStringContainsString('Error', $result);
        $this->assertStringContainsString('private', $result);
    }

    public function test_handle_returns_error_for_non_html_content_type(): void
    {
        Http::fake([
            '*' => Http::response('{"data":1}', 200, ['Content-Type' => 'application/json']),
        ]);

        $result = $this->makeTool()->handle(new Request(['url' => 'http://'.self::PUBLIC_IP.'/data.json']));

        $this->assertStringContainsString('Error', $result);
        $this->assertStringContainsString('HTML', $result);
    }

    public function test_handle_returns_error_for_non_2xx_response(): void
    {
        Http::fake([
            '*' => Http::response('Not Found', 404, ['Content-Type' => 'text/html']),
        ]);

        $result = $this->makeTool()->handle(new Request(['url' => 'http://'.self::PUBLIC_IP.'/missing']));

        $this->assertStringContainsString('Error', $result);
        $this->assertStringContainsString('404', $result);
    }

    public function test_handle_returns_error_for_empty_body(): void
    {
        Http::fake([
            '*' => Http::response('<html><body>   </body></html>', 200, ['Content-Type' => 'text/html']),
        ]);

        $result = $this->makeTool()->handle(new Request(['url' => 'http://'.self::PUBLIC_IP.'/empty']));

        $this->assertStringContainsString('Error', $result);
        $this->assertStringContainsString('no readable content', $result);
    }

    public function test_handle_blocks_hostname_resolving_to_private_ip(): void
    {
        // 'localhost' resolves to 127.0.0.1 (loopback), which must be rejected via DNS path.
        $result = $this->makeTool()->handle(new Request(['url' => 'http://localhost/']));

        $this->assertStringContainsString('Error', $result);
    }

    public function test_handle_extracts_og_image_and_prepends_as_recipe_image_url(): void
    {
        $html = <<<'HTML'
            <html><head>
                <meta property="og:image" content="https://example.com/image.jpg" />
            </head><body>Delicious pasta recipe</body></html>
            HTML;

        Http::fake([
            '*' => Http::response($html, 200, ['Content-Type' => 'text/html']),
        ]);

        $result = $this->makeTool()->handle(new Request(['url' => 'http://'.self::PUBLIC_IP.'/recipe']));

        $this->assertStringContainsString('Recipe Image URL: https://example.com/image.jpg', $result);
        $this->assertStringContainsString('Delicious pasta recipe', $result);
    }

    public function test_handle_extracts_og_image_with_content_before_property(): void
    {
        $html = <<<'HTML'
            <html><head>
                <meta content="https://example.com/photo.png" property="og:image" />
            </head><body>Another recipe</body></html>
            HTML;

        Http::fake([
            '*' => Http::response($html, 200, ['Content-Type' => 'text/html']),
        ]);

        $result = $this->makeTool()->handle(new Request(['url' => 'http://'.self::PUBLIC_IP.'/recipe2']));

        $this->assertStringContainsString('Recipe Image URL: https://example.com/photo.png', $result);
    }

    public function test_handle_ignores_invalid_og_image_url(): void
    {
        $html = <<<'HTML'
            <html><head>
                <meta property="og:image" content="not-a-valid-url" />
            </head><body>Some recipe content</body></html>
            HTML;

        Http::fake([
            '*' => Http::response($html, 200, ['Content-Type' => 'text/html']),
        ]);

        $result = $this->makeTool()->handle(new Request(['url' => 'http://'.self::PUBLIC_IP.'/recipe3']));

        $this->assertStringNotContainsString('Recipe Image URL:', $result);
        $this->assertStringContainsString('Some recipe content', $result);
    }

    public function test_handle_blocks_redirect_to_unresolvable_host(): void
    {
        // A hostname that cannot be resolved must be blocked even in a redirect context.
        // We verify the initial host check rejects unresolvable names fail-closed.
        $result = $this->makeTool()->handle(new Request(['url' => 'http://this-host-definitely-does-not-exist.invalid/']));

        $this->assertStringContainsString('Error', $result);
    }

    public function test_handle_extracts_recipe_from_json_ld(): void
    {
        $html = <<<'HTML'
            <html><head>
                <script type="application/ld+json">
                {
                    "@context": "http://schema.org/",
                    "@type": "Recipe",
                    "name": "Spaghetti Carbonara",
                    "description": "A classic Italian pasta dish.",
                    "recipeYield": "4 servings",
                    "prepTime": "PT10M",
                    "cookTime": "PT20M",
                    "image": "https://example.com/carbonara.jpg",
                    "recipeIngredient": ["200g spaghetti", "100g pancetta", "2 eggs"],
                    "recipeInstructions": [
                        {"@type": "HowToStep", "text": "Boil the pasta."},
                        {"@type": "HowToStep", "text": "Fry the pancetta."},
                        {"@type": "HowToStep", "text": "Mix eggs and cheese."}
                    ]
                }
                </script>
            </head><body>Some page content</body></html>
            HTML;

        Http::fake([
            '*' => Http::response($html, 200, ['Content-Type' => 'text/html']),
        ]);

        $result = $this->makeTool()->handle(new Request(['url' => 'http://'.self::PUBLIC_IP.'/recipe']));

        $this->assertStringContainsString('Recipe Image URL: https://example.com/carbonara.jpg', $result);
        $this->assertStringContainsString('Spaghetti Carbonara', $result);
        $this->assertStringContainsString('200g spaghetti', $result);
        $this->assertStringContainsString('100g pancetta', $result);
        $this->assertStringContainsString('Boil the pasta.', $result);
        $this->assertStringContainsString('Fry the pancetta.', $result);
        $this->assertStringContainsString('10', $result); // prep time minutes
        $this->assertStringContainsString('20', $result); // cook time minutes
    }

    public function test_handle_extracts_recipe_from_json_ld_graph(): void
    {
        $html = <<<'HTML'
            <html><head>
                <script type="application/ld+json">
                {
                    "@context": "http://schema.org/",
                    "@graph": [
                        {"@type": "WebPage", "name": "My Blog"},
                        {
                            "@type": "Recipe",
                            "name": "Chocolate Cake",
                            "recipeIngredient": ["200g flour", "150g sugar"],
                            "recipeInstructions": "Mix everything and bake at 180°C for 30 minutes."
                        }
                    ]
                }
                </script>
            </head><body>Blog post content</body></html>
            HTML;

        Http::fake([
            '*' => Http::response($html, 200, ['Content-Type' => 'text/html']),
        ]);

        $result = $this->makeTool()->handle(new Request(['url' => 'http://'.self::PUBLIC_IP.'/blog/recipe']));

        $this->assertStringContainsString('Chocolate Cake', $result);
        $this->assertStringContainsString('200g flour', $result);
        $this->assertStringContainsString('Mix everything', $result);
    }

    public function test_handle_falls_back_to_structured_text_when_no_json_ld(): void
    {
        $html = <<<'HTML'
            <html><body>
                <h2>Ingredients</h2>
                <ul>
                    <li>2 cups flour</li>
                    <li>1 cup sugar</li>
                </ul>
                <h2>Instructions</h2>
                <ol>
                    <li>Mix dry ingredients.</li>
                    <li>Add wet ingredients.</li>
                </ol>
            </body></html>
            HTML;

        Http::fake([
            '*' => Http::response($html, 200, ['Content-Type' => 'text/html']),
        ]);

        $result = $this->makeTool()->handle(new Request(['url' => 'http://'.self::PUBLIC_IP.'/simple-recipe']));

        $this->assertStringContainsString('2 cups flour', $result);
        $this->assertStringContainsString('1 cup sugar', $result);
        $this->assertStringContainsString('Mix dry ingredients.', $result);
    }

    public function test_description_is_not_empty(): void
    {
        $this->assertNotEmpty($this->makeTool()->description());
    }

    public function test_schema_contains_url_field(): void
    {
        /** @var JsonSchema&MockInterface $schema */
        $schema = \Mockery::mock(JsonSchema::class);
        $schema->shouldReceive('string')->andReturnSelf()->zeroOrMoreTimes();
        $schema->shouldReceive('description')->andReturnSelf()->zeroOrMoreTimes();
        $schema->shouldReceive('required')->andReturnSelf()->zeroOrMoreTimes();

        $fields = $this->makeTool()->schema($schema);

        $this->assertArrayHasKey('url', $fields);
    }
}
