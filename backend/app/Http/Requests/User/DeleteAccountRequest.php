<?php

namespace App\Http\Requests\User;

use Illuminate\Foundation\Http\FormRequest;

class DeleteAccountRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'password'     => ['required', 'string'],
            'confirmation' => ['required', 'string', 'in:DELETE'],
        ];
    }

    public function messages(): array
    {
        return [
            'password.required'     => 'Parola este obligatorie.',
            'confirmation.required' => 'Confirmarea este obligatorie.',
            'confirmation.in'       => 'Trebuie sa scrii exact DELETE pentru a confirma stergerea contului.',
        ];
    }
}
