<?php

namespace App\Http\Requests;

use App\Enums\UserRole;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreUserRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->role === UserRole::ADMIN;
    }

    public function rules(): array
    {
        return [
            'name'         => 'required|string|max:255',
            'email'        => 'required|email|max:255|unique:users,email',
            'password'     => 'required|string|min:8|confirmed',
            'role'         => ['required', Rule::enum(UserRole::class)],
            'company_name' => [
                Rule::requiredIf(fn() => $this->input('role') === UserRole::CLIENT->value),
                'nullable', 'string', 'max:255',
            ],
            'phone'        => [
                Rule::requiredIf(fn() => $this->input('role') === UserRole::CLIENT->value),
                'nullable', 'string', 'max:20',
            ],
            'address'      => 'nullable|string|max:500',
        ];
    }

    public function messages(): array
    {
        return [
            'name.required'             => 'Name is required.',
            'email.required'            => 'Email is required.',
            'email.unique'              => 'This email is already registered.',
            'password.required'         => 'Password is required.',
            'password.min'              => 'Password must be at least 8 characters.',
            'password.confirmed'        => 'Password confirmation does not match.',
            'role.required'             => 'Role is required.',
            'company_name.required_if'  => 'Company name is required for client.',
            'phone.required_if'         => 'Phone is required for client.',
        ];
    }

    public function userData(): array
    {
        return $this->only(['name', 'email', 'password', 'role']);
    }

    public function clientData(): array
    {
        return $this->only(['company_name', 'phone', 'address']);
    }

    public function isClient(): bool
    {
        return $this->input('role') === UserRole::CLIENT->value;
    }
}