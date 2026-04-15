<?php

namespace App\Http\Requests;

use App\Enums\UserRole;
use Illuminate\Foundation\Http\FormRequest;

class StoreClientRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->role === UserRole::ADMIN;
    }

    public function rules(): array
    {
        return [
            'name'         => ['required', 'string', 'max:255'],
            'email'        => ['required', 'email', 'max:255', 'unique:users,email'],
            'password'     => ['required', 'string', 'min:8', 'confirmed'],
            'company_name' => ['required', 'string', 'max:255'],
            'phone'        => ['required', 'string', 'max:20'],
            'address'      => ['nullable', 'string', 'max:500'],
        ];
    }

    public function clientData(): array
    {
        return $this->only(['company_name', 'phone', 'address']);
    }

    public function userData(): array
    {
        return $this->only(['name', 'email', 'password']);
    }
}