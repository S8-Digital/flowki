<?php

namespace App\Http\Requests\Chore;

use App\Enums\ChoreFrequency;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreChoreRequest extends FormRequest
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
        $familyId = $this->user()?->family_id;

        return [
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:2000'],
            'frequency' => ['required', Rule::enum(ChoreFrequency::class)],
            'next_due_date' => ['nullable', 'date'],
            'assignee_ids' => ['nullable', 'array'],
            'assignee_ids.*' => [
                'integer',
                Rule::exists('users', 'id')->where('family_id', $familyId),
            ],
            'reminder_enabled' => ['nullable', 'boolean'],
            'reminder_lead_time' => ['nullable', 'integer', 'min:1', 'max:10080'],
        ];
    }

    /** @return array<string, string> */
    public function messages(): array
    {
        return [
            'title.required' => 'A title is required.',
            'frequency.required' => 'Please select a frequency.',
        ];
    }
}
