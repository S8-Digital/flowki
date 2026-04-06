<?php

namespace Tests\Unit\Models;

use App\Enums\DashboardWidgetType;
use App\Models\DashboardWidget;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DashboardWidgetModelTest extends TestCase
{
    use RefreshDatabase;

    public function test_dashboard_widget_belongs_to_user(): void
    {
        $user = User::factory()->withFamily()->create();
        $widget = DashboardWidget::create([
            'user_id' => $user->id,
            'type' => DashboardWidgetType::Weather,
            'position' => 0,
        ]);

        $this->assertInstanceOf(User::class, $widget->user);
        $this->assertEquals($user->id, $widget->user->id);
    }

    public function test_dashboard_widget_casts_type_to_enum(): void
    {
        $user = User::factory()->withFamily()->create();
        $widget = DashboardWidget::create([
            'user_id' => $user->id,
            'type' => DashboardWidgetType::TodoList,
            'position' => 1,
        ]);

        $this->assertInstanceOf(DashboardWidgetType::class, $widget->fresh()->type);
        $this->assertEquals(DashboardWidgetType::TodoList, $widget->fresh()->type);
    }

    public function test_dashboard_widget_casts_position_to_integer(): void
    {
        $user = User::factory()->withFamily()->create();
        $widget = DashboardWidget::create([
            'user_id' => $user->id,
            'type' => DashboardWidgetType::Weather,
            'position' => 2,
        ]);

        $this->assertIsInt($widget->fresh()->position);
        $this->assertEquals(2, $widget->fresh()->position);
    }

    public function test_dashboard_widget_casts_settings_to_array(): void
    {
        $user = User::factory()->withFamily()->create();
        $settings = ['refresh_interval' => 30, 'show_forecast' => true];
        $widget = DashboardWidget::create([
            'user_id' => $user->id,
            'type' => DashboardWidgetType::Weather,
            'position' => 0,
            'settings' => $settings,
        ]);

        $this->assertIsArray($widget->fresh()->settings);
        $this->assertEquals($settings, $widget->fresh()->settings);
    }

    public function test_dashboard_widget_type_label_returns_string(): void
    {
        $this->assertEquals('Weather', DashboardWidgetType::Weather->label());
        $this->assertEquals('Todo List', DashboardWidgetType::TodoList->label());
        $this->assertEquals('Shopping List', DashboardWidgetType::ShoppingList->label());
        $this->assertEquals('Upcoming Events', DashboardWidgetType::CalendarSchedule->label());
        $this->assertEquals("Today's Schedule", DashboardWidgetType::CalendarToday->label());
        $this->assertEquals("This Week's Dinners", DashboardWidgetType::MealPlanner->label());
    }

    public function test_dashboard_widget_can_be_created_without_settings(): void
    {
        $user = User::factory()->withFamily()->create();
        $widget = DashboardWidget::create([
            'user_id' => $user->id,
            'type' => DashboardWidgetType::Weather,
            'position' => 0,
        ]);

        $this->assertNull($widget->fresh()->settings);
    }
}
