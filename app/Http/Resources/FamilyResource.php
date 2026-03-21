<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class FamilyResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $data = [
            'id' => $this->id,
            'name' => $this->name,
            'invite_code' => $this->invite_code,
            'location_name' => $this->location_name,
            'latitude' => $this->latitude,
            'longitude' => $this->longitude,
            'created_at' => $this->created_at,
            'member_order' => $this->getMemberOrder(),
        ];

        if ($this->resource->relationLoaded('members')) {
            $data['members'] = UserResource::collection($this->resource->members)->resolve();
        }

        return $data;
    }
}
