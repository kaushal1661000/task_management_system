import { Head, router } from '@inertiajs/react';
import {
    BarChart3,
    CheckCircle,
    AlertCircle,
    FolderKanban,
} from 'lucide-react';
import { useState } from 'react';
import ReactSelectField from '@/components/react-select-field';
import { Button } from '@/components/ui/button';
import DatePicker from '@/components/ui/DatePicker';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/AppLayout';
import { index as reportsIndex } from '@/routes/reports';
import type { PageProps } from '@/types';
import type { ReactSelectOption } from '@/components/react-select-field';

interface ReportData {
    overview: {
        totalTasks: number;
        completedTasks: number;
        overdueTasks: number;
        activeProjects: number;
        completionRate: number;
    };
    taskStats: {
        byStatus: Record<string, number>;
        byPriority: Record<string, number>;
    };
    projectStats: {
        topProjects: Array<{
            id: string;
            name: string;
            status: string;
            totalTasks: number;
            completedTasks: number;
            completionRate: number;
            teamSize: number;
        }>;
        byStatus: Record<string, number>;
    };
    userPerformance: Array<{
        id: string;
        name: string;
        email: string;
        totalTasks: number;
        completedTasks: number;
        overdueTasks: number;
        completionRate: number;
    }>;
    timelineData: Array<{
        date: string;
        created: number;
        completed: number;
    }>;
    projects: Array<{ id: string; name: string }>;
    users: Array<{ id: string; name: string; email: string }>;
    filters: {
        start_date: string;
        end_date: string;
        project_id?: string;
        user_id?: string;
    };
}

interface ReportsProps extends PageProps {
    overview: ReportData['overview'];
    taskStats: ReportData['taskStats'];
    projectStats: ReportData['projectStats'];
    userPerformance: ReportData['userPerformance'];
    timelineData: ReportData['timelineData'];
    projects: ReportData['projects'];
    users: ReportData['users'];
    filters: ReportData['filters'];
    error?: string;
}

const defaultOverview: ReportData['overview'] = {
    totalTasks: 0,
    completedTasks: 0,
    overdueTasks: 0,
    activeProjects: 0,
    completionRate: 0,
};

const defaultTaskStats: ReportData['taskStats'] = {
    byStatus: {
        pending: 0,
        in_progress: 0,
        completed: 0,
        cancelled: 0,
    },
    byPriority: {
        low: 0,
        medium: 0,
        high: 0,
        urgent: 0,
    },
};

const defaultProjectStats: ReportData['projectStats'] = {
    topProjects: [],
    byStatus: {},
};

const defaultFilters: ReportData['filters'] = {
    start_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end_date: new Date().toISOString().split('T')[0],
};

export default function Index({
    overview = defaultOverview,
    taskStats = defaultTaskStats,
    projectStats = defaultProjectStats,
    userPerformance = [],
    projects = [],
    users = [],
    filters = defaultFilters,
    error,
}: ReportsProps) {
    const [startDate, setStartDate] = useState(filters.start_date);
    const [endDate, setEndDate] = useState(filters.end_date);
    const [projectId, setProjectId] = useState(filters.project_id || '');
    const [userId, setUserId] = useState(filters.user_id || '');

    const projectOptions: ReactSelectOption<string>[] = [
        { value: '', label: 'All Projects' },
        ...projects.map((project) => ({
            value: String(project.id),
            label: project.name,
        })),
    ];

    const employeeOptions: ReactSelectOption<string>[] = [
        { value: '', label: 'All Employees' },
        ...users.map((user) => ({
            value: String(user.id),
            label: user.name,
        })),
    ];

    const handleFilter = () => {
        router.get(reportsIndex.url(), {
            start_date: startDate,
            end_date: endDate,
            project_id: projectId || undefined,
            user_id: userId || undefined,
        });
    };

    const handleReset = () => {
        setStartDate(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
        setEndDate(new Date().toISOString().split('T')[0]);
        setProjectId('');
        setUserId('');
        router.get(reportsIndex.url());
    };

    return (
        <AppLayout header="Reports & Analytics">
            <Head title="Reports" />

            {error && (
                <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {error}
                </div>
            )}

            {/* Filters */}
            <div className="mb-6 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Filters</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                    <div>
                        <Label htmlFor="start_date" >Start Date</Label>
                        <DatePicker
                            id="start_date"
                            value={startDate}
                            onChange={(value) => setStartDate(value)}
                        />

                    </div>

                    {/* End Date */}
                    <div>
                        <Label htmlFor="end_date">End Date</Label>
                        <DatePicker
                            id="end_date"
                            value={endDate}
                            onChange={(value) => setEndDate(value)}
                            minDate={startDate}
                        />

                    </div>
                    <div>
                        <Label htmlFor="project_id">Project</Label>
                        <ReactSelectField<string>
                            id="project_id"
                            value={projectId}
                            options={projectOptions}
                            onChange={(value) => setProjectId(value)}
                            
                        />
                    </div>
                    <div>
                        <Label htmlFor="user_id">Employee</Label>
                        <ReactSelectField<string>
                            id="user_id"
                            value={userId}
                            options={employeeOptions}
                            onChange={(value) => setUserId(value)}
                            
                        />
                    </div>
                    <div className="flex items-end gap-2">
                        <Button onClick={handleFilter} className="flex-1 bg-blue-600 hover:bg-blue-700">
                            Apply
                        </Button>
                        <Button onClick={handleReset} variant="outline">
                            Reset
                        </Button>
                    </div>
                </div>
            </div>

            {/* Overview Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Total Tasks</p>
                            <p className="text-3xl font-bold text-gray-900 mt-2">
                                {overview.totalTasks}
                            </p>
                        </div>
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                            <BarChart3 className="h-6 w-6 text-blue-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Completed</p>
                            <p className="text-3xl font-bold text-green-600 mt-2">
                                {overview.completedTasks}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                                {overview.completionRate}% completion rate
                            </p>
                        </div>
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                            <CheckCircle className="h-6 w-6 text-green-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Overdue</p>
                            <p className="text-3xl font-bold text-red-600 mt-2">
                                {overview.overdueTasks}
                            </p>
                        </div>
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                            <AlertCircle className="h-6 w-6 text-red-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Active Projects</p>
                            <p className="text-3xl font-bold text-purple-600 mt-2">
                                {overview.activeProjects}
                            </p>
                        </div>
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-100">
                            <FolderKanban className="h-6 w-6 text-purple-600" />
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                {/* Tasks by Status */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Tasks by Status</h3>
                    <div className="space-y-4">
                        {Object.entries(taskStats.byStatus).map(([status, count]) => {
                            const total = Object.values(taskStats.byStatus).reduce((a, b) => a + b, 0);
                            const percentage = total > 0 ? (count / total) * 100 : 0;
                            const colors: Record<string, string> = {
                                pending: 'bg-yellow-500',
                                in_progress: 'bg-blue-500',
                                completed: 'bg-green-500',
                                cancelled: 'bg-red-500',
                            };

                            return (
                                <div key={status}>
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm font-medium text-gray-700 capitalize">
                                            {status.replace('_', ' ')}
                                        </span>
                                        <span className="text-sm font-semibold text-gray-900">
                                            {count} ({percentage.toFixed(0)}%)
                                        </span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div
                                            className={`h-2 rounded-full ${colors[status]}`}
                                            style={{ width: `${percentage}%` }}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Tasks by Priority */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Tasks by Priority</h3>
                    <div className="space-y-4">
                        {Object.entries(taskStats.byPriority).map(([priority, count]) => {
                            const total = Object.values(taskStats.byPriority).reduce((a, b) => a + b, 0);
                            const percentage = total > 0 ? (count / total) * 100 : 0;
                            const colors: Record<string, string> = {
                                low: 'bg-gray-500',
                                medium: 'bg-blue-500',
                                high: 'bg-orange-500',
                                urgent: 'bg-red-500',
                            };

                            return (
                                <div key={priority}>
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm font-medium text-gray-700 capitalize">
                                            {priority}
                                        </span>
                                        <span className="text-sm font-semibold text-gray-900">
                                            {count} ({percentage.toFixed(0)}%)
                                        </span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div
                                            className={`h-2 rounded-full ${colors[priority]}`}
                                            style={{ width: `${percentage}%` }}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Top Projects */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Top Projects by Completion</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-gray-200">
                                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Project</th>
                                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Status</th>
                                <th className="text-center py-3 px-4 text-sm font-medium text-gray-700">Tasks</th>
                                <th className="text-center py-3 px-4 text-sm font-medium text-gray-700">Team</th>
                                <th className="text-center py-3 px-4 text-sm font-medium text-gray-700">Completion</th>
                            </tr>
                        </thead>
                        <tbody>
                            {projectStats.topProjects.map((project) => (
                                <tr key={project.id} className="border-b border-gray-100 hover:bg-gray-50">
                                    <td className="py-3 px-4 text-sm font-medium text-gray-900">{project.name}</td>
                                    <td className="py-3 px-4">
                                        <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700 capitalize">
                                            {project.status.replace('_', ' ')}
                                        </span>
                                    </td>
                                    <td className="py-3 px-4 text-center text-sm text-gray-600">
                                        {project.completedTasks} / {project.totalTasks}
                                    </td>
                                    <td className="py-3 px-4 text-center text-sm text-gray-600">
                                        {project.teamSize}
                                    </td>
                                    <td className="py-3 px-4 text-center">
                                        <div className="flex items-center justify-center gap-2">
                                            <div className="w-20 bg-gray-200 rounded-full h-2">
                                                <div
                                                    className="h-2 rounded-full bg-blue-500"
                                                    style={{ width: `${project.completionRate}%` }}
                                                />
                                            </div>
                                            <span className="text-sm font-semibold text-gray-900">
                                                {project.completionRate}%
                                            </span>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* User Performance */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Employee Performance</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-gray-200">
                                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Employee</th>
                                <th className="text-center py-3 px-4 text-sm font-medium text-gray-700">Total Tasks</th>
                                <th className="text-center py-3 px-4 text-sm font-medium text-gray-700">Completed</th>
                                <th className="text-center py-3 px-4 text-sm font-medium text-gray-700">Overdue</th>
                                <th className="text-center py-3 px-4 text-sm font-medium text-gray-700">Completion Rate</th>
                            </tr>
                        </thead>
                        <tbody>
                            {userPerformance.map((user) => (
                                <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
                                    <td className="py-3 px-4">
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">{user.name}</p>
                                            <p className="text-xs text-gray-500">{user.email}</p>
                                        </div>
                                    </td>
                                    <td className="py-3 px-4 text-center text-sm text-gray-600">
                                        {user.totalTasks}
                                    </td>
                                    <td className="py-3 px-4 text-center text-sm text-green-600 font-medium">
                                        {user.completedTasks}
                                    </td>
                                    <td className="py-3 px-4 text-center text-sm text-red-600 font-medium">
                                        {user.overdueTasks}
                                    </td>
                                    <td className="py-3 px-4 text-center">
                                        <div className="flex items-center justify-center gap-2">
                                            <div className="w-20 bg-gray-200 rounded-full h-2">
                                                <div
                                                    className="h-2 rounded-full bg-green-500"
                                                    style={{ width: `${user.completionRate}%` }}
                                                />
                                            </div>
                                            <span className="text-sm font-semibold text-gray-900">
                                                {user.completionRate}%
                                            </span>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </AppLayout>
    );
}