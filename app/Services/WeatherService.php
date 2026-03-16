<?php

namespace App\Services;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class WeatherService
{
    private const CACHE_TTL = 1800; // 30 minutes

    private const UNITS = 'metric';

    private string $apiKey;

    private string $baseUrl;

    public function __construct(string $apiKey = '', string $baseUrl = 'https://api.openweathermap.org/data/2.5')
    {
        $this->apiKey = $apiKey ?: (string) config('services.openweathermap.key', '');
        $this->baseUrl = $baseUrl;
    }

    /**
     * Fetch current conditions and 5-day forecast for a location.
     *
     * Returns null when the API key is missing, the location is unknown,
     * or the request fails.  All errors are logged internally so the caller
     * can gracefully hide the widget.
     *
     * @return array{location: string, current: array<string, mixed>, forecast: list<array<string, mixed>>}|null
     */
    public function getWeather(string $locationName, ?float $latitude = null, ?float $longitude = null): ?array
    {
        if (empty($this->apiKey)) {
            return null;
        }

        $cacheKey = $this->buildCacheKey($locationName, $latitude, $longitude);

        return Cache::remember($cacheKey, self::CACHE_TTL, function () use ($locationName, $latitude, $longitude) {
            return $this->fetchWeather($locationName, $latitude, $longitude);
        });
    }

    /**
     * @return array{location: string, current: array<string, mixed>, forecast: list<array<string, mixed>>}|null
     */
    private function fetchWeather(string $locationName, ?float $latitude, ?float $longitude): ?array
    {
        try {
            $params = $this->buildQueryParams($locationName, $latitude, $longitude);

            $currentResponse = Http::timeout(10)->get("{$this->baseUrl}/weather", $params);
            $forecastResponse = Http::timeout(10)->get("{$this->baseUrl}/forecast", array_merge($params, ['cnt' => 40]));

            if ($currentResponse->failed() || $forecastResponse->failed()) {
                Log::warning('WeatherService: API request failed.', [
                    'location' => $locationName,
                    'current_status' => $currentResponse->status(),
                    'forecast_status' => $forecastResponse->status(),
                ]);

                return null;
            }

            $current = $currentResponse->json();
            $forecast = $forecastResponse->json();

            return [
                'location' => $current['name'] ?? $locationName,
                'current' => $this->parseCurrentWeather($current),
                'forecast' => $this->parseForecast($forecast),
            ];
        } catch (\Throwable $e) {
            Log::error('WeatherService: unexpected error.', [
                'location' => $locationName,
                'error' => $e->getMessage(),
            ]);

            return null;
        }
    }

    /**
     * @return array<string, mixed>
     */
    private function parseCurrentWeather(mixed $data): array
    {
        return [
            'temp' => round((float) ($data['main']['temp'] ?? 0)),
            'feels_like' => round((float) ($data['main']['feels_like'] ?? 0)),
            'description' => ucfirst((string) ($data['weather'][0]['description'] ?? '')),
            'icon' => (string) ($data['weather'][0]['icon'] ?? ''),
            'humidity' => (int) ($data['main']['humidity'] ?? 0),
            'wind_speed' => round((float) ($data['wind']['speed'] ?? 0), 1),
        ];
    }

    /**
     * Collapse 3-hour intervals into daily summaries (up to 5 days).
     *
     * @return list<array<string, mixed>>
     */
    private function parseForecast(mixed $data): array
    {
        $byDay = [];

        foreach ((array) ($data['list'] ?? []) as $item) {
            $date = date('Y-m-d', (int) ($item['dt'] ?? 0));

            if (! isset($byDay[$date])) {
                $byDay[$date] = [
                    'date' => $date,
                    'temp_min' => (float) ($item['main']['temp_min'] ?? 0),
                    'temp_max' => (float) ($item['main']['temp_max'] ?? 0),
                    'description' => ucfirst((string) ($item['weather'][0]['description'] ?? '')),
                    'icon' => (string) ($item['weather'][0]['icon'] ?? ''),
                ];
            } else {
                $byDay[$date]['temp_min'] = min($byDay[$date]['temp_min'], (float) ($item['main']['temp_min'] ?? 0));
                $byDay[$date]['temp_max'] = max($byDay[$date]['temp_max'], (float) ($item['main']['temp_max'] ?? 0));
            }
        }

        return array_values(array_slice(
            array_map(fn ($d) => array_merge($d, [
                'temp_min' => round($d['temp_min']),
                'temp_max' => round($d['temp_max']),
            ]), $byDay),
            0,
            5
        ));
    }

    /**
     * @return array<string, mixed>
     */
    private function buildQueryParams(string $locationName, ?float $latitude, ?float $longitude): array
    {
        $params = ['appid' => $this->apiKey, 'units' => self::UNITS];

        if ($latitude !== null && $longitude !== null) {
            $params['lat'] = $latitude;
            $params['lon'] = $longitude;
        } else {
            $params['q'] = $locationName;
        }

        return $params;
    }

    private function buildCacheKey(string $locationName, ?float $latitude, ?float $longitude): string
    {
        $identifier = ($latitude !== null && $longitude !== null)
            ? "lat_{$latitude}_lon_{$longitude}"
            : 'loc_'.md5($locationName);

        return "weather:{$identifier}";
    }
}
