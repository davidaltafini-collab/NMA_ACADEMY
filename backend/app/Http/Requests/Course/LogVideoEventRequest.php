<?php

namespace App\Http\Requests\Course;

use Illuminate\Foundation\Http\FormRequest;

class LogVideoEventRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'action'           => [
                'required', 'string',
                'in:play,pause,seek,complete,error,visibility_hidden,right_click_blocked,shortcut_blocked',
            ],
            'position_seconds' => ['nullable', 'integer', 'min:0'],
            'metadata'         => ['nullable', 'array'],
        ];
    }
}
