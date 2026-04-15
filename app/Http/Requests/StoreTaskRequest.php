<?php

namespace App\Http\Requests;

use App\Enums\TaskPriority;
use App\Enums\TaskStatus;
use App\Enums\UserRole;
use Illuminate\Database\Query\Builder;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreTaskRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $isEmployee = $this->user()?->role === UserRole::EMPLOYEE;

        return [
            'project_id'   => [
                'required',
                'uuid',
                'exists:projects,id',
                ...($isEmployee
                    ? [Rule::exists('project_members', 'project_id')->where(fn(Builder $query) => $query->where('user_id', (string) $this->user()?->id))]
                    : []),
            ],
            'assigned_to'  => [
                Rule::requiredIf($isEmployee),
                ...($isEmployee ? [] : ['nullable']),
                'uuid',
                Rule::exists('project_members', 'user_id')
                    ->where(fn(Builder $query) => $query->where('project_id', $this->input('project_id'))),
            ],
            'reporting_to' => [
                Rule::requiredIf($isEmployee),
                ...($isEmployee ? [] : ['nullable']),
                'uuid',
                Rule::exists('users', 'id')
                    ->where(fn(Builder $query) => $query->where('role', UserRole::ADMIN->value)),
            ],
            'title'        => ['required', 'string', 'max:255'],
            'description'  => ['nullable', 'string'],
            'status'       => ['required', Rule::enum(TaskStatus::class)],
            'priority'     => ['required', Rule::enum(TaskPriority::class)],
            'deadline'     => ['nullable', 'date'],
        ];
    }

    public function taskData(): array
    {
        $data = $this->validated();

        if ($this->user()->role === UserRole::EMPLOYEE) {
            $data['assigned_to'] = (string) $this->user()->id;
        }

        return $data;
    }
}