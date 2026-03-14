<?php

namespace App\Http\Requests\Recipe;

use App\Enums\RecipeCategory;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateRecipeRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:2000'],
            'category' => ['nullable', Rule::enum(RecipeCategory::class)],
            'servings' => ['nullable', 'integer', 'min:1', 'max:100'],
            'prep_time_minutes' => ['nullable', 'integer', 'min:0'],
            'cook_time_minutes' => ['nullable', 'integer', 'min:0'],
            'instructions' => ['required', 'string'],
            'photo' => ['nullable', 'image', 'max:5120'],
            'rating' => ['nullable', 'integer', 'min:1', 'max:5'],
            'is_favorite' => ['boolean'],
            'ingredients' => ['nullable', 'array'],
            'ingredients.*.name' => ['required', 'string', 'max:255'],
            'ingredients.*.quantity' => ['nullable', 'string', 'max:50'],
            'ingredients.*.unit' => ['nullable', 'string', 'max:50'],
            'ingredients.*.notes' => ['nullable', 'string', 'max:255'],
        ];
    }
}
