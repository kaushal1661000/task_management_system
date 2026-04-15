import { Head, Link } from '@inertiajs/react';
import {
    ArrowLeft,
    Edit,
    Building2,
    Calendar,
    DollarSign,
    Users,
    CheckSquare,
} from 'lucide-react';
import StatusBadge from '@/components/StatusBadge';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/AppLayout';
import { edit as projectsEdit, index as projectsIndex } from '@/routes/projects';
import { show as tasksShow } from '@/routes/tasks';
import type { PageProps, Project, Task } from '@/types';

interface ShowProps extends PageProps {
    project: Project;
}

export default function Show({ project, auth }: ShowProps) {
    const normalizedProject = project as Project & {
        start_date?: string;
        end_date?: string;
    };
    const isAdmin = auth.user.role === 'admin';

    const canViewTask = (task: Task) => {
        if (isAdmin) {
            return true;
        }

        const normalizedTask = task as typeof task & {
            assigned_to?: string;
            assignedTo?: string;
        };

        const assignedTo = normalizedTask.assignedTo
            || normalizedTask.assigned_to
            || normalizedTask.assignee?.id;

        return String(assignedTo || '') === String(auth.user.id);
    };

    return (
        <AppLayout header="Project Details">
            <Head title={`Project: ${project.name}`} />

            {/* Header */}
            <div className="mb-6 flex items-center justify-between">
                <Link
                    href={projectsIndex()}
                    className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900"
                >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Projects
                </Link>
                {isAdmin && (
                    <Link href={projectsEdit(project.id)}>
                        <Button className="bg-blue-600 hover:bg-blue-700">
                            <Edit className="mr-2 h-4 w-4" />
                            Edit Project
                        </Button>
                    </Link>
                )}
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                {/* Project Overview */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Main Info Card */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                                <h1 className="text-2xl font-bold text-gray-900">
                                    {project.name}
                                </h1>
                                <div className="mt-2">
                                    <StatusBadge status={project.status} size="md" />
                                </div>
                            </div>
                        </div>

                        {project.description && (
                            <div className="mt-4">
                                <h3 className="text-sm font-medium text-gray-500 mb-2">
                                    Description
                                </h3>
                                <p className="text-gray-700 whitespace-pre-line">
                                    {project.description}
                                </p>
                            </div>
                        )}

                        {/* Project Stats */}
                        <div className="mt-6 grid grid-cols-2 gap-4">
                            <div className="p-4 bg-blue-50 rounded-lg">
                                <div className="flex items-center">
                                    <CheckSquare className="h-5 w-5 text-blue-600 mr-2" />
                                    <p className="text-2xl font-bold text-blue-600">
                                        {project.tasks?.length || 0}
                                    </p>
                                </div>
                                <p className="text-sm text-gray-600 mt-1">Total Tasks</p>
                            </div>
                            <div className="p-4 bg-purple-50 rounded-lg">
                                <div className="flex items-center">
                                    <Users className="h-5 w-5 text-purple-600 mr-2" />
                                    <p className="text-2xl font-bold text-purple-600">
                                        {project.members?.length || 0}
                                    </p>
                                </div>
                                <p className="text-sm text-gray-600 mt-1">Team Members</p>
                            </div>
                        </div>
                    </div>

                    {/* Tasks List */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                            Tasks ({project.tasks?.length || 0})
                        </h3>
                        {!project.tasks || project.tasks.length === 0 ? (
                            <div className="text-center py-8">
                                <CheckSquare className="mx-auto h-12 w-12 text-gray-400" />
                                <p className="mt-2 text-sm text-gray-500">No tasks yet</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {project.tasks.map((task) => (
                                    <div
                                        key={task.id}
                                        className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors"
                                    >
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3">
                                                <h4 className="text-sm font-medium text-gray-900">
                                                    {task.title}
                                                </h4>
                                                <StatusBadge status={task.status} size="sm" />
                                            </div>
                                            {task.assignee && (
                                                <p className="mt-1 text-xs text-gray-500">
                                                    Assigned to: {task.assignee.name}
                                                </p>
                                            )}
                                            {task.deadline && (
                                                <p className="mt-1 text-xs text-gray-500">
                                                    Due: {new Date(task.deadline).toLocaleDateString()}
                                                </p>
                                            )}
                                        </div>
                                        {canViewTask(task) && (
                                            <Link href={tasksShow(task.id)}>
                                                <Button variant="outline" size="sm">
                                                    View
                                                </Button>
                                            </Link>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Project Details */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <h3 className="text-sm font-medium text-gray-900 mb-4">
                            Project Details
                        </h3>
                        <div className="space-y-4">
                            {/* Client */}
                            <div>
                                <div className="flex items-center text-sm text-gray-500 mb-1">
                                    <Building2 className="h-4 w-4 mr-2" />
                                    Client
                                </div>
                                <p className="text-sm font-medium text-gray-900 ml-6">
                                    {project.client?.companyName || project.client?.user?.name || 'N/A'}
                                </p>
                            </div>

                            {/* Start Date */}
                            {(normalizedProject.startDate || normalizedProject.start_date) && (
                                <div>
                                    <div className="flex items-center text-sm text-gray-500 mb-1">
                                        <Calendar className="h-4 w-4 mr-2" />
                                        Start Date
                                    </div>
                                    <p className="text-sm font-medium text-gray-900 ml-6">
                                        {new Date(normalizedProject.startDate || normalizedProject.start_date || '').toLocaleDateString()}
                                    </p>
                                </div>
                            )}

                            {/* End Date */}
                            {(normalizedProject.endDate || normalizedProject.end_date) && (
                                <div>
                                    <div className="flex items-center text-sm text-gray-500 mb-1">
                                        <Calendar className="h-4 w-4 mr-2" />
                                        End Date
                                    </div>
                                    <p className="text-sm font-medium text-gray-900 ml-6">
                                        {new Date(normalizedProject.endDate || normalizedProject.end_date || '').toLocaleDateString()}
                                    </p>
                                </div>
                            )}

                            {/* Budget */}
                            {project.budget && (
                                <div>
                                    <div className="flex items-center text-sm text-gray-500 mb-1">
                                        <DollarSign className="h-4 w-4 mr-2" />
                                        Budget
                                    </div>
                                    <p className="text-sm font-medium text-gray-900 ml-6">
                                        ${parseFloat(String(project.budget)).toLocaleString()}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Team Members */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <h3 className="text-sm font-medium text-gray-900 mb-4">
                            Team Members ({project.members?.length || 0})
                        </h3>
                        {!project.members || project.members.length === 0 ? (
                            <p className="text-sm text-gray-500">No team members assigned</p>
                        ) : (
                            <div className="space-y-3">
                                {project.members.map((member) => (
                                    <div
                                        key={member.id}
                                        className="flex items-center p-3 bg-gray-50 rounded-lg"
                                    >
                                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-white text-sm font-medium">
                                            {(member.user?.name || member.name || '?').charAt(0).toUpperCase()}
                                        </div>
                                        <div className="ml-3">
                                            <p className="text-sm font-medium text-gray-900">
                                                {member.user?.name || member.name || 'Unknown'}
                                            </p>
                                            <p className="text-xs text-gray-500">{member.user?.email || member.email || 'N/A'}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}