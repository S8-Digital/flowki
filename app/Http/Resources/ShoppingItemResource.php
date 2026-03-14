<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ShoppingItemResource extends JsonResource
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
            'name' => $this->name,
            'quantity' => $this->quantity,
            'category' => $this->category,
            'is_checked' => $this->is_checked,
            'shopping_list_id' => $this->shopping_list_id,
            'added_by' => new UserResource($this->whenLoaded('addedBy')),
            'created_at' => $this->created_at,
        ];
    }
}
