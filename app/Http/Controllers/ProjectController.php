<?php

namespace App\Http\Controllers;

use App\Enums\UserRole;
use App\Http\Requests\StoreProjectRequest;
use App\Http\Requests\UpdateProjectRequest;
use App\Models\Project;
use App\Repositories\NotificationRepository;
use App\Repositories\ProjectRepository;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Inertia\Response;
use Throwable;

class ProjectController extends BaseController
{
    public function __construct(
        private ProjectRepository $projectRepository,
        private NotificationRepository $notificationRepository
    ) {}

    public function index(Request $request): Response
    {
        $this->authorize('viewAny', Project::class);

        $search = trim((string) $request->query('search', ''));

        $role = $request->user()?->role;
        $isAdmin = $role === UserRole::ADMIN || $role === UserRole::ADMIN->value;
        $formData = $isAdmin ? $this->projectRepository->getProjectFormData() : [
            'clients' => [],
            'employees' => [],
        ];

        return inertia('Projects/Index', [
            'projects' => $this->projectRepository->getWithRelationsForUser($request->user(), $search),
            'filters' => [
                'search' => $search,
            ],
            'clients' => $formData['clients'],
            'employees' => $formData['employees'],
        ]);
    }

    public function create(): Response
    {
        $this->authorize('create', Project::class);

        return inertia('Projects/Create', $this->projectRepository->getProjectFormData());
    }

    public function store(StoreProjectRequest $request): RedirectResponse
    {
        $this->authorize('create', Project::class);

        try {
            DB::beginTransaction();
            $project = $this->projectRepository->createWithMembers($request);

            $this->notificationRepository->notifyProjectCreated($request, $project);
            $this->notificationRepository->notifyProjectAssignedMembers(
                $project,
                $request->memberIds(),
                $request->user()->name,
                true
            );

            DB::commit();
        } catch (Throwable $e) {
            DB::rollBack();
            Log::error('Project creation failed.', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return $this->sendRedirectBackError('Failed to create project. Please try again.');
        }

        return $this->sendRedirectResponse(route('projects.index'), 'Project created successfully.');
    }

    public function show(Project $project): Response
    {
        $this->authorize('view', $project);

        $project->load(['client.user', 'tasks.assignee', 'members']);

        return inertia('Projects/Show', compact('project'));
    }

    public function edit(Project $project): Response
    {
        $this->authorize('update', $project);

        $project->load(['client.user', 'members']);

        return inertia('Projects/Edit', [
            'project' => $project,
            ...$this->projectRepository->getProjectFormData(),
        ]);
    }

    public function update(UpdateProjectRequest $request, Project $project): RedirectResponse
    {
        $this->authorize('update', $project);

        $previousStatus    = $project->status?->value ?? (string) $project->status;
        $existingMemberIds = $project->members()->pluck('users.id')->map(fn($id) => (string) $id)->all();

        try {
            DB::beginTransaction();
            $updatedProject = $this->projectRepository->updateWithMembers($project, $request);

            $currentStatus = $updatedProject->status?->value ?? (string) $updatedProject->status;

            if ($previousStatus !== $currentStatus) {
                $this->notificationRepository->notifyProjectStatusChange($request, $updatedProject, $previousStatus, $currentStatus);
            } else {
                $this->notificationRepository->notifyProjectUpdated($request, $updatedProject);
            }

            $assignedMemberIds = array_values(array_diff(
                collect($request->memberIds())->filter()->map(fn($id) => (string) $id)->unique()->all(),
                $existingMemberIds
            ));

            $this->notificationRepository->notifyProjectAssignedMembers(
                $updatedProject,
                $assignedMemberIds,
                $request->user()->name,
                false
            );

            DB::commit();
        } catch (Throwable $e) {
            DB::rollBack();
            Log::error('Project update failed.', [
                'project_id' => $project->id,
                'error'      => $e->getMessage(),
                'trace'      => $e->getTraceAsString(),
            ]);

            return $this->sendRedirectBackError('Failed to update project. Please try again.');
        }

        return $this->sendRedirectResponse(route('projects.index'), 'Project updated successfully.');
    }

    public function destroy(Request $request, Project $project): RedirectResponse
    {
        $this->authorize('delete', $project);

        $project->loadMissing(['members:id', 'client.user:id']);

        $projectName  = $project->name;
        $recipientIds = collect([(string) $request->user()?->id])
            ->merge($project->members->pluck('id')->map(fn($id) => (string) $id))
            ->when(
                $project->client?->user?->id,
                fn($c, $clientUserId) => $c->push((string) $clientUserId)
            )
            ->filter()->unique()->values()->all();

        try {
            DB::beginTransaction();
            $this->projectRepository->destroy($project->id);

            $this->notificationRepository->notifyProjectDeleted($projectName, $recipientIds);

            DB::commit();
        } catch (Throwable $e) {
            DB::rollBack();
            Log::error('Project deletion failed.', [
                'project_id' => $project->id,
                'error'      => $e->getMessage(),
                'trace'      => $e->getTraceAsString(),
            ]);

            return $this->sendRedirectError(route('projects.index'), 'Failed to delete project. Please try again.');
        }

        return $this->sendRedirectDelete(route('projects.index'), 'Project deleted successfully.');
    }
}