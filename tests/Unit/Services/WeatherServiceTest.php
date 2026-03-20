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

    private function forecastPayload(): array
    {
        return [
            'currentConditions' => [
                'weatherCondition' => [
                    'iconBaseUri' => 'https://maps.gstatic.com/weather/v1/rain',
                    'description' => ['text' => 'Light rain'],
                    'type' => 'RAIN',
                ],
                'temperature' => ['degrees' => 15.3, 'unit' => 'CELSIUS'],
                'feelsLikeTemperature' => ['degrees' => 13.1, 'unit' => 'CELSIUS'],
                'relativeHumidity' => 72,
                'wind' => [
                    'speed' => ['value' => 14.5, 'unit' => 'KILOMETERS_PER_HOUR'],
                    'direction' => ['degrees' => 270],
                ],
                'uvIndex' => 1,
            ],
            'forecastDays' => [
                [
                    'interval' => ['startTime' => '2026-03-17T05:00:00Z', 'duration' => '86400s'],
                    'daytimeForecast' => [
                        'weatherCondition' => [
                            'iconBaseUri' => 'https://maps.gstatic.com/weather/v1/clear',
                            'description' => ['text' => 'Clear sky'],
                            'type' => 'CLEAR',
                        ],
                    ],
                    'maxTemperature' => ['degrees' => 18.0, 'unit' => 'CELSIUS'],
                    'minTemperature' => ['degrees' => 10.0, 'unit' => 'CELSIUS'],
                ],
                [
                    'interval' => ['startTime' => '2026-03-18T05:00:00Z', 'duration' => '86400s'],
                    'daytimeForecast' => [
                        'weatherCondition' => [
                            'iconBaseUri' => 'https://maps.gstatic.com/weather/v1/cloudy',
                            'description' => ['text' => 'Cloudy'],
                            'type' => 'CLOUDY',
                        ],
                    ],
                    'maxTemperature' => ['degrees' => 16.0, 'unit' => 'CELSIUS'],
                    'minTemperature' => ['degrees' => 9.0, 'unit' => 'CELSIUS'],
                ],
            ],
        ];
    }

    public function test_returns_null_when_api_key_is_empty(): void
    {
        $service = new WeatherService('');

        $this->assertNull($service->getWeather('London', 51.5074, -0.1278));
    }

    public function test_returns_null_when_coordinates_are_missing(): void
    {
        $service = new WeatherService('fake-key');

        $this->assertNull($service->getWeather('London'));
    }

    public function test_returns_null_when_api_request_fails(): void
    {
        Http::fake([
            '*' => Http::response([], 500),
        ]);

        $service = new WeatherService('fake-key');
        Cache::flush();

        $result = $service->getWeather('London', 51.5074, -0.1278);

        $this->assertNull($result);
    }

    public function test_returns_weather_data_on_success(): void
    {
        Http::fake([
            'weather.googleapis.com/*' => Http::response($this->forecastPayload(), 200),
        ]);

        $service = new WeatherService('fake-key');
        Cache::flush();

        $result = $service->getWeather('London', 51.5074, -0.1278);

        $this->assertNotNull($result);
        $this->assertEquals('London', $result['location']);
        $this->assertArrayHasKey('current', $result);
        $this->assertArrayHasKey('forecast', $result);
        $this->assertEquals(15, $result['current']['temp']);
        $this->assertEquals('Light rain', $result['current']['description']);
        $this->assertEquals(72, $result['current']['humidity']);
        $this->assertEquals('https://maps.gstatic.com/weather/v1/rain.png', $result['current']['icon_url']);
    }

    public function test_parses_forecast_days_correctly(): void
    {
        Http::fake([
            'weather.googleapis.com/*' => Http::response($this->forecastPayload(), 200),
        ]);

        $service = new WeatherService('fake-key');
        Cache::flush();

        $result = $service->getWeather('London', 51.5074, -0.1278);

        $this->assertNotNull($result);
        $this->assertCount(2, $result['forecast']);
        $this->assertEquals('2026-03-17', $result['forecast'][0]['date']);
        $this->assertEquals(18, $result['forecast'][0]['temp_max']);
        $this->assertEquals(10, $result['forecast'][0]['temp_min']);
        $this->assertEquals('Clear sky', $result['forecast'][0]['description']);
        $this->assertEquals('https://maps.gstatic.com/weather/v1/clear.png', $result['forecast'][0]['icon_url']);
    }

    public function test_caches_result_and_serves_from_cache(): void
    {
        Http::fake([
            'weather.googleapis.com/*' => Http::response($this->forecastPayload(), 200),
        ]);

        $service = new WeatherService('fake-key');
        Cache::flush();

        // First call hits the HTTP API
        $first = $service->getWeather('London', 51.5074, -0.1278);

        // Second call should be served from cache (returning same data even with failing HTTP)
        Http::fake([
            '*' => Http::response([], 500),
        ]);

        $second = $service->getWeather('London', 51.5074, -0.1278);

        $this->assertEquals($first, $second);
    }

    public function test_uses_lat_lon_params_in_request(): void
    {
        Http::fake([
            'weather.googleapis.com/*' => Http::response($this->forecastPayload(), 200),
        ]);

        $service = new WeatherService('fake-key');
        Cache::flush();

        $result = $service->getWeather('London', 51.5074, -0.1278);

        $this->assertNotNull($result);

        Http::assertSent(function ($request) {
            return str_contains($request->url(), 'location.latitude=') &&
                str_contains($request->url(), 'location.longitude=');
        });
    }

    public function test_returns_null_and_logs_on_exception(): void
    {
        Http::fake(function () {
            throw new \RuntimeException('Connection refused');
        });

        $service = new WeatherService('fake-key');
        Cache::flush();

        $result = $service->getWeather('London', 51.5074, -0.1278);

        $this->assertNull($result);
    }
}
