<?php

namespace Tests\Feature;

use App\Enums\DashboardWidgetType;
use App\Models\DashboardWidget;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DashboardTest extends TestCase
{
    use RefreshDatabase;

    public function test_guests_are_redirected_to_the_login_page()
    {
        $response = $this->get(route('dashboard'));
        $response->assertRedirect(route('login'));
    }

    public function test_authenticated_users_without_family_are_redirected_to_family_setup()
    {
        $user = User::factory()->create(['family_id' => null]);
        $this->actingAs($user);

        $response = $this->get(route('dashboard'));
        $response->assertRedirect(route('family.create'));
    }

    public function test_authenticated_users_can_visit_the_dashboard()
    {
        $user = User::factory()->withFamily()->create();
        $this->actingAs($user);

        $response = $this->get(route('dashboard'));
        $response->assertStatus(200);
    }

    public function test_default_widgets_are_created_on_first_visit()
    {
        $user = User::factory()->withFamily()->create();
        $this->actingAs($user);

        $this->assertDatabaseCount('dashboard_widgets', 0);

        $this->get(route('dashboard'));

        $this->assertDatabaseCount('dashboard_widgets', 4);
        $this->assertDatabaseHas('dashboard_widgets', [
            'user_id' => $user->id,
            'type' => DashboardWidgetType::CalendarSchedule->value,
        ]);
    }

    public function test_existing_widgets_are_not_duplicated_on_subsequent_visits()
    {
        $user = User::factory()->withFamily()->create();
        $this->actingAs($user);

        $this->get(route('dashboard'));
        $this->get(route('dashboard'));

        $this->assertDatabaseCount('dashboard_widgets', 4);
    }

    public function test_widget_can_be_added()
    {
        $user = User::factory()->withFamily()->create();
        $this->actingAs($user);

        $response = $this->post(route('dashboard.widgets.store'), [
            'type' => DashboardWidgetType::Weather->value,
            'settings' => [],
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('dashboard_widgets', [
            'user_id' => $user->id,
            'type' => DashboardWidgetType::Weather->value,
        ]);
    }

    public function test_widget_store_rejects_invalid_type()
    {
        $user = User::factory()->withFamily()->create();
        $this->actingAs($user);

        $response = $this->post(route('dashboard.widgets.store'), [
            'type' => 'invalid_type',
        ]);

        $response->assertSessionHasErrors('type');
    }

    public function test_widget_position_increments_correctly()
    {
        $user = User::factory()->withFamily()->create();
        $this->actingAs($user);

        // Create two widgets to check positions
        $this->post(route('dashboard.widgets.store'), [
            'type' => DashboardWidgetType::Weather->value,
        ]);
        $this->post(route('dashboard.widgets.store'), [
            'type' => DashboardWidgetType::MealPlanner->value,
        ]);

        $widgets = DashboardWidget::where('user_id', $user->id)->orderBy('position')->get();
        $this->assertEquals(0, $widgets->first()->position);
        $this->assertEquals(1, $widgets->last()->position);
    }

    public function test_widget_settings_can_be_updated()
    {
        $user = User::factory()->withFamily()->create();
        $this->actingAs($user);

        $widget = DashboardWidget::create([
            'user_id' => $user->id,
            'type' => DashboardWidgetType::TodoList,
            'position' => 0,
            'settings' => [],
        ]);

        $response = $this->patch(route('dashboard.widgets.update', $widget), [
            'settings' => ['list_id' => 5],
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('dashboard_widgets', [
            'id' => $widget->id,
        ]);
        $widget->refresh();
        $this->assertEquals(['list_id' => 5], $widget->settings);
    }

    public function test_another_users_widget_cannot_be_updated()
    {
        $owner = User::factory()->withFamily()->create();
        $other = User::factory()->withFamily()->create();

        $widget = DashboardWidget::create([
            'user_id' => $owner->id,
            'type' => DashboardWidgetType::TodoList,
            'position' => 0,
            'settings' => [],
        ]);

        $this->actingAs($other);

        $response = $this->patch(route('dashboard.widgets.update', $widget), [
            'settings' => ['hijacked' => true],
        ]);

        $response->assertForbidden();
    }

    public function test_widget_order_can_be_changed()
    {
        $user = User::factory()->withFamily()->create();
        $this->actingAs($user);

        $w1 = DashboardWidget::create([
            'user_id' => $user->id,
            'type' => DashboardWidgetType::CalendarSchedule,
            'position' => 0,
            'settings' => [],
        ]);
        $w2 = DashboardWidget::create([
            'user_id' => $user->id,
            'type' => DashboardWidgetType::TodoList,
            'position' => 1,
            'settings' => [],
        ]);

        $response = $this->post(route('dashboard.widgets.reorder'), [
            'order' => [0 => $w2->id, 1 => $w1->id],
        ]);

        $response->assertRedirect();

        $this->assertEquals(0, $w2->refresh()->position);
        $this->assertEquals(1, $w1->refresh()->position);
    }

    public function test_widget_can_be_deleted()
    {
        $user = User::factory()->withFamily()->create();
        $this->actingAs($user);

        $widget = DashboardWidget::create([
            'user_id' => $user->id,
            'type' => DashboardWidgetType::Weather,
            'position' => 0,
            'settings' => [],
        ]);

        $response = $this->delete(route('dashboard.widgets.destroy', $widget));

        $response->assertRedirect();
        $this->assertDatabaseMissing('dashboard_widgets', ['id' => $widget->id]);
    }

    public function test_another_users_widget_cannot_be_deleted()
    {
        $owner = User::factory()->withFamily()->create();
        $other = User::factory()->withFamily()->create();

        $widget = DashboardWidget::create([
            'user_id' => $owner->id,
            'type' => DashboardWidgetType::Weather,
            'position' => 0,
            'settings' => [],
        ]);

        $this->actingAs($other);

        $response = $this->delete(route('dashboard.widgets.destroy', $widget));

        $response->assertForbidden();
        $this->assertDatabaseHas('dashboard_widgets', ['id' => $widget->id]);
    }
}
