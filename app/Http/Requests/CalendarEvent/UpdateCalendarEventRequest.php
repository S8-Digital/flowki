<?php

namespace App\Http\Requests\CalendarEvent;

use App\Enums\RecurrenceType;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateCalendarEventRequest extends FormRequest
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
        return [
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:2000'],
            'location' => ['nullable', 'string', 'max:255'],
            'start_at' => ['required', 'date'],
            'end_at' => ['nullable', 'date', 'after_or_equal:start_at'],
            'is_all_day' => ['boolean'],
            'recurrence' => ['nullable', Rule::enum(RecurrenceType::class)],
            'reminder_at' => ['nullable', 'date'],
            'color' => ['nullable', 'string', 'max:20'],
            'attendee_ids' => ['nullable', 'array'],
            'attendee_ids.*' => ['integer', 'exists:users,id'],
        ];
    }
}
