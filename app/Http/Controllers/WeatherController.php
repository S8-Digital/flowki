<?php

namespace App\Http\Controllers;

use App\Services\WeatherService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class WeatherController extends Controller
{
    public function __construct(private readonly WeatherService $weather) {}

    /**
     * Return cached weather data for a given location.
     *
     * When `lat`, `lng`, and `location` query parameters are provided the response
     * is for that temporary location (e.g. the forecast dialog), otherwise it falls
     * back to the authenticated user's family location.
     *
     * Responds with 204 No Content when no location / coordinates are available or
     * when the upstream API request fails (graceful degradation).
     */
    public function index(Request $request): JsonResponse
    {
        $lat = $request->query('lat');
        $lng = $request->query('lng');
        $location = $request->query('location');

        if ($lat !== null && $lng !== null && $location !== null) {
            $data = $this->weather->getWeather(
                (string) $location,
                (float) $lat,
                (float) $lng,
            );

            return $data !== null ? response()->json($data) : response()->json(null, 204);
        }

        $family = $request->user()->family;

        if (! $family || empty($family->location_name) || $family->latitude === null || $family->longitude === null) {
            return response()->json(null, 204);
        }

        $data = $this->weather->getWeather(
            $family->location_name,
            $family->latitude,
            $family->longitude,
        );

        return $data !== null ? response()->json($data) : response()->json(null, 204);
    }
}
