<?php

namespace App\Http\Requests\Family;

use App\Models\Family;
use Illuminate\Foundation\Http\FormRequest;

class JoinFamilyRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /** @return array<string, list<string>> */
    public function rules(): array
    {
        return [
            'invite_code' => ['required', 'string', 'size:8', 'exists:families,invite_code'],
        ];
    }

    /** @return array<string, string> */
    public function messages(): array
    {
        return [
            'invite_code.required' => 'Please enter an invite code.',
            'invite_code.size' => 'Invite codes are 8 characters long.',
            'invite_code.exists' => 'No family found with that invite code.',
        ];
    }

    public function family(): Family
    {
        return Family::where('invite_code', $this->invite_code)->firstOrFail();
    }
}
