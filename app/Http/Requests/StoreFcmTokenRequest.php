<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreFcmTokenRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /** @return array<string, list<string>> */
    public function rules(): array
    {
        return [
            'token' => ['required', 'string', 'max:255'],
            'device_type' => ['sometimes', 'string', 'in:web,ios,android'],
        ];
    }

    /** @return array<string, string> */
    public function messages(): array
    {
        return [
            'token.required' => 'An FCM token is required.',
            'token.max' => 'The FCM token must not exceed 255 characters.',
            'device_type.in' => 'The device type must be web, ios, or android.',
        ];
    }
}
