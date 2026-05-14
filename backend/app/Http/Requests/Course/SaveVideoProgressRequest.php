<?php

namespace App\Http\Requests\Course;

use Illuminate\Foundation\Http\FormRequest;

class SaveVideoProgressRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'current_time_seconds' => ['required', 'integer', 'min:0'],
            'duration_seconds'     => ['required', 'integer', 'min:1'],
            'watched_seconds'      => ['nullable', 'integer', 'min:0'],
            'is_completed'         => ['nullable', 'boolean'],
        ];
    }
}
