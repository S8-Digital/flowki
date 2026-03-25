<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class InboundEmailWebhookRequest extends FormRequest
{
    public function authorize(): bool
    {
        $secret = config('services.cloudflare.worker_secret');

        if (empty($secret)) {
            return false;
        }

        return hash_equals($secret, (string) $this->header('X-Worker-Secret', ''));
    }

    /** @return array<string, mixed> */
    public function rules(): array
    {
        return [
            'token' => ['required', 'string'],
            'to' => ['required', 'string', 'email'],
            'from' => ['required', 'string', 'email'],
            'subject' => ['nullable', 'string'],
            'raw' => ['required', 'string'],
        ];
    }

    protected function failedAuthorization(): never
    {
        abort(403, 'Forbidden');
    }
}
