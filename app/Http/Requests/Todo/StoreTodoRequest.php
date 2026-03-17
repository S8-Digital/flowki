<?php

namespace App\Http\Requests\Todo;

use App\Enums\Priority;
use App\Enums\TodoCategory;
use App\Enums\TodoStatus;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreTodoRequest extends FormRequest
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
            'category' => ['required', Rule::enum(TodoCategory::class)],
            'priority' => ['required', Rule::enum(Priority::class)],
            'status' => ['required', Rule::enum(TodoStatus::class)],
            'due_date' => ['nullable', 'date'],
            'assigned_to' => [
                'nullable', 'integer',
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
            'category.required' => 'Please select a category.',
            'priority.required' => 'Please select a priority.',
            'status.required' => 'Please select a status.',
            'assigned_to.exists' => 'The selected user does not exist.',
        ];
    }
}
