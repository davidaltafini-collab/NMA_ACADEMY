<?php

namespace App\Http\Requests\User;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class RequestEmailChangeRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'new_email'        => [
                'required',
                'string',
                'email',
                'max:255',
                Rule::unique('users', 'email')->ignore($this->user()->id),
                Rule::notIn([$this->user()->email]),
            ],
            'current_password' => ['required', 'string'],
        ];
    }

    public function messages(): array
    {
        return [
            'new_email.required' => 'Adresa de email noua este obligatorie.',
            'new_email.email'    => 'Adresa de email nu este valida.',
            'new_email.unique'   => 'Aceasta adresa de email este deja folosita.',
            'new_email.not_in'   => 'Noua adresa de email trebuie sa fie diferita de cea curenta.',
            'current_password.required' => 'Parola curenta este obligatorie.',
        ];
    }
}
