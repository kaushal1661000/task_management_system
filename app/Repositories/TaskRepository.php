<?php

namespace App\Repositories;

use App\Enums\TaskStatus;
use Illuminate\Database\Eloquent\Builder;
use App\Http\Requests\StoreTaskRequest;
use App\Http\Requests\UpdateTaskRequest;
use App\Models\Task;
use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection as EloquentCollection;

class TaskRepository extends BaseRepository
{
    public function __construct(
        Task $model,
        private ProjectRepository $projectRepository,
        private UserRepository $userRepository
    ) {
        parent::__construct($model);
    }

    public function countByStatus(TaskStatus $status): int
    {
        return $this->newQuery()
            ->where('status', $status->value)
            ->count();
    }

     public function getByDateRange(string $startDate, string $endDate, array $with = [])
    {
        return $this->newQuery()
            ->whereBetween('created_at', [$startDate, $endDate])
            ->when(count($with) > 0, fn($q) => $q->with($with));
    }

    public function getOverdueCount(): int
    {
        return $this->newQuery()
            ->where('status', '!=', TaskStatus::COMPLETED->value)
            ->where('deadline', '<', now())
            ->count();
    }

    public function getWithRelations(?string $search = null, ?string $status = null): LengthAwarePaginator
    {
        $query = $this->newQuery()
            ->with(['project.client', 'assignee', 'reporter']);

        $this->applyFilters($query, $search, $status);

        return $query->paginate(10)->withQueryString();
    }

    public function getByAssignee(string $userId, ?string $search = null, ?string $status = null): LengthAwarePaginator
    {
        $query = $this->newQuery()
            ->where('assigned_to', $userId)
            ->with(['project.client', 'assignee', 'reporter']);

        $this->applyFilters($query, $search, $status);

        return $query->paginate(10)->withQueryString();
    }

    private function applyFilters(Builder $query, ?string $search = null, ?string $status = null): void
    {
        $searchTerm = trim((string) $search);
        $statusTerm = trim((string) $status);

        if ($searchTerm !== '') {
            $query->where(function (Builder $q) use ($searchTerm) {
                $q->where('title', 'like', "%{$searchTerm}%")
                    ->orWhere('description', 'like', "%{$searchTerm}%")
                    ->orWhereHas('project', function (Builder $projectQuery) use ($searchTerm) {
                        $projectQuery->where('name', 'like', "%{$searchTerm}%");
                    })
                    ->orWhereHas('assignee', function (Builder $assigneeQuery) use ($searchTerm) {
                        $assigneeQuery->where('name', 'like', "%{$searchTerm}%")
                            ->orWhere('email', 'like', "%{$searchTerm}%");
                    });
            });
        }

        if ($statusTerm !== '') {
            $query->where('status', $statusTerm);
        }
    }

    public function getTaskFormData(): array
    {
        return [
            'projects'  => $this->projectRepository->getForTaskSelection(),
            'employees' => $this->userRepository->getEmployeesForSelection(['id', 'name']),
        ];
    }

    public function getTaskCreateFormData(User $user): array
    {
        $projects = $this->projectRepository->getForTaskCreationByUser($user);

        $projectsWithMembers = $this->projectRepository->getWithMembersByIds($projects->pluck('id'));

        $projectMembersByProject = $projectsWithMembers->mapWithKeys(fn($project) => [
            (string) $project->id => $project->members
                ->map(fn($member) => [
                    'id'   => (string) $member->id,
                    'name' => $member->name,
                ])
                ->values()
                ->all(),
        ]);

        return [
            'projects'                => $projects,
            'projectMembersByProject' => $projectMembersByProject,
            'admins'                  => $this->userRepository->getAdminsForSelection(['id', 'name']),
        ];
    }

    public function createTask(StoreTaskRequest $request): Task
    {
        return $this->store($request->taskData());
    }

    public function updateTask(Task $task, UpdateTaskRequest $request): Task
    {
        return $this->update($task->id, $request->taskData());
    }
}