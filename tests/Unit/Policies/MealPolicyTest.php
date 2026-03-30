<?php

namespace Tests\Unit\Policies;

use App\Models\Meal;
use App\Models\User;
use App\Policies\MealPolicy;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class MealPolicyTest extends TestCase
{
    use RefreshDatabase;

    private MealPolicy $policy;

    protected function setUp(): void
    {
        parent::setUp();
        $this->policy = new MealPolicy();
    }

    public function test_user_without_family_cannot_view_any(): void
    {
        $user = User::factory()->create(['family_id' => null]);

        $this->assertFalse($this->policy->viewAny($user));
    }

    public function test_admin_can_view_any_meals(): void
    {
        $user = User::factory()->withFamily()->create();

        $this->assertTrue($this->policy->viewAny($user));
    }

    public function test_user_can_view_meal_in_same_family(): void
    {
        $user = User::factory()->withFamily()->create();
        $meal = Meal::factory()->create(['family_id' => $user->family_id, 'created_by' => $user->id]);

        $this->assertTrue($this->policy->view($user, $meal));
    }

    public function test_user_cannot_view_meal_in_different_family(): void
    {
        $user = User::factory()->withFamily()->create();
        $otherUser = User::factory()->withFamily()->create();
        $meal = Meal::factory()->create(['family_id' => $otherUser->family_id, 'created_by' => $otherUser->id]);

        $this->assertFalse($this->policy->view($user, $meal));
    }

    public function test_admin_can_create_meal(): void
    {
        $user = User::factory()->withFamily()->create();

        $this->assertTrue($this->policy->create($user));
    }

    public function test_user_without_family_cannot_create_meal(): void
    {
        $user = User::factory()->create(['family_id' => null]);

        $this->assertFalse($this->policy->create($user));
    }

    public function test_admin_can_delete_own_family_meal(): void
    {
        $user = User::factory()->withFamily()->create();
        $meal = Meal::factory()->create(['family_id' => $user->family_id, 'created_by' => $user->id]);

        $this->assertTrue($this->policy->delete($user, $meal));
    }

    public function test_user_cannot_delete_different_family_meal(): void
    {
        $user = User::factory()->withFamily()->create();
        $otherUser = User::factory()->withFamily()->create();
        $meal = Meal::factory()->create(['family_id' => $otherUser->family_id, 'created_by' => $otherUser->id]);

        $this->assertFalse($this->policy->delete($user, $meal));
    }
}
