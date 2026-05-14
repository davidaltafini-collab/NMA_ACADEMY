<?php

namespace App\Http\Requests\Auth;

use Illuminate\Foundation\Http\FormRequest;

class LoginRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'email'              => ['required', 'string', 'email'],
            'password'           => ['required', 'string'],
            'device_fingerprint' => ['nullable', 'string', 'max:64'],
        ];
    }

    public function messages(): array
    {
        return [
            'email.required'    => 'Adresa de email este obligatorie.',
            'email.email'       => 'Adresa de email nu este valida.',
            'password.required' => 'Parola este obligatorie.',
        ];
    }
}
