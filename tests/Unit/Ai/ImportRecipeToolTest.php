<?php

namespace Tests\Unit\Ai;

use App\Ai\Tools\ImportRecipe;
use App\Enums\RecipeCategory;
use App\Models\User;
use Illuminate\Contracts\JsonSchema\JsonSchema;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Ai\Tools\Request;
use Mockery\MockInterface;
use Tests\TestCase;

class ImportRecipeToolTest extends TestCase
{
    use RefreshDatabase;

    public function test_handle_creates_recipe_with_ingredients(): void
    {
        $user = User::factory()->withFamily()->create();
        $tool = new ImportRecipe($user);

        $result = $tool->handle(new Request([
            'title' => 'Spaghetti Bolognese',
            'category' => RecipeCategory::Dinner->value,
            'instructions' => "1. Brown the meat.\n2. Add tomato sauce.\n3. Serve over pasta.",
            'servings' => 4,
            'ingredients' => [
                ['name' => 'spaghetti', 'quantity' => '400', 'unit' => 'g'],
                ['name' => 'minced beef', 'quantity' => '500', 'unit' => 'g'],
                ['name' => 'tomato sauce', 'quantity' => '400', 'unit' => 'ml'],
            ],
        ]));

        $this->assertStringContainsString('Spaghetti Bolognese', $result);
        $this->assertStringContainsString('3 ingredient', $result);
        $this->assertDatabaseHas('recipes', [
            'family_id' => $user->family_id,
            'created_by' => $user->id,
            'title' => 'Spaghetti Bolognese',
            'category' => RecipeCategory::Dinner->value,
        ]);
        $this->assertDatabaseHas('recipe_ingredients', [
            'name' => 'spaghetti',
            'quantity' => '400',
            'unit' => 'g',
        ]);
    }

    public function test_handle_creates_recipe_without_ingredients(): void
    {
        $user = User::factory()->withFamily()->create();
        $tool = new ImportRecipe($user);

        $result = $tool->handle(new Request([
            'title' => 'Simple Salad',
            'instructions' => 'Mix ingredients together.',
            'ingredients' => [],
        ]));

        $this->assertStringContainsString('Simple Salad', $result);
        $this->assertStringContainsString('0 ingredient', $result);
        $this->assertDatabaseHas('recipes', [
            'title' => 'Simple Salad',
            'family_id' => $user->family_id,
        ]);
    }

    public function test_handle_uses_default_category_when_not_provided(): void
    {
        $user = User::factory()->withFamily()->create();
        $tool = new ImportRecipe($user);

        $tool->handle(new Request([
            'title' => 'Mystery Dish',
            'instructions' => 'Cook it.',
            'ingredients' => [],
        ]));

        $this->assertDatabaseHas('recipes', [
            'title' => 'Mystery Dish',
            'category' => RecipeCategory::Dinner->value,
        ]);
    }

    public function test_handle_returns_error_when_instructions_missing(): void
    {
        $user = User::factory()->withFamily()->create();
        $tool = new ImportRecipe($user);

        $result = $tool->handle(new Request([
            'title' => 'No Instructions Recipe',
            'ingredients' => [],
        ]));

        $this->assertStringContainsString('Error', $result);
        $this->assertDatabaseMissing('recipes', ['title' => 'No Instructions Recipe']);
    }

    public function test_handle_returns_error_when_ingredient_has_no_name(): void
    {
        $user = User::factory()->withFamily()->create();
        $tool = new ImportRecipe($user);

        $result = $tool->handle(new Request([
            'title' => 'Bad Ingredient Recipe',
            'instructions' => 'Cook it.',
            'ingredients' => [
                ['quantity' => '100', 'unit' => 'g'],
            ],
        ]));

        $this->assertStringContainsString('Error', $result);
        $this->assertDatabaseMissing('recipes', ['title' => 'Bad Ingredient Recipe']);
    }

    public function test_description_is_not_empty(): void
    {
        $user = User::factory()->withFamily()->create();
        $tool = new ImportRecipe($user);

        $this->assertNotEmpty($tool->description());
    }

    public function test_schema_contains_expected_fields(): void
    {
        $user = User::factory()->withFamily()->create();
        $tool = new ImportRecipe($user);

        /** @var JsonSchema&MockInterface $schema */
        $schema = \Mockery::mock(JsonSchema::class);
        $schema->shouldReceive('string')->andReturnSelf()->zeroOrMoreTimes();
        $schema->shouldReceive('integer')->andReturnSelf()->zeroOrMoreTimes();
        $schema->shouldReceive('array')->andReturnSelf()->zeroOrMoreTimes();
        $schema->shouldReceive('boolean')->andReturnSelf()->zeroOrMoreTimes();
        $schema->shouldReceive('description')->andReturnSelf()->zeroOrMoreTimes();
        $schema->shouldReceive('required')->andReturnSelf()->zeroOrMoreTimes();

        $fields = $tool->schema($schema);

        $this->assertArrayHasKey('title', $fields);
        $this->assertArrayHasKey('instructions', $fields);
        $this->assertArrayHasKey('ingredients', $fields);
    }
}
