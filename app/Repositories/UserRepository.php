<?php

namespace App\Repositories;

use App\Enums\ProjectStatus;
use App\Enums\TaskStatus;
use App\Enums\UserRole;
use App\Http\Requests\StoreUserRequest;
use App\Http\Requests\UpdateUserRequest;
use App\Models\Client;
use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Hash;

class UserRepository extends BaseRepository
{
    public function __construct(User $model)
    {
        parent::__construct($model);
    }

    public function countByRole(UserRole $role): int
    {
        return $this->newQuery()
            ->where('role', $role->value)
            ->count();
    }

    public function getUsersByRole(
        UserRole $role,
        array $select = ['id', 'name'],
        string $orderBy = 'name',
        string $direction = 'asc'
    ): Collection {
        return $this->newQuery()
            ->where('role', $role->value)
            ->orderBy($orderBy, $direction)
            ->get($select);
    }

    public function getEmployeesForSelection(array $select = ['id', 'name', 'email']): Collection
    {
        return $this->getUsersByRole(UserRole::EMPLOYEE, $select);
    }

    public function getAdminsForSelection(array $select = ['id', 'name']): Collection
    {
        return $this->getUsersByRole(UserRole::ADMIN, $select);
    }

    public function getAdminIds(): Collection
    {
        return $this->getAll(
            relations: [],
            withTrashed: false,
            selects: ['id']
        )
        ->where('role', UserRole::ADMIN->value)
        ->pluck('id')
        ->map(fn($id) => (string) $id);
    }

    public function createClientUser(array $inputs): User
    {
        /** @var User $user */
        $user = $this->store([
            'name'     => $inputs['name'],
            'email'    => $inputs['email'],
            'password' => Hash::make($inputs['password']),
            'role'     => UserRole::CLIENT->value,
        ]);

        return $user;
    }

    public function storeWithClient(StoreUserRequest $request): User
    {
        /** @var User $user */
        $user = $this->store([
            ...$request->userData(),
            'password' => Hash::make($request->input('password')),
        ]);

        if ($request->isClient()) {
            $user->clients()->create([
                'user_id' => $user->id,
                ...$request->clientData(),
            ]);
        }

        return $user;
    }

    public function updateWithClient(User $user, UpdateUserRequest $request): User
    {
        $userData = $request->userData();

        if (! empty($userData['password'])) {
            $userData['password'] = Hash::make($userData['password']);
        }

        $updatedUser = $this->update($user->id, $userData);

        if ($request->isClient()) {
            /** @var Client|null $client */
            $client = $user->clients()->first();

            $client
                ? $client->update($request->clientData())
                : $user->clients()->create([
                    'user_id' => $user->id,
                    ...$request->clientData(),
                ]);
        }

        return $updatedUser;
    }

    public function destroyWithClient(User $user): bool
    {
        $user->clients()->delete();
        
        return $this->destroy($user->id);
    }

    public function getPaginatedWithFilters(Request $request): LengthAwarePaginator
    {
        $query = $this->newQuery()->with('clients');

        if ($request->filled('role')) {
            $query->where('role', $request->role);
        }

        if ($request->filled('search')) {
            $search = $request->search;

            $query->where(function (Builder $q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            });
        }

        return $query
            ->latest()
            ->paginate(10);
    }

    public function getByIdWithClients(string $userId): ?User
    {
        return $this->getById($userId, ['clients']);
    }

    public function getByIdWithStats(string $userId): array
    {
        /** @var User|null $user */
        $user = $this->getById($userId, ['clients', 'assignedTasks.project', 'projects']);

        if (! $user) {
            return ['user' => null, 'stats' => []];
        }

        $stats = match ($user->role) {
            UserRole::EMPLOYEE => [
                'totalTasks'     => $user->assignedTasks()->count(),
                'completedTasks' => $user->assignedTasks()
                    ->where('status', TaskStatus::COMPLETED->value)
                    ->count(),
                'totalProjects'  => $user->projects()->count(),
            ],

            UserRole::CLIENT => (function () use ($user): array {
                $client = $user->clients()->first();

                if (! $client instanceof Client) {
                    return [];
                }

                return [
                    'totalProjects'  => $client->projects()->count(),
                    'activeProjects' => $client->projects()
                        ->where('status', ProjectStatus::ACTIVE->value)
                        ->count(),
                ];
            })(),

            default => [],
        };

        return ['user' => $user, 'stats' => $stats];
    }
}