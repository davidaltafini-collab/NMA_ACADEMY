<?php

namespace App\Http\Requests\Auth;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;

class RegisterRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name'     => ['required', 'string', 'max:255'],
            'email'    => [
                'required',
                'string',
                'email:rfc',
                'max:255',
                // Exclude soft-deleted users so their email can be re-registered
                Rule::unique('users', 'email')->whereNull('deleted_at'),
            ],
            'phone'    => ['nullable', 'string', 'max:20'],
            'password' => ['required', Password::min(8)->mixedCase()->numbers()],
        ];
    }

    public function messages(): array
    {
        return [
            'name.required'    => 'Numele este obligatoriu.',
            'name.max'         => 'Numele nu poate depasi 255 de caractere.',
            'email.required'   => 'Adresa de email este obligatorie.',
            'email.email'      => 'Adresa de email nu este valida.',
            'email.unique'     => 'Aceasta adresa de email este deja inregistrata.',
            'password.required' => 'Parola este obligatorie.',
        ];
    }
}
