<?php

namespace Tests\Unit\Resources;

use App\Http\Resources\RecipeResource;
use App\Models\Recipe;
use App\Models\RecipeIngredient;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Request;
use Tests\TestCase;

class RecipeResourceTest extends TestCase
{
    use RefreshDatabase;

    public function test_resource_returns_expected_keys(): void
    {
        $recipe = Recipe::factory()->create();
        $resource = (new RecipeResource($recipe))->toArray(new Request);

        $this->assertArrayHasKey('id', $resource);
        $this->assertArrayHasKey('title', $resource);
        $this->assertArrayHasKey('description', $resource);
        $this->assertArrayHasKey('category', $resource);
        $this->assertArrayHasKey('servings', $resource);
        $this->assertArrayHasKey('prep_time_minutes', $resource);
        $this->assertArrayHasKey('cook_time_minutes', $resource);
        $this->assertArrayHasKey('total_time_minutes', $resource);
        $this->assertArrayHasKey('instructions', $resource);
        $this->assertArrayHasKey('photo_path', $resource);
        $this->assertArrayHasKey('rating', $resource);
        $this->assertArrayHasKey('is_favorite', $resource);
        $this->assertArrayHasKey('family_id', $resource);
        $this->assertArrayHasKey('created_at', $resource);
        $this->assertArrayHasKey('updated_at', $resource);
    }

    public function test_total_time_minutes_is_sum_of_prep_and_cook(): void
    {
        $user = User::factory()->withFamily()->create();
        $recipe = Recipe::factory()->create([
            'family_id' => $user->family_id,
            'prep_time_minutes' => 20,
            'cook_time_minutes' => 40,
        ]);

        $resource = (new RecipeResource($recipe))->toArray(new Request);

        $this->assertEquals(60, $resource['total_time_minutes']);
    }

    public function test_is_favorite_is_boolean(): void
    {
        $recipe = Recipe::factory()->create(['is_favorite' => true]);
        $resource = (new RecipeResource($recipe))->toArray(new Request);

        $this->assertIsBool($resource['is_favorite']);
        $this->assertTrue($resource['is_favorite']);
    }

    public function test_photo_path_is_null_when_not_set(): void
    {
        $recipe = Recipe::factory()->create(['photo_path' => null]);
        $resource = (new RecipeResource($recipe))->toArray(new Request);

        $this->assertNull($resource['photo_path']);
    }

    public function test_ingredients_collection_included_when_loaded(): void
    {
        $user = User::factory()->withFamily()->create();
        $recipe = Recipe::factory()->create(['family_id' => $user->family_id]);
        RecipeIngredient::factory()->create(['recipe_id' => $recipe->id]);
        $recipe->load('ingredients');

        $resource = (new RecipeResource($recipe))->toArray(new Request);

        $this->assertNotEmpty($resource['ingredients']);
    }

    public function test_creator_included_when_loaded(): void
    {
        $user = User::factory()->withFamily()->create();
        $recipe = Recipe::factory()->create([
            'family_id' => $user->family_id,
            'created_by' => $user->id,
        ]);
        $recipe->load('creator');

        $resource = (new RecipeResource($recipe))->toArray(new Request);

        $this->assertNotEmpty($resource['creator']);
        $this->assertEquals($user->id, $resource['creator']['id']);
    }
}
