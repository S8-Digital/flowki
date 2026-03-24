<?php

declare(strict_types=1);

namespace App\Http\Controllers\Mobile;

use App\Http\Controllers\Controller;
use App\Services\WeatherService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class WeatherController extends Controller
{
    public function __construct(private readonly WeatherService $weather) {}

    /**
     * Return cached weather data for the authenticated user's family location.
     *
     * Responds with 204 No Content when no location is configured or the
     * upstream API request fails (graceful degradation — the mobile weather
     * widget should hide itself on a null response).
     */
    public function index(Request $request): JsonResponse
    {
        $family = $request->user()->family;

        if (
            ! $family
            || empty($family->location_name)
            || $family->latitude === null
            || $family->longitude === null
        ) {
            return response()->json(null, 204);
        }

        $data = $this->weather->getWeather(
            $family->location_name,
            $family->latitude,
            $family->longitude,
        );

        return $data !== null
            ? response()->json($data)
            : response()->json(null, 204);
    }
}
