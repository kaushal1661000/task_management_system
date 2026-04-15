<?php

namespace App\Http\Requests;

use App\Enums\ProjectStatus;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateProjectRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'client_id'    => ['required', 'uuid', 'exists:clients,id'],
            'name'         => ['required', 'string', 'max:255', 'unique:projects,name,' . $this->route('project')->id],
            'description'  => ['nullable', 'string'],
            'status'       => ['required', Rule::enum(ProjectStatus::class)],
            'start_date'   => ['nullable', 'date'],
            'end_date'     => ['nullable', 'date', 'after_or_equal:start_date'],
            'budget'       => ['nullable', 'numeric', 'min:0'],
            'member_ids'   => ['nullable', 'array'],
            'member_ids.*' => ['uuid', 'exists:users,id'],
        ];
    }

    public function projectData(): array
    {
        return $this->except('member_ids');
    }

    public function memberIds(): ?array
    {
        return $this->has('member_ids') ? $this->input('member_ids', []) : null;
    }
}