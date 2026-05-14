<?php

namespace App\Http\Requests\Course;

use Illuminate\Foundation\Http\FormRequest;

class WatchSessionEndRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'watch_session_id'     => ['required', 'integer', 'min:1'],
            'ended_reason'         => ['nullable', 'string', 'in:user_exit,paused,completed,error,video_changed,page_exit'],
            'current_time_seconds' => ['nullable', 'integer', 'min:0'],
            'duration_seconds'     => ['nullable', 'integer', 'min:1'],
        ];
    }
}
