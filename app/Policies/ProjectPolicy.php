<?php

namespace App\Policies;

use App\Enums\UserRole;
use App\Models\Project;
use App\Models\User;
use Illuminate\Auth\Access\Response;

class ProjectPolicy
{
    public function viewAny(User $user): bool
    {
        return in_array($user->role, [UserRole::ADMIN, UserRole::EMPLOYEE, UserRole::CLIENT], true);
    }

    public function view(User $user, Project $project): bool
    {
        return $user->role === UserRole::ADMIN || 
               $project->members()->where('user_id', $user->id)->exists() ||
               $project->client()->where('user_id', $user->id)->exists();
    }

    public function create(User $user): bool
    {
        return $user->role === UserRole::ADMIN;
    }

    public function update(User $user, Project $project): bool
    {
        return $user->role === UserRole::ADMIN;
    }

    public function delete(User $user, Project $project): bool
    {
        return $user->role === UserRole::ADMIN;
    }
}

