<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ChoreResource extends JsonResource
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
            'title' => $this->title,
            'description' => $this->description,
            'frequency' => $this->frequency,
            'next_due_date' => $this->next_due_date?->format('Y-m-d\TH:i'),
            'reminder_enabled' => $this->reminder_enabled,
            'reminder_lead_time' => $this->reminder_lead_time,
            'family_id' => $this->family_id,
            'assignees' => UserResource::collection($this->whenLoaded('assignees')),
            'creator' => new UserResource($this->whenLoaded('creator')),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
