import { Head, Link } from '@inertiajs/react';
import {
    ArrowLeft,
    Edit,
    Calendar,
    User,
    FolderKanban,
    Building2,
    AlertCircle,
    Flag,
} from 'lucide-react';
import StatusBadge from '@/components/StatusBadge';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/AppLayout';
import { index as projectsIndex, show as projectsShow } from '@/routes/projects';
import { edit as tasksEdit, index as tasksIndex } from '@/routes/tasks';
import type { PageProps, Task } from '@/types';

interface ShowProps extends PageProps {
    task: Task;
}

export default function Show({ task, auth }: ShowProps) {
    const taskAssigneeId = (task as Task & { assigned_to?: string }).assignedTo
        || (task as Task & { assigned_to?: string }).assigned_to;
    const createdAt = (task as Task & { created_at?: string }).createdAt
        || (task as Task & { created_at?: string }).created_at;
    const createdDate = createdAt ? new Date(createdAt) : null;
    const canEdit = auth.user.role === 'admin' || taskAssigneeId === String(auth.user.id);
    const isOverdue =
        task.deadline &&
        task.status !== 'completed' &&
        new Date(task.deadline) < new Date();

    const projectClient = task.project?.client as
        | {
              companyName?: string;
              company_name?: string;
              user?: { name?: string };
          }
        | undefined;

    const getPriorityColor = (priority: string) => {
        const colors = {
            low: 'text-gray-600',
            medium: 'text-blue-600',
            high: 'text-orange-600',
            urgent: 'text-red-600',
        };

        return colors[priority as keyof typeof colors] || 'text-gray-600';
    };

    return (
        <AppLayout header='Task Details'>
            <Head title={`Task: ${task.title}`} />

            {/* Header */}
            <div className="mb-6 flex items-center justify-between">
                <Link
                    href={tasksIndex()}
                    className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900"
                >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Tasks
                </Link>
                {canEdit && (
                    <Link href={tasksEdit(task.id)}>
                        <Button className="bg-blue-600 hover:bg-blue-700">
                            <Edit className="mr-2 h-4 w-4" />
                            Edit Task
                        </Button>
                    </Link>
                )}
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                {/* Main Content */}
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        {/* Task Header */}
                        <div className="mb-6">
                            <div className="flex items-start gap-3 mb-3">
                                <h1 className="text-2xl font-bold text-gray-900 flex-1">
                                    {task.title}
                                </h1>
                                {isOverdue && (
                                    <div className="flex items-center gap-1 px-3 py-1 bg-red-50 text-red-600 text-sm font-medium rounded-full">
                                        <AlertCircle className="h-4 w-4" />
                                        Overdue
                                    </div>
                                )}
                            </div>
                            <div className="flex items-center gap-3">
                                <StatusBadge status={task.status} size="md" />
                                {task.priority && (
                                    <div
                                        className={`flex items-center gap-1 ${getPriorityColor(task.priority)}`}
                                    >
                                        <Flag className="h-4 w-4" />
                                        <span className="text-sm font-medium capitalize">
                                            {task.priority} Priority
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Description */}
                        {task.description && (
                            <div className="mb-6">
                                <h3 className="text-sm font-medium text-gray-900 mb-2">
                                    Description
                                </h3>
                                <div className="p-4 bg-gray-50 rounded-lg">
                                    <p className="text-gray-700 whitespace-pre-line">
                                        {task.description}
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Project Info */}
                        <div className="border-t border-gray-200 pt-6">
                            <h3 className="text-sm font-medium text-gray-900 mb-4">
                                Project Information
                            </h3>
                            <div className="space-y-3">
                                <div className="flex items-center">
                                    <FolderKanban className="h-5 w-5 text-gray-400 mr-3" />
                                    <div>
                                        <p className="text-xs text-gray-500">Project</p>
                                        <Link
                                            href={task.project?.id ? projectsShow(task.project.id) : projectsIndex()}
                                            className="text-sm font-medium text-blue-600 hover:text-blue-700"
                                        >
                                            {task.project?.name || 'N/A'}
                                        </Link>
                                    </div>
                                </div>
                                {task.project?.client && (
                                    <div className="flex items-center">
                                        <Building2 className="h-5 w-5 text-gray-400 mr-3" />
                                        <div>
                                            <p className="text-xs text-gray-500">Client</p>
                                            <p className="text-sm font-medium text-gray-900">
                                                {projectClient?.companyName ||
                                                    projectClient?.company_name ||
                                                    projectClient?.user?.name ||
                                                    'N/A'}
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Task Details */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <h3 className="text-sm font-medium text-gray-900 mb-4">Task Details</h3>
                        <div className="space-y-4">
                            {/* Assigned To */}
                            <div>
                                <div className="flex items-center text-sm text-gray-500 mb-1">
                                    <User className="h-4 w-4 mr-2" />
                                    Assigned To
                                </div>
                                <div className="ml-6 flex items-center">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-white text-sm font-medium">
                                        {(task.assignee?.name?.charAt(0) ?? '?').toUpperCase()}
                                    </div>
                                    <div className="ml-2">
                                        <p className="text-sm font-medium text-gray-900">
                                            {task.assignee?.name || 'Unassigned'}
                                        </p>
                                        {task.assignee?.email && (
                                            <p className="text-xs text-gray-500">
                                                {task.assignee.email}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Reporter */}
                            {task.reporter && (
                                <div>
                                    <div className="flex items-center text-sm text-gray-500 mb-1">
                                        <User className="h-4 w-4 mr-2" />
                                        Reporter
                                    </div>
                                    <p className="text-sm font-medium text-gray-900 ml-6">
                                        {task.reporter.name}
                                    </p>
                                </div>
                            )}

                            {/* Deadline */}
                            {task.deadline && (
                                <div>
                                    <div className="flex items-center text-sm text-gray-500 mb-1">
                                        <Calendar className="h-4 w-4 mr-2" />
                                        Deadline
                                    </div>
                                    <p
                                        className={`text-sm font-medium ml-6 ${
                                            isOverdue ? 'text-red-600' : 'text-gray-900'
                                        }`}
                                    >
                                        {new Date(task.deadline).toLocaleDateString('en-US', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit',
                                        })}
                                    </p>
                                </div>
                            )}

                            {/* Created */}
                            <div>
                                <div className="flex items-center text-sm text-gray-500 mb-1">
                                    <Calendar className="h-4 w-4 mr-2" />
                                    Created
                                </div>
                                <p className="text-sm font-medium text-gray-900 ml-6">
                                    {createdDate
                                        ? createdDate.toLocaleDateString('en-US', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric',
                                        })
                                        : 'N/A'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Quick Actions */}
                    {canEdit && (
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <h3 className="text-sm font-medium text-gray-900 mb-4">
                                Quick Actions
                            </h3>
                            <div className="space-y-2">
                                <Link href={tasksEdit(task.id)} className="block">
                                    <Button variant="outline" className="w-full justify-start">
                                        <Edit className="mr-2 h-4 w-4" />
                                        Edit Task
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}