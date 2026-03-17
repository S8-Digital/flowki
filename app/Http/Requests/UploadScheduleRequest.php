<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UploadScheduleRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('create', \App\Models\CalendarEvent::class) ?? false;
    }

    /** @return array<string, mixed> */
    public function rules(): array
    {
        return [
            'file' => [
                'required',
                'file',
                'max:10240', // 10 MB
                'mimes:txt,csv,jpg,jpeg,png,gif,webp,pdf',
            ],
        ];
    }

    /** @return array<string, string> */
    public function messages(): array
    {
        return [
            'file.mimes' => 'Only plain text (.txt, .csv), image (.jpg, .jpeg, .png, .gif, .webp), and PDF files are accepted.',
            'file.max' => 'The file may not be larger than 10 MB.',
        ];
    }
}
