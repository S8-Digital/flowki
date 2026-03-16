<?php

namespace App\Http\Requests\Settings;

use Database\Seeders\RolePermissionSeeder;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class UpdatePermissionRequest extends FormRequest
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
        $allPermissionNames = collect(RolePermissionSeeder::PERMISSIONS)->flatten()->implode(',');

        return [
            'permissions' => ['present', 'array'],
            'permissions.*' => ['string', 'in:'.$allPermissionNames],
        ];
    }

    /** @return array<string, string> */
    public function messages(): array
    {
        return [
            'permissions.*.in' => 'One or more of the selected permissions are not valid.',
        ];
    }
}
