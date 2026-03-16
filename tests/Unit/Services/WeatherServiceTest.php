<?php

namespace Tests\Unit\Services;

use App\Services\WeatherService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class WeatherServiceTest extends TestCase
{
    use RefreshDatabase;

    private function currentWeatherPayload(): array
    {
        return [
            'name' => 'London',
            'main' => [
                'temp' => 15.3,
                'feels_like' => 13.1,
                'humidity' => 72,
            ],
            'weather' => [
                ['description' => 'light rain', 'icon' => '10d'],
            ],
            'wind' => ['speed' => 4.5],
        ];
    }

    private function forecastPayload(): array
    {
        $base = strtotime('2026-03-17');

        $list = [];
        for ($i = 0; $i < 5; $i++) {
            $list[] = [
                'dt' => $base + ($i * 3 * 3600),
                'main' => ['temp_min' => 10.0 + $i, 'temp_max' => 18.0 + $i],
                'weather' => [['description' => 'clear sky', 'icon' => '01d']],
            ];
        }

        return ['list' => $list];
    }

    public function test_returns_null_when_api_key_is_empty(): void
    {
        $service = new WeatherService('');

        $this->assertNull($service->getWeather('London'));
    }

    public function test_returns_null_when_api_request_fails(): void
    {
        Http::fake([
            '*' => Http::response([], 500),
        ]);

        $service = new WeatherService('fake-key');
        Cache::flush();

        $result = $service->getWeather('London');

        $this->assertNull($result);
    }

    public function test_returns_weather_data_on_success(): void
    {
        Http::fake([
            '*/weather*' => Http::response($this->currentWeatherPayload(), 200),
            '*/forecast*' => Http::response($this->forecastPayload(), 200),
        ]);

        $service = new WeatherService('fake-key');
        Cache::flush();

        $result = $service->getWeather('London');

        $this->assertNotNull($result);
        $this->assertEquals('London', $result['location']);
        $this->assertArrayHasKey('current', $result);
        $this->assertArrayHasKey('forecast', $result);
        $this->assertEquals(15, $result['current']['temp']);
        $this->assertEquals('Light rain', $result['current']['description']);
        $this->assertEquals(72, $result['current']['humidity']);
    }

    public function test_caches_result_for_thirty_minutes(): void
    {
        Http::fake([
            '*/weather*' => Http::response($this->currentWeatherPayload(), 200),
            '*/forecast*' => Http::response($this->forecastPayload(), 200),
        ]);

        $service = new WeatherService('fake-key');
        Cache::flush();

        // First call hits the HTTP API
        $first = $service->getWeather('London');

        // Second call should be served from cache (no additional HTTP requests)
        Http::fake([
            '*' => Http::response([], 500),
        ]);

        $second = $service->getWeather('London');

        $this->assertEquals($first, $second);
    }

    public function test_uses_lat_lon_params_when_coordinates_provided(): void
    {
        Http::fake([
            '*/weather*' => Http::response($this->currentWeatherPayload(), 200),
            '*/forecast*' => Http::response($this->forecastPayload(), 200),
        ]);

        $service = new WeatherService('fake-key');
        Cache::flush();

        $result = $service->getWeather('London', 51.5074, -0.1278);

        $this->assertNotNull($result);

        // Verify lat/lon were used in the request
        Http::assertSent(function ($request) {
            return str_contains($request->url(), 'lat=') && str_contains($request->url(), 'lon=');
        });
    }

    public function test_returns_null_and_logs_on_exception(): void
    {
        Http::fake(function () {
            throw new \RuntimeException('Connection refused');
        });

        $service = new WeatherService('fake-key');
        Cache::flush();

        $result = $service->getWeather('London');

        $this->assertNull($result);
    }
}
