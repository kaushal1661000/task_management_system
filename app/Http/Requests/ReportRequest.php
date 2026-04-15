<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ReportRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'start_date' => ['nullable', 'date'],
            'end_date'   => ['nullable', 'date', 'after_or_equal:start_date'],
            'project_id' => ['nullable', 'uuid', 'exists:projects,id'],
            'user_id'    => ['nullable', 'uuid', 'exists:users,id'],
        ];
    }

    public function startDate(): string
    {
        return $this->input('start_date', now()->subMonth()->toDateString());
    }

    public function endDate(): string
    {
        return $this->input('end_date', now()->toDateString());
    }

    public function projectId(): ?string
    {
        return $this->input('project_id');
    }

    public function userId(): ?string
    {
        return $this->input('user_id');
    }

    public function filters(): array
    {
        return [
            'start_date' => $this->startDate(),
            'end_date'   => $this->endDate(),
            'project_id' => $this->projectId(),
            'user_id'    => $this->userId(),
        ];
    }
}