import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import type { FormEventHandler } from 'react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import DatePicker from '@/components/ui/DatePicker';
import Description from '@/components/ui/Description';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/AppLayout';
import { index as tasksIndex, update as tasksUpdate } from '@/routes/tasks';
import type { PageProps, Task, Project, User } from '@/types';

interface EditProps extends PageProps {
    task: Task;
    projects: Project[];
    employees: User[];
}

export default function Edit({ task, projects, employees, auth }: EditProps) {
    const normalizedTask = task as Task & {
        project_id?: string;
        assigned_to?: string;
        deadline?: string;
    };
    const isAdmin = auth.user.role === 'admin';

    const { data, setData, put, processing, errors } = useForm({
        title: normalizedTask.title || '',
        description: normalizedTask.description || '',
        project_id: normalizedTask.projectId || normalizedTask.project_id || '',
        assigned_to: normalizedTask.assignedTo || normalizedTask.assigned_to || '',
        status: normalizedTask.status || 'pending',
        priority: normalizedTask.priority || 'medium',
        deadline: normalizedTask.deadline ? normalizedTask.deadline.slice(0, 10) : '',
    });

    const handleSubmit: FormEventHandler = (event) => {
        event.preventDefault();
        put(tasksUpdate.url(task.id));
    };

    return (
        <AppLayout>
            <Head title="Edit Task" />

            {/* Back Button */}
            <div className="mb-6">
                <Link
                    href={tasksIndex()}
                    className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900"
                >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Tasks
                </Link>
            </div>

            {/* Form Card */}
            <div className="mx-auto max-w-3xl">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
                        <h2 className="text-lg font-semibold text-gray-900">Edit Task</h2>
                        <p className="mt-1 text-sm text-gray-500">Update task information</p>
                    </div>

                    <form onSubmit={handleSubmit} className="p-6 space-y-6">
                        {/* Task Information */}
                        <div>
                            <h3 className="text-md font-medium text-gray-900 mb-4">
                                Task Information
                            </h3>
                            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                {/* Title */}
                                <div className="sm:col-span-2">
                                    <Label htmlFor="title" required>Task Title</Label>
                                    <Input
                                        id="title"
                                        type="text"
                                        value={data.title}
                                        onChange={(e) => setData('title', e.target.value)}
                                        className="mt-1"
                                        
                                    />
                                    <InputError message={errors.title} className="mt-2" />
                                </div>

                                {/* Description */}
                                <div className="sm:col-span-2">
                                    <Label htmlFor="description" required>Description</Label>
                                    <Description
                                        id="description"
                                        value={data.description}
                                        onChange={(e) => setData('description', e.target.value)}
                                        rows={4}
                                    />
                                    <InputError message={errors.description} className="mt-2" />
                                </div>

                                {isAdmin && (
                                    <>
                                        {/* Project */}
                                        <div className="sm:col-span-2">
                                            <Label htmlFor="project_id" required>Project</Label>
                                            <select
                                                id="project_id"
                                                value={data.project_id}
                                                onChange={(e) => setData('project_id', e.target.value)}
                                                className="mt-1 block w-full rounded-lg border-gray-300 shadow-lg focus:border-blue-500 focus:ring-blue-500"
                                                
                                            >
                                                <option value="">Select a project</option>
                                                {projects?.map((project) => (
                                                    <option key={project.id} value={project.id}>
                                                        {project.name}
                                                    </option>
                                                ))}
                                            </select>
                                            <InputError message={errors.project_id} className="mt-2" />
                                        </div>

                                        {/* Assigned To */}
                                        <div>
                                            <Label htmlFor="assigned_to" required>Assign To</Label>
                                            <select
                                                id="assigned_to"
                                                value={data.assigned_to}
                                                onChange={(e) => setData('assigned_to', e.target.value)}
                                                className="mt-1 block w-full rounded-lg border-gray-300 shadow-lg focus:border-blue-500 focus:ring-blue-500"
                                                
                                            >
                                                <option value="">Select an employee</option>
                                                {employees?.map((employee) => (
                                                    <option key={employee.id} value={employee.id}>
                                                        {employee.name}
                                                    </option>
                                                ))}
                                            </select>
                                            <InputError message={errors.assigned_to} className="mt-2" />
                                        </div>
                                    </>
                                )}

                                {!isAdmin && (
                                    <div className="sm:col-span-2 rounded-lg border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-700">
                                        You can update progress and details of tasks assigned to you.
                                    </div>
                                )}

                                {/* Status */}
                                <div>
                                    <Label htmlFor="status" required>Status</Label>
                                    <select
                                        id="status"
                                        value={data.status}
                                        onChange={(e) => setData('status', e.target.value as Task['status'])}
                                        className="mt-1 block w-full rounded-lg border-gray-300 shadow-lg focus:border-blue-500 focus:ring-blue-500"
                                    
                                    >
                                        <option value="pending">Pending</option>
                                        <option value="in_progress">In Progress</option>
                                        <option value="completed">Completed</option>
                                        <option value="cancelled">Cancelled</option>
                                    </select>
                                    <InputError message={errors.status} className="mt-2" />
                                </div>

                                {/* Priority */}
                                <div>
                                    <Label htmlFor="priority">Priority</Label>
                                    <select
                                        id="priority"
                                        value={data.priority}
                                        onChange={(e) => setData('priority', (e.target.value || 'medium') as 'low' | 'medium' | 'high' | 'urgent')}
                                        className="mt-1 block w-full rounded-lg border-gray-300 shadow-lg focus:border-blue-500 focus:ring-blue-500"
                                    >
                                        <option value="low">Low</option>
                                        <option value="medium">Medium</option>
                                        <option value="high">High</option>
                                        <option value="urgent">Urgent</option>
                                    </select>
                                    <InputError message={errors.priority} className="mt-2" />
                                </div>

                                {/* Deadline */}
                                <div>
                                    <Label htmlFor="deadline">Deadline</Label>
                                    <DatePicker
                                        id="deadline"
                                        value={data.deadline}
                                        onChange={(value) => setData('deadline', value)}
                                    />
                                    <InputError message={errors.deadline} className="mt-2" />
                                </div>
                            </div>
                        </div>

                        {/* Form Actions */}
                        <div className="flex items-center justify-end gap-3 border-t border-gray-200 pt-6">
                            <Link href={tasksIndex()}>
                                <Button type="button" variant="outline">
                                    Cancel
                                </Button>
                            </Link>
                            <Button
                                type="submit"
                                disabled={processing}
                                className="bg-blue-600 hover:bg-blue-700"
                            >
                                {processing ? 'Updating...' : 'Update Task'}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}
