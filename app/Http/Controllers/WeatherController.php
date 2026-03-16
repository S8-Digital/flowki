<?php

namespace App\Http\Controllers;

use App\Services\WeatherService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class WeatherController extends Controller
{
    public function __construct(private readonly WeatherService $weather) {}

    /**
     * Return cached weather data for the authenticated user's family location.
     *
     * Responds with 204 No Content when no location is configured or when
     * the API key is absent / the upstream request fails (graceful degradation).
     */
    public function index(Request $request): JsonResponse
    {
        $family = $request->user()->family;

        if (! $family || empty($family->location_name)) {
            return response()->json(null, 204);
        }

        $data = $this->weather->getWeather(
            $family->location_name,
            $family->latitude,
            $family->longitude,
        );

        if ($data === null) {
            return response()->json(null, 204);
        }

        return response()->json($data);
    }
}
