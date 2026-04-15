<?php

namespace App\Repositories;

use App\Enums\ProjectStatus;
use App\Enums\UserRole;
use App\Http\Requests\StoreProjectRequest;
use App\Http\Requests\UpdateProjectRequest;
use App\Models\Project;
use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;

class ProjectRepository extends BaseRepository
{
    public function __construct(
        Project $model,
        private ClientRepository $clientRepository,
        private UserRepository $userRepository
    ) {
        parent::__construct($model);
    }

      public function countByStatus(ProjectStatus $status): int
    {
        return $this->newQuery()
            ->where('status', $status->value)
            ->count();
    }

     public function getByClientId(string $clientId, array $with = [])
    {
        return $this->newQuery()
            ->where('client_id', $clientId)
            ->when(count($with) > 0, fn($q) => $q->with($with));
    }

    public function getForTaskSelection(): Collection
    {
        return $this->getAll(relations: [],withTrashed: false, selects: ['id', 'name'],filters: false,orderBy: ['name' => 'asc']);
    }


    public function getWithRelationsForUser(User $user, ?string $search = null): LengthAwarePaginator
    {
        $searchTerm = trim((string) $search);

        $query = $this->newQuery()
            ->with(['client.user', 'members', 'tasks.assignee'])
            ->withCount(['tasks', 'members']);

        if ($searchTerm !== '') {
            $query->where(function ($q) use ($searchTerm) {
                $q->where('name', 'like', "%{$searchTerm}%")
                    ->orWhere('description', 'like', "%{$searchTerm}%")
                    ->orWhereHas('client', function ($clientQuery) use ($searchTerm) {
                        $clientQuery->where('company_name', 'like', "%{$searchTerm}%")
                            ->orWhereHas('user', function ($userQuery) use ($searchTerm) {
                                $userQuery->where('name', 'like', "%{$searchTerm}%")
                                    ->orWhere('email', 'like', "%{$searchTerm}%");
                            });
                    });
            });
        }

        if ($user->role === UserRole::EMPLOYEE) {
            $query->whereHas('members', fn($q) => $q->where('users.id', $user->id));
        }

        if ($user->role === UserRole::CLIENT) {
            $query->whereHas('client', fn($q) => $q->where('user_id', $user->id));
        }

        return $query->paginate(10)->withQueryString();
    }

    public function getProjectFormData(): array
    {
        return [
            'clients'   => $this->clientRepository->getForProjectSelection(),
            'employees' => $this->userRepository->getEmployeesForSelection(['id', 'name', 'email']),
        ];
    }

    public function createWithMembers(StoreProjectRequest $request): Project
    {
        $project = $this->store($request->projectData());

        $this->syncProjectMembers($project, $request->memberIds());

        return $project->fresh();
    }

    public function updateWithMembers(Project $project, UpdateProjectRequest $request): Project
    {
        $updatedProject = $this->update($project->id, $request->projectData());

        $memberIds = $request->memberIds();
        if ($memberIds !== null) {
            $this->syncProjectMembers($updatedProject, $memberIds);
        }

        return $updatedProject->fresh();
    }

    public function syncProjectMembers(Project $project, array $memberIds): void
    {
        $normalized = collect($memberIds)->filter()->unique()->values();

        $project->projectMembers()->delete();

        if ($normalized->isEmpty()) {
            return;
        }

        $project->projectMembers()->createMany(
            $normalized->map(fn(string $id) => [
                'user_id' => $id,
                'role'    => 'member',
            ])->all()
        );
    }

    public function getForTaskCreationByUser(User $user): Collection
    {
        return $this->newQuery()
            ->select(['id', 'name'])
            ->orderBy('name')
            ->when(
                $user->role === UserRole::EMPLOYEE,
                fn($q) => $q->whereHas('members', fn($q) => $q->where('users.id', $user->id))
            )
            ->get();
    }

    public function getWithMembersByIds(Collection $projectIds): Collection
    {
        return $this->newQuery()
            ->whereIn('id', $projectIds)
            ->with(['members:id,name'])
            ->get(['id']);
    }
}