<?php

namespace App\Http\Requests\Auth;

use Illuminate\Foundation\Http\FormRequest;

class VerifyEmailCodeRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'email' => ['required', 'string', 'email'],
            'code'  => ['required', 'string', 'size:6'],
        ];
    }

    public function messages(): array
    {
        return [
            'email.required' => 'Adresa de email este obligatorie.',
            'email.email'    => 'Adresa de email nu este valida.',
            'code.required'  => 'Codul de verificare este obligatoriu.',
            'code.size'      => 'Codul trebuie sa aiba exact 6 caractere.',
        ];
    }
}
