<?php

namespace App\Http\Resources\Settings;

use Database\Seeders\RolePermissionSeeder;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class MemberPermissionResource extends JsonResource
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
            'role' => $this->getRoleNames()->first(),
            'permissionGroups' => collect(RolePermissionSeeder::PERMISSIONS)
                ->map(fn (array $perms, string $group) => [
                    'group' => $group,
                    'permissions' => collect($perms)->map(fn (string $name) => [
                        'name' => $name,
                        'granted' => $this->hasPermissionTo($name),
                    ])->values()->all(),
                ])
                ->values()
                ->all(),
        ];
    }
}
