<?php

namespace Tests\Feature\Settings;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CategoriesControllerTest extends TestCase
{
    use RefreshDatabase;

    public function test_guests_cannot_view_categories_page(): void
    {
        $this->get(route('settings.categories'))->assertRedirect(route('login'));
    }

    public function test_authenticated_user_can_view_categories_page(): void
    {
        $user = User::factory()->withFamily()->create();

        $this->actingAs($user)
            ->get(route('settings.categories'))
            ->assertOk()
            ->assertInertia(fn ($page) => $page->component('settings/Categories')
                ->has('todoCategories')
                ->has('recipeCategories')
                ->has('shoppingCategories')
            );
    }

    public function test_user_without_family_is_redirected(): void
    {
        $user = User::factory()->create(['family_id' => null]);

        $this->actingAs($user)
            ->get(route('settings.categories'))
            ->assertStatus(404);
    }

    public function test_user_can_update_todo_categories(): void
    {
        $user = User::factory()->withFamily()->create();

        $this->actingAs($user)
            ->post(route('settings.categories.update'), [
                'todo_categories' => [
                    ['value' => 'work', 'label' => 'Work'],
                    ['value' => 'personal', 'label' => 'Personal'],
                ],
            ])
            ->assertRedirect()
            ->assertSessionHas('status', 'categories-updated');

        $family = $user->fresh()->family;
        $this->assertCount(2, $family->getTodoCategories());
    }

    public function test_user_can_update_recipe_categories(): void
    {
        $user = User::factory()->withFamily()->create();

        $this->actingAs($user)
            ->post(route('settings.categories.update'), [
                'recipe_categories' => [
                    ['value' => 'italian', 'label' => 'Italian'],
                ],
            ])
            ->assertRedirect()
            ->assertSessionHas('status', 'categories-updated');

        $family = $user->fresh()->family;
        $this->assertCount(1, $family->getRecipeCategories());
    }

    public function test_user_can_update_shopping_categories(): void
    {
        $user = User::factory()->withFamily()->create();

        $this->actingAs($user)
            ->post(route('settings.categories.update'), [
                'shopping_categories' => [
                    ['value' => 'produce', 'label' => 'Produce'],
                ],
            ])
            ->assertRedirect()
            ->assertSessionHas('status', 'categories-updated');
    }

    public function test_categories_update_validates_value_max_length(): void
    {
        $user = User::factory()->withFamily()->create();

        $this->actingAs($user)
            ->post(route('settings.categories.update'), [
                'todo_categories' => [
                    ['value' => str_repeat('a', 51), 'label' => 'Too long'],
                ],
            ])
            ->assertSessionHasErrors('todo_categories.0.value');
    }

    public function test_categories_update_validates_label_max_length(): void
    {
        $user = User::factory()->withFamily()->create();

        $this->actingAs($user)
            ->post(route('settings.categories.update'), [
                'todo_categories' => [
                    ['value' => 'ok', 'label' => str_repeat('a', 101)],
                ],
            ])
            ->assertSessionHasErrors('todo_categories.0.label');
    }

    public function test_non_admin_member_cannot_update_categories(): void
    {
        $admin = User::factory()->withFamily()->create();
        $member = User::factory()->create(['family_id' => $admin->family_id]);
        $admin->family->members()->attach($member->id, ['role' => 'Member']);
        $member->syncRoles(['Member']);

        $this->actingAs($member)
            ->post(route('settings.categories.update'), [
                'todo_categories' => [['value' => 'x', 'label' => 'X']],
            ])
            ->assertForbidden();
    }

    public function test_empty_payload_does_not_change_existing_categories(): void
    {
        $user = User::factory()->withFamily()->create();
        $family = $user->family;
        $settings = $family->settings ?? [];
        $settings['todo_categories'] = [['value' => 'existing', 'label' => 'Existing']];
        $family->update(['settings' => $settings]);

        $this->actingAs($user)
            ->post(route('settings.categories.update'), [])
            ->assertRedirect();

        $this->assertEquals([['value' => 'existing', 'label' => 'Existing']], $user->fresh()->family->getTodoCategories());
    }
}
