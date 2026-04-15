<?php

namespace App\Repositories;

use App\Enums\ProjectStatus;
use App\Enums\TaskStatus;
use App\Enums\UserRole;
use App\Models\User;

class DashboardRepository
{
    public function __construct(
        private TaskRepository $taskRepository,
        private ProjectRepository $projectRepository,
        private ClientRepository $clientRepository,
        private UserRepository $userRepository
    ) {}

    public function getDashboardData(User $user): array
    {
        return [
            'stats'            => $this->getStats($user),
            'recentActivities' => $this->getRecentActivities($user),
        ];
    }

    private function getStats(User $user): array
    {
        return match ($user->role) {
            UserRole::ADMIN    => $this->getAdminStats(),
            UserRole::EMPLOYEE => $this->getEmployeeStats($user),
            UserRole::CLIENT   => $this->getClientStats($user),
            default            => [],
        };
    }

    private function getRecentActivities(User $user): array
    {
        return match ($user->role) {
            UserRole::ADMIN    => $this->getAdminActivities(),
            UserRole::EMPLOYEE => $this->getEmployeeActivities($user),
            UserRole::CLIENT   => $this->getClientActivities($user),
            default            => [],
        };
    }

    private function getAdminStats(): array
    {
        $currentWeekStart  = now()->startOfWeek();
        $previousWeekStart = now()->startOfWeek()->subWeek();

        $tasksThisWeek = $this->taskRepository->newQuery()
            ->where('created_at', '>=', $currentWeekStart)
            ->count();

        $tasksLastWeek = $this->taskRepository->newQuery()
            ->where('created_at', '>=', $previousWeekStart)
            ->where('created_at', '<', $currentWeekStart)
            ->count();

        $completedThisWeek = $this->taskRepository->newQuery()
            ->where('status', TaskStatus::COMPLETED->value)
            ->where('updated_at', '>=', $currentWeekStart)
            ->count();

        $completedLastWeek = $this->taskRepository->newQuery()
            ->where('status', TaskStatus::COMPLETED->value)
            ->where('updated_at', '>=', $previousWeekStart)
            ->where('updated_at', '<', $currentWeekStart)
            ->count();

        $taskGrowthPercent = match (true) {
            $tasksLastWeek > 0 => (int) round((($tasksThisWeek - $tasksLastWeek) / $tasksLastWeek) * 100),
            $tasksThisWeek > 0 => 100,
            default => 0,
        };

        $completionRateThisWeek = $tasksThisWeek > 0
            ? (int) round(($completedThisWeek / $tasksThisWeek) * 100)
            : 0;

        $completionRateLastWeek = $tasksLastWeek > 0
            ? (int) round(($completedLastWeek / $tasksLastWeek) * 100)
            : 0;

        $completionRateDelta = $completionRateThisWeek - $completionRateLastWeek;

        $newProjectsThisMonth = $this->projectRepository->newQuery()
            ->where('created_at', '>=', now()->startOfMonth())
            ->count();

        $joinedRecentlyCount = $this->userRepository->newQuery()
            ->where('role', UserRole::EMPLOYEE->value)
            ->where('created_at', '>=', now()->subDays(30))
            ->count();

        return [
            'totalTasks'      => $this->taskRepository->countAll(),
            'totalProjects'   => $this->projectRepository->countAll(),
            'totalClients'    => $this->clientRepository->countAll(),

            'totalEmployees'  => $this->userRepository->countByRole(UserRole::EMPLOYEE),
            
            'pendingTasks'    => $this->taskRepository->countByStatus(TaskStatus::PENDING),
            'inProgressTasks' => $this->taskRepository->countByStatus(TaskStatus::IN_PROGRESS),
            'completedTasks'  => $this->taskRepository->countByStatus(TaskStatus::COMPLETED),
            'overdueTasks'    => $this->taskRepository->getOverdueCount(),

            'activeProjects'  => $this->projectRepository->countByStatus(ProjectStatus::ACTIVE),
            'taskGrowthPercent' => $taskGrowthPercent,
            'completionRateDelta' => $completionRateDelta,
            'newProjectsThisMonth' => $newProjectsThisMonth,
            'joinedRecentlyCount' => $joinedRecentlyCount,
        ];
    }

    private function getEmployeeStats(User $user): array
    {
        $assignedTasks = $this->taskRepository->newQuery()->where('assigned_to', $user->id);

        return [
            'totalTasks'      => $assignedTasks->count(),
            'totalProjects'   => $user->projects()->count(),
            'pendingTasks'    => (clone $assignedTasks)->where('status', TaskStatus::PENDING->value)->count(),
            'inProgressTasks' => (clone $assignedTasks)->where('status', TaskStatus::IN_PROGRESS->value)->count(),
            'completedTasks'  => (clone $assignedTasks)->where('status', TaskStatus::COMPLETED->value)->count(),
            'overdueTasks'    => (clone $assignedTasks)
                ->where('status', '!=', TaskStatus::COMPLETED->value)
                ->where('deadline', '<', now())
                ->count(),
        ];
    }

    private function getClientStats(User $user): array
    {
        $client = $this->clientRepository->getByAttribute('user_id', $user->id);

        if (! $client) {
            return ['totalProjects' => 0, 'totalTasks' => 0, 'activeProjects' => 0, 'completedProjects' => 0];
        }

        $clientProjects = $this->projectRepository->getByClientId($client->id);
        $projectIds     = $clientProjects->pluck('id');

        return [
            'totalProjects'     => $clientProjects->count(),
            'totalTasks'        => $this->taskRepository->newQuery()->whereIn('project_id', $projectIds)->count(),
            'activeProjects'    => (clone $clientProjects)->where('status', ProjectStatus::ACTIVE->value)->count(),
            'completedProjects' => (clone $clientProjects)->where('status', ProjectStatus::COMPLETED->value)->count(),
            'pendingTasks'      => $this->taskRepository->newQuery()->whereIn('project_id', $projectIds)->where('status', TaskStatus::PENDING->value)->count(),
            'inProgressTasks'   => $this->taskRepository->newQuery()->whereIn('project_id', $projectIds)->where('status', TaskStatus::IN_PROGRESS->value)->count(),
        ];
    }

    private function getAdminActivities(): array
    {
        $recentTasks = $this->taskRepository->newQuery()
            ->with(['project', 'assignee'])
            ->latest()->take(5)->get()
            ->map(fn($task) => [
                'id'          => $task->id,
                'type'        => 'task',
                'title'       => $task->title,
                'description' => "Task assigned to {$task->assignee?->name}",
                'project'     => $task->project?->name,
                'status'      => $task->status,
                'createdAt'   => $task->created_at,
            ]);

        $recentProjects = $this->projectRepository->newQuery()
            ->with('client.user')
            ->latest()->take(5)->get()
            ->map(fn($project) => [
                'id'          => $project->id,
                'type'        => 'project',
                'title'       => $project->name,
                'description' => "Project created for {$project->client?->user?->name}",
                'status'      => $project->status,
                'createdAt'   => $project->created_at,
            ]);

        return $recentTasks->merge($recentProjects)
            ->sortByDesc('createdAt')
            ->take(10)
            ->values()
            ->all();
    }

    private function getEmployeeActivities(User $user): array
    {
        return $this->taskRepository->newQuery()
            ->with(['project', 'reporter'])
            ->where('assigned_to', $user->id)
            ->latest()->take(10)->get()
            ->map(fn($task) => [
                'id'          => $task->id,
                'type'        => 'task',
                'title'       => $task->title,
                'description' => "Assigned by {$task->reporter?->name}",
                'project'     => $task->project?->name,
                'status'      => $task->status,
                'deadline'    => $task->deadline,
                'createdAt'   => $task->created_at,
            ])
            ->all();
    }

    private function getClientActivities(User $user): array
    {
        $client = $this->clientRepository->getByAttribute('user_id', $user->id);

        if (! $client) {
            return [];
        }

        $projectIds = $this->projectRepository->getByClientId($client->id)->pluck('id');

        return $this->taskRepository->newQuery()
            ->with(['project', 'assignee'])
            ->whereIn('project_id', $projectIds)
            ->latest()->take(10)->get()
            ->map(fn($task) => [
                'id'          => $task->id,
                'type'        => 'task',
                'title'       => $task->title,
                'description' => "Assigned to {$task->assignee?->name}",
                'project'     => $task->project?->name,
                'status'      => $task->status,
                'createdAt'   => $task->created_at,
            ])
            ->all();
    }
}