<?php

namespace App\Http\Requests\Todo;

use App\Enums\Priority;
use App\Enums\TodoCategory;
use App\Enums\TodoStatus;
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
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:2000'],
            'category' => ['required', Rule::enum(TodoCategory::class)],
            'priority' => ['required', Rule::enum(Priority::class)],
            'status' => ['required', Rule::enum(TodoStatus::class)],
            'due_date' => ['nullable', 'date'],
            'assigned_to' => ['nullable', 'integer', 'exists:users,id'],
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
