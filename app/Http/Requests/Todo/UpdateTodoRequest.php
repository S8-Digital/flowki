<?php

namespace App\Http\Requests\Todo;

use App\Enums\Priority;
use App\Enums\TodoCategory;
use App\Enums\TodoStatus;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateTodoRequest extends FormRequest
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
}
