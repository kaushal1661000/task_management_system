<?php

namespace App\Http\Controllers;

use App\Enums\UserRole;
use App\Http\Requests\StoreTaskRequest;
use App\Http\Requests\UpdateTaskRequest;
use App\Models\Task;
use App\Repositories\NotificationRepository;
use App\Repositories\TaskRepository;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Inertia\Response;
use Throwable;

class TaskController extends BaseController
{
    public function __construct(
        private TaskRepository $taskRepository,
        private NotificationRepository $notificationRepository
    ) {}

    public function index(Request $request): Response
    {
        $this->authorize('viewAny', Task::class);

        $user   = $request->user();
        $search = trim((string) $request->query('search', ''));
        $status = trim((string) $request->query('status', ''));

        $tasks = $user->role === UserRole::EMPLOYEE
            ? $this->taskRepository->getByAssignee($user->id, $search, $status)
            : $this->taskRepository->getWithRelations($search, $status);

        $createFormData = $this->taskRepository->getTaskCreateFormData($user);
        $editFormData   = $user->role === UserRole::ADMIN
            ? $this->taskRepository->getTaskFormData()
            : [
                'projects'  => [],
                'employees' => [],
            ];

        return inertia('Tasks/Index', [
            'tasks' => $tasks,
            'filters' => [
                'search' => $search,
                'status' => $status,
            ],
            'createProjects' => $createFormData['projects'],
            'admins' => $createFormData['admins'],
            'projectMembersByProject' => $createFormData['projectMembersByProject'],
            'editProjects' => $editFormData['projects'],
            'employees' => $editFormData['employees'],
        ]);
    }

    public function create(Request $request): Response
    {
        $this->authorize('create', Task::class);

        return inertia('Tasks/Create', $this->taskRepository->getTaskCreateFormData($request->user()));
    }

    public function store(StoreTaskRequest $request): RedirectResponse
    {
        $this->authorize('create', Task::class);

        try {
            DB::beginTransaction();
            $task = $this->taskRepository->createTask($request);

            $this->notificationRepository->notifyTaskCreated($request, $task);
            $this->notificationRepository->notifyTaskAssigned($task, $request->user()->name, true, null);

            DB::commit();
        } catch (Throwable $e) {
            DB::rollBack();
            Log::error('Task creation failed.', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return $this->sendRedirectBackError('Failed to create task. Please try again.');
        }

        return $this->sendRedirectResponse(route('tasks.index'), 'Task created successfully.');
    }

    public function show(Task $task): Response
    {
        $this->authorize('view', $task);

        $task->load(['project.client.user', 'assignee', 'reporter']);

        return inertia('Tasks/Show', compact('task'));
    }

    public function edit(Task $task): Response
    {
        $this->authorize('update', $task);

        $task->load(['project', 'assignee', 'reporter']);

        $isAdmin = request()->user()?->role === UserRole::ADMIN;

        return inertia('Tasks/Edit', [
            'task' => $task,
            ...($isAdmin ? $this->taskRepository->getTaskFormData() : [
                'projects'  => [],
                'employees' => [],
            ]),
        ]);
    }

    public function update(UpdateTaskRequest $request, Task $task): RedirectResponse
    {
        $this->authorize('update', $task);

        $previousAssignedTo = $task->assigned_to ? (string) $task->assigned_to : null;

        try {
            DB::beginTransaction();
            $updatedTask = $this->taskRepository->updateTask($task, $request);

            $this->notificationRepository->notifyTaskUpdated($request, $updatedTask);
            $this->notificationRepository->notifyTaskAssigned($updatedTask, $request->user()->name, false, $previousAssignedTo);

            DB::commit();
        } catch (Throwable $e) {
            DB::rollBack();
            Log::error('Task update failed.', [
                'task_id' => $task->id,
                'error'   => $e->getMessage(),
                'trace'   => $e->getTraceAsString(),
            ]);

            return $this->sendRedirectBackError('Failed to update task. Please try again.');
        }

        return $this->sendRedirectResponse(route('tasks.index'), 'Task updated successfully.');
    }

    public function destroy(Request $request, Task $task): RedirectResponse
    {
        $this->authorize('delete', $task);

        $taskTitle   = $task->title;
        $assignedTo  = $task->assigned_to ? (string) $task->assigned_to : null;
        $reportingTo = $task->reporting_to ? (string) $task->reporting_to : null;

        try {
            DB::beginTransaction();
            $this->taskRepository->destroy($task->id);

            $this->notificationRepository->notifyTaskDeleted($request, $taskTitle, $assignedTo, $reportingTo);

            DB::commit();
        } catch (Throwable $e) {
            DB::rollBack();
            Log::error('Task deletion failed.', [
                'task_id' => $task->id,
                'error'   => $e->getMessage(),
                'trace'   => $e->getTraceAsString(),
            ]);

            return $this->sendRedirectError(route('tasks.index'), 'Failed to delete task. Please try again.');
        }

        return $this->sendRedirectDelete(route('tasks.index'), 'Task deleted successfully.');
    }
}