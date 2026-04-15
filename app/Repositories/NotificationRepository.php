<?php

namespace App\Repositories;

use App\Models\Client;
use App\Models\Notification;
use App\Models\Project;
use App\Models\Task;
use App\Models\User;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\Request;
use Illuminate\Notifications\DatabaseNotification;
use Illuminate\Support\Collection;
use Illuminate\Support\Str;

class NotificationRepository extends BaseRepository
{
    private const NOTIFIABLE_TYPE = User::class;

    public function __construct(
        Notification $model,
        private UserRepository $userRepository
    ) {
        parent::__construct($model);
    }

    public function getUserNotifications(string $userId, int $limit = 10): Collection
    {
        return $this->newQuery()
            ->where('notifiable_id', $userId)
            ->where('notifiable_type', self::NOTIFIABLE_TYPE)
            ->latest()
            ->take($limit)
            ->get()
            ->map(fn(Notification $n) => [
                'id'        => $n->id,
                'type'      => $this->getNotificationType($n->type),
                'title'     => $n->data['title'] ?? 'Notification',
                'message'   => $n->data['message'] ?? '',
                'icon'      => $n->data['icon'] ?? 'bell',
                'color'     => $n->data['color'] ?? 'blue',
                'link'      => $n->data['link'] ?? null,
                'readAt'    => $n->read_at,
                'createdAt' => $n->created_at,
            ]);
    }

    public function getUnreadCount(string $userId): int
    {
        return $this->newQuery()
            ->where('notifiable_id', $userId)
            ->where('notifiable_type', self::NOTIFIABLE_TYPE)
            ->whereNull('read_at')
            ->count();
    }

    public function markAsRead(string $notificationId, string $userId): bool
    {
        $notification = $this->findUserNotification($notificationId, $userId);

        if (! $notification->read_at) {
            $notification->markAsRead();
        }

        return true;
    }

    public function markAllAsRead(string $userId): int
    {
        return $this->newQuery()
            ->where('notifiable_id', $userId)
            ->where('notifiable_type', self::NOTIFIABLE_TYPE)
            ->whereNull('read_at')
            ->update(['read_at' => now()]);
    }

    public function deleteNotification(string $notificationId, string $userId): bool
    {
        $notification = $this->findUserNotification($notificationId, $userId);
        
        return $this->destroy($notification->id);
    }

    public function createNotification(string $userId, array $data): DatabaseNotification
    {
        $user = $this->userRepository->getById($userId);

        if (! $user) {
            throw new ModelNotFoundException("User {$userId} not found.");
        }

        return $user->notifications()->create([
            'id'   => (string) Str::uuid(),
            'type' => $data['type'] ?? 'App\Notifications\GeneralNotification',
            'data' => [
                'title'   => $data['title'],
                'message' => $data['message'],
                'icon'    => $data['icon'] ?? 'bell',
                'color'   => $data['color'] ?? 'blue',
                'link'    => $data['link'] ?? null,
            ],
        ]);
    }

    public function notifyClientCreated(Request $request, Client $client): void
    {
        $client->loadMissing('user:id,name');

        $clientName   = $client->company_name ?: ($client->user?->name ?? 'Client');
        $recipientIds = $this->userRepository->getAdminIds()
            ->push((string) $client->user_id)
            ->push((string) $request->user()->id)
            ->filter()->unique()->values();

        foreach ($recipientIds as $recipientId) {
            $isClientUser = $recipientId === (string) $client->user_id;

            $this->createNotification($recipientId, [
                'type'    => 'App\\Notifications\\ClientCreatedNotification',
                'title'   => 'New client created',
                'message' => $isClientUser
                    ? "Welcome! Your client profile for {$clientName} has been created."
                    : "Client {$clientName} has been created.",
                'icon'    => 'user',
                'color'   => 'green',
                'link'    => $isClientUser ? route('dashboard') : route('clients.index'),
            ]);
        }
    }

    public function notifyClientUpdated(Request $request, Client $client): void
    {
        $client->loadMissing('user:id,name');

        $clientName   = $client->company_name ?: ($client->user?->name ?? 'Client');
        $recipientIds = $this->userRepository->getAdminIds()
            ->push((string) $client->user_id)
            ->push((string) $request->user()->id)
            ->filter()->unique()->values();

        foreach ($recipientIds as $recipientId) {
            $isClientUser = $recipientId === (string) $client->user_id;

            $this->createNotification($recipientId, [
                'type'    => 'App\\Notifications\\ClientUpdatedNotification',
                'title'   => 'Client updated',
                'message' => $isClientUser
                    ? "Your client profile for {$clientName} has been updated."
                    : "Client {$clientName} has been updated.",
                'icon'    => 'user',
                'color'   => 'blue',
                'link'    => $isClientUser ? route('dashboard') : route('clients.index'),
            ]);
        }
    }

    public function notifyClientDeleted(Request $request, string $deletedClientUserId, string $deletedClientName): void
    {
        $recipientIds = $this->userRepository->getAdminIds()
            ->filter(fn($id) => $id !== $deletedClientUserId)
            ->push((string) $request->user()->id)
            ->filter()->unique()->values();

        foreach ($recipientIds as $recipientId) {
            $this->createNotification($recipientId, [
                'type'    => 'App\\Notifications\\ClientDeletedNotification',
                'title'   => 'Client deleted',
                'message' => "Client {$deletedClientName} has been deleted.",
                'icon'    => 'user',
                'color'   => 'red',
                'link'    => route('clients.index'),
            ]);
        }
    }


    public function notifyProjectCreated(Request $request, Project $project): void
    {
        $project->loadMissing(['members:id', 'client.user:id']);

        foreach ($this->resolveProjectRecipients($request->user()->id, $project) as $recipientId) {
            $this->createNotification($recipientId, [
                'type'    => 'App\\Notifications\\ProjectCreatedNotification',
                'title'   => 'New project created',
                'message' => "{$project->name} has been created.",
                'icon'    => 'project',
                'color'   => 'green',
                'link'    => route('projects.show', $project->id),
            ]);
        }
    }

    public function notifyProjectUpdated(Request $request, Project $project): void
    {
        $project->loadMissing(['members:id', 'client.user:id']);

        foreach ($this->resolveProjectRecipients($request->user()->id, $project) as $recipientId) {
            $this->createNotification($recipientId, [
                'type'    => 'App\\Notifications\\ProjectUpdatedNotification',
                'title'   => 'Project updated',
                'message' => "{$project->name} has been updated.",
                'icon'    => 'project',
                'color'   => 'blue',
                'link'    => route('projects.show', $project->id),
            ]);
        }
    }

    public function notifyProjectStatusChange(Request $request, Project $project, string $oldStatus, string $newStatus): void
    {
        $project->loadMissing(['members:id', 'client.user:id']);

        $color = match ($newStatus) {
            'completed' => 'green',
            'paused'    => 'yellow',
            default     => 'blue',
        };

        foreach ($this->resolveProjectRecipients($request->user()->id, $project) as $recipientId) {
            $this->createNotification($recipientId, [
                'type'    => 'App\\Notifications\\ProjectStatusUpdatedNotification',
                'title'   => 'Project status updated',
                'message' => "{$project->name} status changed from " . ucfirst($oldStatus) . " to " . ucfirst($newStatus) . ".",
                'icon'    => 'project',
                'color'   => $color,
                'link'    => route('projects.show', $project->id),
            ]);
        }
    }

    public function notifyProjectDeleted(string $projectName, array $recipientIds): void
    {
        foreach ($recipientIds as $recipientId) {
            $this->createNotification($recipientId, [
                'type'    => 'App\\Notifications\\ProjectDeletedNotification',
                'title'   => 'Project deleted',
                'message' => "{$projectName} has been deleted.",
                'icon'    => 'project',
                'color'   => 'red',
                'link'    => route('projects.index'),
            ]);
        }
    }

    public function notifyProjectAssignedMembers(Project $project, array $memberIds, string $actorName, bool $isCreate): void
    {
        $normalized = collect($memberIds)->filter()->map(fn($id) => (string) $id)->unique()->values();

        foreach ($normalized as $memberId) {
            $this->createNotification($memberId, [
                'type'    => 'App\\Notifications\\ProjectAssignedNotification',
                'title'   => 'Project assigned to you',
                'message' => $isCreate
                    ? "{$actorName} added you to project {$project->name}."
                    : "{$actorName} assigned you to project {$project->name}.",
                'icon'    => 'project',
                'color'   => 'green',
                'link'    => route('projects.show', $project->id),
            ]);
        }
    }

    public function notifyTaskCreated(Request $request, Task $task): void
    {
        foreach ($this->resolveTaskRecipients($request->user()->id, $task) as $recipientId) {
            $this->createNotification($recipientId, [
                'type'    => 'App\\Notifications\\TaskCreatedNotification',
                'title'   => 'New task created',
                'message' => "Task \"{$task->title}\" has been created.",
                'icon'    => 'task',
                'color'   => 'blue',
                'link'    => route('tasks.show', $task->id),
            ]);
        }
    }

    public function notifyTaskUpdated(Request $request, Task $task): void
    {
        foreach ($this->resolveTaskRecipients($request->user()->id, $task) as $recipientId) {
            $this->createNotification($recipientId, [
                'type'    => 'App\\Notifications\\TaskUpdatedNotification',
                'title'   => 'Task updated',
                'message' => "Task \"{$task->title}\" has been updated.",
                'icon'    => 'task',
                'color'   => 'blue',
                'link'    => route('tasks.show', $task->id),
            ]);
        }
    }

    public function notifyTaskDeleted(Request $request, string $taskTitle, ?string $assignedTo, ?string $reportingTo): void
    {
        $recipientIds = collect([(string) $request->user()->id, $assignedTo, $reportingTo])
            ->filter()->unique()->values();

        foreach ($recipientIds as $recipientId) {
            $this->createNotification($recipientId, [
                'type'    => 'App\\Notifications\\TaskDeletedNotification',
                'title'   => 'Task deleted',
                'message' => "Task \"{$taskTitle}\" has been deleted.",
                'icon'    => 'task',
                'color'   => 'red',
                'link'    => route('tasks.index'),
            ]);
        }
    }

    public function notifyTaskAssigned(Task $task, string $actorName, bool $isCreate, ?string $previousAssignedTo): void
    {
        $newAssignedTo = $task->assigned_to ? (string) $task->assigned_to : null;

        if (! $newAssignedTo || (! $isCreate && $previousAssignedTo === $newAssignedTo)) {
            return;
        }

        $this->createNotification($newAssignedTo, [
            'type'    => 'App\\Notifications\\TaskAssignedNotification',
            'title'   => 'Task assigned to you',
            'message' => $isCreate
                ? "{$actorName} assigned you a new task: \"{$task->title}\"."
                : "{$actorName} reassigned task \"{$task->title}\" to you.",
            'icon'    => 'task',
            'color'   => 'green',
            'link'    => route('tasks.show', $task->id),
        ]);
    }

    public function notifyUserCreated(User $createdUser): void
    {
        $recipientIds = $this->userRepository->getAdminIds()
            ->push((string) $createdUser->id)
            ->filter()->unique()->values();

        foreach ($recipientIds as $recipientId) {
            $isCreatedUser = $recipientId === (string) $createdUser->id;

            $this->createNotification($recipientId, [
                'type'    => 'App\\Notifications\\UserCreatedNotification',
                'title'   => 'New user created',
                'message' => $isCreatedUser
                    ? 'Your account has been created successfully.'
                    : "{$createdUser->name} ({$createdUser->role->value}) has been added to the system.",
                'icon'    => 'user',
                'color'   => 'green',
                'link'    => $isCreatedUser ? route('dashboard') : route('users.index'),
            ]);
        }
    }

    public function notifyUserUpdated(Request $request, User $updatedUser): void
    {
        $recipientIds = $this->userRepository->getAdminIds()
            ->push((string) $updatedUser->id)
            ->push((string) $request->user()->id)
            ->filter()->unique()->values();

        foreach ($recipientIds as $recipientId) {
            $this->createNotification($recipientId, [
                'type'    => 'App\\Notifications\\UserUpdatedNotification',
                'title'   => 'User updated',
                'message' => "{$updatedUser->name} ({$updatedUser->role->value}) has been updated.",
                'icon'    => 'user',
                'color'   => 'blue',
                'link'    => route('users.index'),
            ]);
        }
    }

    public function notifyUserDeleted(Request $request, string $deletedUserId, string $deletedUserName): void
    {
        $recipientIds = $this->userRepository->getAdminIds()
            ->filter(fn($id) => $id !== $deletedUserId)
            ->push((string) $request->user()->id)
            ->filter()->unique()->values();

        foreach ($recipientIds as $recipientId) {
            $this->createNotification($recipientId, [
                'type'    => 'App\\Notifications\\UserDeletedNotification',
                'title'   => 'User deleted',
                'message' => "{$deletedUserName} has been deleted.",
                'icon'    => 'user',
                'color'   => 'red',
                'link'    => route('users.index'),
            ]);
        }
    }

    private function resolveProjectRecipients(string $actorId, Project $project): Collection
    {
        return collect([(string) $actorId])
            ->merge($project->members->pluck('id')->map(fn($id) => (string) $id))
            ->when(
                $project->client?->user?->id,
                fn($c, $clientUserId) => $c->push((string) $clientUserId)
            )
            ->filter()->unique()->values();
    }

    private function resolveTaskRecipients(string $actorId, Task $task): Collection
    {
        return collect([(string) $actorId, (string) $task->assigned_to, (string) $task->reporting_to])
            ->filter()->unique()->values();
    }

    private function findUserNotification(string $notificationId, string $userId): Notification
    {
        return $this->newQuery()
            ->where('id', $notificationId)
            ->where('notifiable_id', $userId)
            ->where('notifiable_type', self::NOTIFIABLE_TYPE)
            ->firstOr(fn(): never => throw new ModelNotFoundException('Notification not found.'));
    }

    private function getNotificationType(string $fullClassName): string
    {
        return class_basename($fullClassName);
    }
}