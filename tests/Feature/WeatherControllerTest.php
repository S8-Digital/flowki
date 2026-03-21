<?php

namespace Tests\Feature;

use App\Models\User;
use App\Services\WeatherService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Mockery;
use Tests\TestCase;

class WeatherControllerTest extends TestCase
{
    use RefreshDatabase;

    public function test_guests_cannot_access_weather_endpoint(): void
    {
        $this->getJson(route('weather.index'))->assertUnauthorized();
    }

    public function test_returns_204_when_family_has_no_location(): void
    {
        $user = User::factory()->withFamily()->create();
        $family = $user->family;
        $family->update(['location_name' => null, 'latitude' => null, 'longitude' => null]);

        $this->actingAs($user)
            ->getJson(route('weather.index'))
            ->assertNoContent();
    }

    public function test_returns_weather_data_for_family_location(): void
    {
        $user = User::factory()->withFamily()->create();
        $family = $user->family;
        $family->update(['location_name' => 'London', 'latitude' => 51.5, 'longitude' => -0.1]);

        $weatherData = ['temp' => 15, 'condition' => 'Partly cloudy'];

        $this->mock(WeatherService::class, function ($mock) use ($weatherData) {
            $mock->shouldReceive('getWeather')
                ->once()
                ->with('London', 51.5, -0.1)
                ->andReturn($weatherData);
        });

        $this->actingAs($user)
            ->getJson(route('weather.index'))
            ->assertOk()
            ->assertJson($weatherData);
    }

    public function test_returns_204_when_weather_service_fails_for_family_location(): void
    {
        $user = User::factory()->withFamily()->create();
        $family = $user->family;
        $family->update(['location_name' => 'London', 'latitude' => 51.5, 'longitude' => -0.1]);

        $this->mock(WeatherService::class, function ($mock) {
            $mock->shouldReceive('getWeather')->once()->andReturn(null);
        });

        $this->actingAs($user)
            ->getJson(route('weather.index'))
            ->assertNoContent();
    }

    public function test_returns_weather_for_explicit_coordinates(): void
    {
        $user = User::factory()->withFamily()->create();

        $weatherData = ['temp' => 22, 'condition' => 'Sunny'];

        $this->mock(WeatherService::class, function ($mock) use ($weatherData) {
            $mock->shouldReceive('getWeather')
                ->once()
                ->with('Paris', 48.85, 2.35)
                ->andReturn($weatherData);
        });

        $this->actingAs($user)
            ->getJson(route('weather.index').'?lat=48.85&lng=2.35&location=Paris')
            ->assertOk()
            ->assertJson($weatherData);
    }

    public function test_returns_204_when_weather_service_fails_for_explicit_coordinates(): void
    {
        $user = User::factory()->withFamily()->create();

        $this->mock(WeatherService::class, function ($mock) {
            $mock->shouldReceive('getWeather')->once()->andReturn(null);
        });

        $this->actingAs($user)
            ->getJson(route('weather.index').'?lat=48.85&lng=2.35&location=Paris')
            ->assertNoContent();
    }

    public function test_explicit_coordinates_take_priority_over_family_location(): void
    {
        $user = User::factory()->withFamily()->create();
        $family = $user->family;
        $family->update(['location_name' => 'London', 'latitude' => 51.5, 'longitude' => -0.1]);

        $weatherData = ['temp' => 22, 'condition' => 'Sunny'];

        $this->mock(WeatherService::class, function ($mock) use ($weatherData) {
            $mock->shouldReceive('getWeather')
                ->once()
                ->with('Paris', 48.85, 2.35)
                ->andReturn($weatherData);
        });

        $this->actingAs($user)
            ->getJson(route('weather.index').'?lat=48.85&lng=2.35&location=Paris')
            ->assertOk();
    }

    public function test_returns_204_when_user_has_no_family(): void
    {
        $user = User::factory()->create(['family_id' => null]);

        $this->actingAs($user)
            ->getJson(route('weather.index'))
            ->assertNoContent();
    }

    protected function tearDown(): void
    {
        Mockery::close();
        parent::tearDown();
    }
}
