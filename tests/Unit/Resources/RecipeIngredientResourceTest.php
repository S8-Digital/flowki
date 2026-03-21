<?php

namespace Tests\Unit\Resources;

use App\Http\Resources\RecipeIngredientResource;
use App\Models\RecipeIngredient;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Request;
use Tests\TestCase;

class RecipeIngredientResourceTest extends TestCase
{
    use RefreshDatabase;

    public function test_resource_returns_expected_keys(): void
    {
        $ingredient = RecipeIngredient::factory()->create([
            'name' => 'flour',
            'quantity' => '2',
            'unit' => 'cups',
            'sort_order' => 1,
        ]);

        $resource = (new RecipeIngredientResource($ingredient))->toArray(new Request);

        $this->assertArrayHasKey('id', $resource);
        $this->assertArrayHasKey('name', $resource);
        $this->assertArrayHasKey('quantity', $resource);
        $this->assertArrayHasKey('unit', $resource);
        $this->assertArrayHasKey('sort_order', $resource);
    }

    public function test_resource_returns_correct_values(): void
    {
        $ingredient = RecipeIngredient::factory()->create([
            'name' => 'sugar',
            'quantity' => '1/2',
            'unit' => 'cup',
            'sort_order' => 2,
        ]);

        $resource = (new RecipeIngredientResource($ingredient))->toArray(new Request);

        $this->assertEquals('sugar', $resource['name']);
        $this->assertEquals('1/2', $resource['quantity']);
        $this->assertEquals('cup', $resource['unit']);
        $this->assertEquals(2, $resource['sort_order']);
    }

    public function test_resource_handles_null_quantity_and_unit(): void
    {
        $ingredient = RecipeIngredient::factory()->create([
            'name' => 'salt',
            'quantity' => null,
            'unit' => null,
        ]);

        $resource = (new RecipeIngredientResource($ingredient))->toArray(new Request);

        $this->assertNull($resource['quantity']);
        $this->assertNull($resource['unit']);
    }

    public function test_resource_id_matches_model_id(): void
    {
        $ingredient = RecipeIngredient::factory()->create();

        $resource = (new RecipeIngredientResource($ingredient))->toArray(new Request);

        $this->assertEquals($ingredient->id, $resource['id']);
    }
}
