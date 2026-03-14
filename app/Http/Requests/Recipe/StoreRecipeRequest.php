<?php

namespace App\Http\Requests\Recipe;

use App\Enums\RecipeCategory;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreRecipeRequest extends FormRequest
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
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
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

    /** @return array<string, string> */
    public function messages(): array
    {
        return [
            'title.required' => 'A recipe title is required.',
            'instructions.required' => 'Please include instructions.',
            'photo.image' => 'The photo must be an image file.',
            'photo.max' => 'The photo may not be larger than 5MB.',
            'ingredients.*.name.required' => 'Each ingredient needs a name.',
        ];
    }
}
