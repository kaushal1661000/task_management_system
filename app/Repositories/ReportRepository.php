<?php

namespace App\Repositories;

use App\Enums\UserRole;
use App\Http\Requests\ReportRequest;
use BackedEnum;
use DateInterval;
use DatePeriod;
use DateTime;
use Illuminate\Support\Facades\DB;

class ReportRepository extends BaseRepository
{
    public function __construct(
        private TaskRepository $taskRepository,
        private ProjectRepository $projectRepository,
        private UserRepository $userRepository,
    ) {
        parent::__construct($taskRepository->newQuery()->getModel());
    }

    public function getReportData(ReportRequest $request): array
    {
        $start     = $request->startDate();
        $end       = $request->endDate();
        $projectId = $request->projectId();
        $userId    = $request->userId();

        return [
            'overview'        => $this->getOverviewStats($start, $end),
            'taskStats'       => $this->getTaskStats($start, $end, $projectId, $userId),
            'projectStats'    => $this->getProjectStats($start, $end),
            'userPerformance' => $this->getUserPerformance($start, $end),
            'timelineData'    => $this->getTimelineData($start, $end),
            'projects'        => $this->getAllProjects(),
            'users'           => $this->getAllUsers(),
            'filters'         => $request->filters(),
        ];
    }

    public function emptyReportData(ReportRequest $request): array
    {
        return [
            'overview'        => [
                'totalTasks'     => 0,
                'completedTasks' => 0,
                'overdueTasks'   => 0,
                'activeProjects' => 0,
                'completionRate' => 0,
            ],
            'taskStats'       => [
                'byStatus'   => ['pending' => 0, 'in_progress' => 0, 'completed' => 0, 'cancelled' => 0],
                'byPriority' => ['low' => 0, 'medium' => 0, 'high' => 0, 'urgent' => 0],
            ],
            'projectStats'    => [
                'topProjects' => [],
                'byStatus'    => ['planning' => 0, 'active' => 0, 'on_hold' => 0, 'completed' => 0, 'cancelled' => 0],
            ],
            'userPerformance' => [],
            'timelineData'    => [],
            'projects'        => [],
            'users'           => [],
            'filters'         => $request->filters(),
        ];
    }

    private function getOverviewStats(string $startDate, string $endDate): array
    {
        $totalTasks = $this->taskRepository->getByDateRange($startDate, $endDate)->count();

        $completedTasks = $this->taskRepository->newQuery()
            ->where('status', 'completed')
            ->whereBetween('updated_at', [$startDate, $endDate])
            ->count();

        $overdueTasks = $this->taskRepository->getOverdueCount();

        $activeProjects = $this->projectRepository->countByStatus(\App\Enums\ProjectStatus::ACTIVE);

        return [
            'totalTasks'     => $totalTasks,
            'completedTasks' => $completedTasks,
            'overdueTasks'   => $overdueTasks,
            'activeProjects' => $activeProjects,
            'completionRate' => $totalTasks > 0 ? round(($completedTasks / $totalTasks) * 100, 2) : 0,
        ];
    }

    private function getTaskStats(string $startDate, string $endDate, ?string $projectId, ?string $userId): array
    {
        $byStatus = $this->taskRepository->getByDateRange($startDate, $endDate)
            ->when($projectId, fn($q) => $q->where('project_id', $projectId))
            ->when($userId, fn($q) => $q->where('assigned_to', $userId))
            ->select('status', DB::raw('count(*) as count'))
            ->groupBy('status')
            ->get()
            ->mapWithKeys(fn($item) => [$this->normalizeEnumValue($item->status) => $item->count])
            ->toArray();

        $byPriority = $this->taskRepository->getByDateRange($startDate, $endDate)
            ->select('priority', DB::raw('count(*) as count'))
            ->groupBy('priority')
            ->get()
            ->mapWithKeys(fn($item) => [$this->normalizeEnumValue($item->priority) => $item->count])
            ->toArray();

        return [
            'byStatus'   => [
                'pending'     => $byStatus['pending'] ?? 0,
                'in_progress' => $byStatus['in_progress'] ?? 0,
                'completed'   => $byStatus['completed'] ?? 0,
                'cancelled'   => $byStatus['cancelled'] ?? 0,
            ],
            'byPriority' => [
                'low'    => $byPriority['low'] ?? 0,
                'medium' => $byPriority['medium'] ?? 0,
                'high'   => $byPriority['high'] ?? 0,
                'urgent' => $byPriority['urgent'] ?? 0,
            ],
        ];
    }

    private function getProjectStats(string $startDate, string $endDate): array
    {
        $topProjects = $this->projectRepository->newQuery()
            ->with('tasks')
            ->whereBetween('created_at', [$startDate, $endDate])
            ->get()
            ->map(function ($project) {
                $total     = $project->tasks->count();
                $completed = $project->tasks->where('status', 'completed')->count();

                return [
                    'id'             => $project->id,
                    'name'           => $project->name,
                    'status'         => $this->normalizeEnumValue($project->status),
                    'totalTasks'     => $total,
                    'completedTasks' => $completed,
                    'completionRate' => $total > 0 ? round(($completed / $total) * 100, 2) : 0,
                    'teamSize'       => $project->members->count(),
                ];
            })
            ->sortByDesc('completionRate')
            ->values()
            ->take(10)
            ->toArray();

        $byStatus = $this->projectRepository->newQuery()
            ->select('status', DB::raw('count(*) as count'))
            ->groupBy('status')
            ->get()
            ->mapWithKeys(fn($item) => [$this->normalizeEnumValue($item->status) => $item->count])
            ->toArray();

        return [
            'topProjects' => $topProjects,
            'byStatus'    => [
                'planning'  => $byStatus['planning'] ?? 0,
                'active'    => $byStatus['active'] ?? 0,
                'on_hold'   => $byStatus['on_hold'] ?? 0,
                'completed' => $byStatus['completed'] ?? 0,
                'cancelled' => $byStatus['cancelled'] ?? 0,
            ],
        ];
    }

    private function getUserPerformance(string $startDate, string $endDate): array
    {
        return $this->userRepository->getUsersByRole(
            role: UserRole::EMPLOYEE,
            select: ['id', 'name', 'email'],
            orderBy: 'name',
            direction: 'asc'
        )
        ->load(['assignedTasks' => fn($q) => $q->whereBetween('created_at', [$startDate, $endDate])])
        ->map(function ($user) {
            $total     = $user->assignedTasks->count();
            $completed = $user->assignedTasks->where('status', 'completed')->count();
            $overdue   = $user->assignedTasks
                ->where('status', '!=', 'completed')
                ->filter(fn($task) => $task->deadline && $task->deadline < now())
                ->count();

            return [
                'id'             => $user->id,
                'name'           => $user->name,
                'email'          => $user->email,
                'totalTasks'     => $total,
                'completedTasks' => $completed,
                'overdueTasks'   => $overdue,
                'completionRate' => $total > 0 ? round(($completed / $total) * 100, 2) : 0,
            ];
        })
        ->sortByDesc('completionRate')
        ->values()
        ->toArray();
    }

    private function getTimelineData(string $startDate, string $endDate): array
    {
        $created = $this->taskRepository->newQuery()
            ->select(DB::raw('DATE(created_at) as date'), DB::raw('count(*) as count'))
            ->whereBetween('created_at', [$startDate, $endDate])
            ->groupBy('date')->orderBy('date')->get()
            ->mapWithKeys(fn($item) => [$item->date => $item->count])->toArray();

        $completed = $this->taskRepository->newQuery()
            ->select(DB::raw('DATE(updated_at) as date'), DB::raw('count(*) as count'))
            ->where('status', 'completed')
            ->whereBetween('updated_at', [$startDate, $endDate])
            ->groupBy('date')->orderBy('date')->get()
            ->mapWithKeys(fn($item) => [$item->date => $item->count])->toArray();

        $timeline = [];
        $period   = new DatePeriod(
            new DateTime($startDate),
            new DateInterval('P1D'),
            (new DateTime($endDate))->modify('+1 day')
        );

        foreach ($period as $date) {
            $dateStr    = $date->format('Y-m-d');
            $timeline[] = [
                'date'      => $dateStr,
                'created'   => $created[$dateStr] ?? 0,
                'completed' => $completed[$dateStr] ?? 0,
            ];
        }

        return $timeline;
    }

    private function getAllProjects()
    {
        return $this->projectRepository->getAll(
            relations: [],
            withTrashed: false,
            selects: ['id', 'name']
        );
    }

    private function getAllUsers()
    {
        return $this->userRepository->getUsersByRole(
            role: UserRole::EMPLOYEE,
            select: ['id', 'name', 'email'],
            orderBy: 'name',
            direction: 'asc'
        );
    }

    private function normalizeEnumValue(mixed $value): string
    {
        return $value instanceof BackedEnum ? (string) $value->value : (string) $value;
    }
}