<?php

namespace App\Http\Requests;

use App\Enums\TaskPriority;
use App\Enums\TaskStatus;
use App\Enums\UserRole;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateTaskRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'project_id'   => ['sometimes', 'uuid', 'exists:projects,id'],
            'assigned_to'  => ['sometimes', 'nullable', 'uuid', 'exists:users,id'],
            'reporting_to' => ['sometimes', 'nullable', 'uuid', 'exists:users,id'],
            'title'        => ['sometimes', 'string', 'max:255'],
            'description'  => ['sometimes', 'nullable', 'string'],
            'status'       => ['sometimes', Rule::enum(TaskStatus::class)],
            'priority'     => ['sometimes', Rule::enum(TaskPriority::class)],
            'deadline'     => ['sometimes', 'nullable', 'date'],
        ];
    }

    public function taskData(): array
    {
        $data = $this->validated();

        if ($this->user()->role === UserRole::EMPLOYEE) {
            return array_intersect_key(
                $data,
                array_flip(['title', 'description', 'status', 'priority', 'deadline'])
            );
        }

        return $data;
    }
}