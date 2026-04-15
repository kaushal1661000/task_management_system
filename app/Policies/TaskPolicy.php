<?php

namespace App\Policies;

use App\Enums\UserRole;
use App\Models\Task;
use App\Models\User;
use Illuminate\Auth\Access\Response;

class TaskPolicy
{
    public function viewAny(User $user): bool
    {
        return in_array($user->role, [UserRole::ADMIN, UserRole::EMPLOYEE], true);
    }

    public function view(User $user, Task $task): bool
    {
         return $user->role === UserRole::ADMIN || 
             $task->assigned_to === $user->id;
    }

    public function create(User $user): bool
    {
        return in_array($user->role, [UserRole::ADMIN, UserRole::EMPLOYEE], true);
    }

    public function update(User $user, Task $task): bool
    {
        return $user->role === UserRole::ADMIN || 
               $task->assigned_to === $user->id;
    }

    public function delete(User $user, Task $task): bool
    {
        return $user->role === UserRole::ADMIN;
    }
}

