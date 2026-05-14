<?php

namespace App\Http\Requests\Auth;

use Illuminate\Foundation\Http\FormRequest;

class ResetPasswordRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'email'                 => ['required', 'string', 'email', 'max:255'],
            'token'                 => ['required', 'string'],
            'password'              => [
                'required',
                'string',
                'min:8',
                'confirmed',
                'regex:/^(?=.*[A-Z])(?=.*\d).+$/',
            ],
            'password_confirmation' => ['required', 'string'],
        ];
    }

    public function messages(): array
    {
        return [
            'email.required'                 => 'Adresa de email este obligatorie.',
            'email.email'                    => 'Adresa de email nu este valida.',
            'token.required'                 => 'Token-ul de resetare este obligatoriu.',
            'password.required'              => 'Parola este obligatorie.',
            'password.min'                   => 'Parola trebuie sa aiba cel putin 8 caractere.',
            'password.confirmed'             => 'Confirmarea parolei nu coincide.',
            'password.regex'                 => 'Parola trebuie sa contina cel putin o litera mare si o cifra.',
            'password_confirmation.required' => 'Confirmarea parolei este obligatorie.',
        ];
    }
}
