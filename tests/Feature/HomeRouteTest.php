<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class HomeRouteTest extends TestCase
{
    use RefreshDatabase;

    public function test_guests_see_welcome_page(): void
    {
        $response = $this->get(route('home'));

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page->component('Welcome'));
    }

    public function test_authenticated_user_is_redirected_to_dashboard_on_direct_navigation(): void
    {
        $user = User::factory()->withFamily()->create();

        $response = $this->actingAs($user)->get(route('home'));

        $response->assertRedirect(route('dashboard'));
    }

    public function test_authenticated_user_sees_welcome_page_via_inertia_navigation(): void
    {
        $user = User::factory()->withFamily()->create();

        $response = $this->actingAs($user)
            ->withHeaders(['X-Inertia' => 'true'])
            ->get(route('home'));

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page->component('Welcome'));
    }

    public function test_authenticated_user_without_family_is_redirected_to_dashboard_on_direct_navigation(): void
    {
        $user = User::factory()->create(['family_id' => null]);

        $response = $this->actingAs($user)->get(route('home'));

        // The home route redirects to dashboard; the dashboard route will further
        // redirect to family setup, but the home route itself sends to dashboard.
        $response->assertRedirect(route('dashboard'));
    }
}
