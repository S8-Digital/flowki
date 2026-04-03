<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class MealResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'family_id' => $this->family_id,
            'created_by' => $this->created_by,
            'recipe_id' => $this->recipe_id,
            'planned_date' => $this->planned_date?->toDateString(),
            'meal_type' => $this->meal_type?->value,
            'servings' => $this->servings,
            'notes' => $this->notes,
            'recipe' => new RecipeResource($this->whenLoaded('recipe')),
            'creator' => new UserResource($this->whenLoaded('creator')),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
