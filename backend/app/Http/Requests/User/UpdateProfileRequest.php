<?php

namespace App\Http\Requests\User;

use Illuminate\Foundation\Http\FormRequest;

class UpdateProfileRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name'  => ['required', 'string', 'max:255'],
            'phone' => ['nullable', 'string', 'max:30'],
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'Numele este obligatoriu.',
            'name.string'   => 'Numele trebuie sa fie un text.',
            'name.max'      => 'Numele nu poate depasi 255 de caractere.',
            'phone.string'  => 'Numarul de telefon trebuie sa fie un text.',
            'phone.max'     => 'Numarul de telefon nu poate depasi 30 de caractere.',
        ];
    }
}
