<?php

namespace Tests\Feature;

use App\Models\CalendarEvent;
use App\Models\Chore;
use App\Models\Todo;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CalendarEventControllerTest extends TestCase
{
    use RefreshDatabase;

    public function test_guests_cannot_view_calendar(): void
    {
        $this->get(route('calendar.index'))->assertRedirect(route('login'));
    }

    public function test_authenticated_user_can_view_calendar(): void
    {
        $user = User::factory()->withFamily()->create();

        $this->actingAs($user)->get(route('calendar.index'))->assertOk();
    }

    public function test_family_schedule_requires_authentication(): void
    {
        $this->get(route('calendar.family'))->assertRedirect(route('login'));
    }

    public function test_family_schedule_returns_inertia_page(): void
    {
        $user = User::factory()->withFamily()->create();

        $this->actingAs($user)
            ->get(route('calendar.family'))
            ->assertOk()
            ->assertInertia(fn ($page) => $page->component('Calendar/Index'));
    }

    public function test_family_schedule_passes_initial_view_prop(): void
    {
        $user = User::factory()->withFamily()->create();

        $this->actingAs($user)
            ->get(route('calendar.family'))
            ->assertInertia(fn ($page) => $page
                ->component('Calendar/Index')
                ->where('initialView', 'family')
            );
    }

    public function test_family_schedule_accepts_date_parameter(): void
    {
        $user = User::factory()->withFamily()->create();

        $this->actingAs($user)
            ->get(route('calendar.family', ['date' => '2024-06-15']))
            ->assertInertia(fn ($page) => $page
                ->component('Calendar/Index')
                ->where('initialDate', '2024-06-15')
            );
    }

    public function test_family_schedule_returns_members(): void
    {
        $user = User::factory()->withFamily()->create();
        $member = User::factory()->asMemberOf($user->family)->create();

        $this->actingAs($user)
            ->get(route('calendar.family'))
            ->assertInertia(fn ($page) => $page
                ->component('Calendar/Index')
                ->has('members', 2)
            );
    }

    public function test_family_schedule_returns_events(): void
    {
        $user = User::factory()->withFamily()->create();

        CalendarEvent::factory()->create([
            'family_id' => $user->family_id,
            'created_by' => $user->id,
        ]);

        $this->actingAs($user)
            ->get(route('calendar.family'))
            ->assertInertia(fn ($page) => $page
                ->component('Calendar/Index')
                ->has('events', 1)
            );
    }

    public function test_family_schedule_returns_todos(): void
    {
        $user = User::factory()->withFamily()->create();

        Todo::factory()->create([
            'family_id' => $user->family_id,
            'created_by' => $user->id,
            'due_date' => '2024-06-15 09:00:00',
        ]);

        $this->actingAs($user)
            ->get(route('calendar.family'))
            ->assertInertia(fn ($page) => $page
                ->component('Calendar/Index')
                ->has('todos', 1)
            );
    }

    public function test_family_schedule_returns_chores(): void
    {
        $user = User::factory()->withFamily()->create();

        Chore::factory()->create([
            'family_id' => $user->family_id,
            'created_by' => $user->id,
            'next_due_date' => '2024-06-15 08:00:00',
        ]);

        $this->actingAs($user)
            ->get(route('calendar.family'))
            ->assertInertia(fn ($page) => $page
                ->component('Calendar/Index')
                ->has('chores', 1)
            );
    }

    public function test_family_schedule_defaults_to_today(): void
    {
        $user = User::factory()->withFamily()->create();

        $this->travelTo(now()->startOfDay(), function () use ($user) {
            $this->actingAs($user)
                ->get(route('calendar.family'))
                ->assertInertia(fn ($page) => $page
                    ->component('Calendar/Index')
                    ->where('initialDate', now()->toDateString())
                );
        });
    }
}
