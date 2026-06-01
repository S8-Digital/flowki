<?php

namespace App\Ai\Tools;

use App\Enums\RecipeCategory;
use App\Models\Recipe;
use App\Models\User;
use Illuminate\Contracts\JsonSchema\JsonSchema;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Laravel\Ai\Contracts\Tool;
use Laravel\Ai\Tools\Request;

class ImportRecipe implements Tool
{
    public function __construct(protected User $user) {}

    public function description(): string
    {
        return 'Import a recipe from pasted text or a URL. The input should contain a recipe with a title, ingredients, and instructions. Creates a Recipe record with associated ingredients. If an image_url is available (e.g. from the og:image of a fetched page), pass it so the photo can be saved.';
    }

    public function handle(Request $request): string
    {
        if (empty($request['instructions'])) {
            return 'Error: instructions are required to import a recipe.';
        }

        $title = $request['title'] ?? 'Untitled Recipe';
        $ingredients = $request['ingredients'] ?? [];

        foreach ($ingredients as $ingredient) {
            if (empty($ingredient['name'])) {
                return 'Error: each ingredient must have a name.';
            }
        }

        try {
            $recipe = DB::transaction(function () use ($request, $title, $ingredients) {
                $recipe = Recipe::create([
                    'family_id' => $this->user->family_id,
                    'created_by' => $this->user->id,
                    'title' => $title,
                    'description' => $request['description'] ?? null,
                    'category' => $request['category'] ?? RecipeCategory::Dinner->value,
                    'servings' => $request['servings'] ?? null,
                    'prep_time_minutes' => $request['prep_time_minutes'] ?? null,
                    'cook_time_minutes' => $request['cook_time_minutes'] ?? null,
                    'instructions' => $request['instructions'],
                ]);

                foreach ($ingredients as $index => $ingredient) {
                    $recipe->ingredients()->create([
                        'name' => $ingredient['name'],
                        'quantity' => $ingredient['quantity'] ?? null,
                        'unit' => $ingredient['unit'] ?? null,
                        'notes' => $ingredient['notes'] ?? null,
                        'sort_order' => $index,
                    ]);
                }

                return $recipe;
            });

            // Download and store the recipe photo (best-effort — don't fail the import if this errors).
            $imageUrl = $request['image_url'] ?? null;
            if ($imageUrl && filter_var($imageUrl, FILTER_VALIDATE_URL)) {
                try {
                    $imageResponse = Http::timeout(15)->get($imageUrl);
                    if ($imageResponse->successful()) {
                        $extension = 'jpg';
                        $contentType = $imageResponse->header('Content-Type') ?? '';
                        if (str_contains($contentType, 'png')) {
                            $extension = 'png';
                        } elseif (str_contains($contentType, 'gif')) {
                            $extension = 'gif';
                        } elseif (str_contains($contentType, 'webp')) {
                            $extension = 'webp';
                        }
                        $filename = 'recipes/'.Str::uuid().'.'.$extension;
                        Storage::disk('public')->put($filename, $imageResponse->body());
                        $recipe->update(['photo_path' => $filename]);
                    }
                } catch (\Throwable) {
                    // Photo download failed — recipe was still created successfully.
                }
            }
        } catch (\Throwable $e) {
            report($e);

            return 'Error: failed to import recipe. Please check the input and try again.';
        }

        $count = count($ingredients);

        return "✓ Recipe imported: \"{$recipe->title}\" with {$count} ingredient(s)";
    }

    /** @return array<string, JsonSchema> */
    public function schema(JsonSchema $schema): array
    {
        return [
            'title' => $schema->string()->description('The recipe title')->required(),
            'description' => $schema->string()->description('A brief description of the recipe'),
            'category' => $schema->string()->description('breakfast, lunch, dinner, snack, dessert, or beverage'),
            'servings' => $schema->integer()->description('Number of servings'),
            'prep_time_minutes' => $schema->integer()->description('Preparation time in minutes'),
            'cook_time_minutes' => $schema->integer()->description('Cooking time in minutes'),
            'instructions' => $schema->string()->description('Step-by-step cooking instructions')->required(),
            'ingredients' => $schema->array()->description('List of ingredients, each with a required "name" and optional "quantity", "unit", and "notes"')->required(),
            'image_url' => $schema->string()->description('Absolute URL of the recipe hero image (e.g. og:image from the source page)'),
        ];
    }
}
