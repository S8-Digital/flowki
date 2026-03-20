<?php

namespace App\Services;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class WeatherService
{
    private const CACHE_TTL = 900; // 15 minutes

    private const BASE_URL = 'https://weather.googleapis.com/v1/currentConditions:lookup';

    private const FORECAST_URL = 'https://weather.googleapis.com/v1/forecast/days:lookup';

    private const FORECAST_DAYS = 10;

    private string $apiKey;

    public function __construct(string $apiKey = '')
    {
        $this->apiKey = $apiKey ?: (string) config('services.google.weather_key', '');
    }

    /**
     * Fetch current conditions and 7-day forecast for a location.
     *
     * Returns null when the API key is missing, coordinates are unavailable,
     * or the upstream request fails — callers should gracefully hide the widget.
     *
     * @return array{location: string, current: array<string, mixed>, forecast: list<array<string, mixed>>}|null
     */
    public function getWeather(string $locationName, ?float $latitude = null, ?float $longitude = null): ?array
    {
        if (empty($this->apiKey) || $latitude === null || $longitude === null) {
            return null;
        }

        $cacheKey = "weather_forecast:lat_{$latitude}_lon_{$longitude}";

        return Cache::remember($cacheKey, self::CACHE_TTL, function () use ($locationName, $latitude, $longitude) {
            return $this->fetchWeather($locationName, $latitude, $longitude);
        });
    }

    /**
     * @return array{location: string, current: array<string, mixed>, forecast: list<array<string, mixed>>}|null
     */
    private function fetchWeather(string $locationName, float $latitude, float $longitude): ?array
    {
        try {
            $current = Http::timeout(10)->get(self::BASE_URL, [
                'key' => $this->apiKey,
                'location.latitude' => $latitude,
                'location.longitude' => $longitude,
                'unitsSystem' => 'METRIC',
            ]);

            $forecast = Http::timeout(10)->get(self::FORECAST_URL, [
                'key' => $this->apiKey,
                'location.latitude' => $latitude,
                'location.longitude' => $longitude,
                'unitsSystem' => 'METRIC',
                'days' => self::FORECAST_DAYS,
                'pageSize' => self::FORECAST_DAYS,
            ]);

            if ($current->failed()) {
                Log::warning('WeatherService: Google Weather API request failed.', [
                    'location' => $locationName,
                    'status' => $current->status(),
                    'body' => $current->body(),
                ]);

                return null;
            }

            if ($forecast->failed()) {
                Log::warning('WeatherService: forecast request failed.', [
                    'location' => $locationName,
                    'status' => $forecast->status(),
                    'body' => $forecast->body(),
                ]);

                return null;
            }

            $currentPayload = $current->json();
            $forecastPayload = $forecast->json();

            return [
                'location' => $locationName,
                'current' => $this->parseCurrentConditions($currentPayload ?? []),
                'forecast' => $this->parseForecastDays($forecastPayload['forecastDays'] ?? []),
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
     * @param  array<string, mixed>  $conditions
     * @return array<string, mixed>
     */
    private function parseCurrentConditions(array $conditions): array
    {
        $iconBase = (string) ($conditions['weatherCondition']['iconBaseUri'] ?? '');

        return [
            'temp' => (int) round((float) ($conditions['temperature']['degrees'] ?? 0)),
            'feels_like' => (int) round((float) ($conditions['feelsLikeTemperature']['degrees'] ?? 0)),
            'description' => (string) ($conditions['weatherCondition']['description']['text'] ?? ''),
            'icon_url' => $iconBase !== '' ? "{$iconBase}.png" : '',
            'humidity' => (int) ($conditions['relativeHumidity'] ?? 0),
            'wind_speed' => round((float) ($conditions['wind']['speed']['value'] ?? 0), 1),
        ];
    }

    /**
     * @param  list<array<string, mixed>>  $days
     * @return list<array<string, mixed>>
     */
    private function parseForecastDays(array $days): array
    {
        $upcomingDays = array_slice($days, 2); // drop today

        return array_values(array_slice(
            array_map(function (array $day): array {
                $startTime = (string) ($day['interval']['startTime'] ?? '');
                $date = $startTime !== '' ? substr($startTime, 0, 10) : '';
                $daytime = $day['daytimeForecast'] ?? [];
                $iconBase = (string) ($daytime['weatherCondition']['iconBaseUri'] ?? '');

                return [
                    'date' => $date,
                    'temp_min' => (int) round((float) ($day['minTemperature']['degrees'] ?? 0)),
                    'temp_max' => (int) round((float) ($day['maxTemperature']['degrees'] ?? 0)),
                    'description' => (string) ($daytime['weatherCondition']['description']['text'] ?? ''),
                    'icon_url' => $iconBase !== '' ? "{$iconBase}.png" : '',
                ];
            }, $upcomingDays),
            0,
            7
        ));
    }
}
