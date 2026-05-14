<?php

namespace App\Http\Requests\User;

use Illuminate\Foundation\Http\FormRequest;

class ChangePasswordRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'current_password'  => ['required', 'string'],
            'password'          => [
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
            'current_password.required'  => 'Parola curenta este obligatorie.',
            'password.required'          => 'Parola noua este obligatorie.',
            'password.min'               => 'Parola trebuie sa aiba cel putin 8 caractere.',
            'password.confirmed'         => 'Confirmarea parolei nu coincide.',
            'password.regex'             => 'Parola trebuie sa contina cel putin o litera mare si o cifra.',
            'password_confirmation.required' => 'Confirmarea parolei este obligatorie.',
        ];
    }
}
