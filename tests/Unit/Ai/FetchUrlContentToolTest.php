<?php

namespace Tests\Unit\Ai;

use App\Ai\Tools\FetchUrlContent;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Laravel\Ai\Tools\Request;
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

    public function test_description_is_not_empty(): void
    {
        $this->assertNotEmpty($this->makeTool()->description());
    }

    public function test_schema_contains_url_field(): void
    {
        /** @var \Illuminate\Contracts\JsonSchema\JsonSchema&\Mockery\MockInterface $schema */
        $schema = \Mockery::mock(\Illuminate\Contracts\JsonSchema\JsonSchema::class);
        $schema->shouldReceive('string')->andReturnSelf()->zeroOrMoreTimes();
        $schema->shouldReceive('description')->andReturnSelf()->zeroOrMoreTimes();
        $schema->shouldReceive('required')->andReturnSelf()->zeroOrMoreTimes();

        $fields = $this->makeTool()->schema($schema);

        $this->assertArrayHasKey('url', $fields);
    }
}
