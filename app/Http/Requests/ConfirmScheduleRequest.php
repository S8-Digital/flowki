<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ConfirmScheduleRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('create', \App\Models\CalendarEvent::class) ?? false;
    }

    /** @return array<string, mixed> */
    public function rules(): array
    {
        return [
            'shifts' => ['required', 'array', 'min:1', 'max:500'],
            'shifts.*.title' => ['required', 'string', 'max:255'],
            'shifts.*.start_at' => ['required', 'date'],
            'shifts.*.end_at' => ['nullable', 'date'],
            'shifts.*.is_all_day' => ['boolean'],
        ];
    }
}
