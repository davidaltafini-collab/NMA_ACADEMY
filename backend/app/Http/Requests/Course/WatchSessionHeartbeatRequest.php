<?php

namespace App\Http\Requests\Course;

use Illuminate\Foundation\Http\FormRequest;

class WatchSessionHeartbeatRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'watch_session_id'     => ['required', 'integer', 'min:1'],
            'current_time_seconds' => ['nullable', 'integer', 'min:0'],
        ];
    }
}
