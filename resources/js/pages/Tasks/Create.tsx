import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import { useEffect, useMemo  } from 'react';
import type {FormEventHandler} from 'react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import DatePicker from '@/components/ui/DatePicker';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/AppLayout';
import { index as tasksIndex, store as tasksStore } from '@/routes/tasks';
import Description from '@/components/ui/Description';
import type { PageProps, Project, User, Task } from '@/types';

interface CreateProps extends PageProps {
    projects: Project[];
    admins: Array<Pick<User, 'id' | 'name'>>;
    projectMembersByProject: Record<string, Array<Pick<User, 'id' | 'name'>>>;
}

interface FormData {
    title: string;
    description: string;
    project_id: string;
    assigned_to: string;
    reporting_to: string;
    status: Task['status'];
    priority: Task['priority'];
    deadline: string;
}

export default function Create({ projects, admins, projectMembersByProject, auth }: CreateProps) {
    const defaultReportingTo = admins.some((admin) => String(admin.id) === String(auth.user.id))
        ? String(auth.user.id)
        : '';

    const { data, setData, post, processing, errors } = useForm<FormData>({
        title: '',
        description: '',
        project_id: '',
        assigned_to: '',
        reporting_to: defaultReportingTo,
        status: 'pending',
        priority: 'medium',
        deadline: '',
    });

    const availableAssignees = useMemo(
        () => projectMembersByProject?.[data.project_id] ?? [],
        [projectMembersByProject, data.project_id],
    );

    useEffect(() => {
        if (!data.assigned_to) {
            return;
        }

        const isSelectedAssigneeValid = availableAssignees.some(
            (member) => String(member.id) === String(data.assigned_to),
        );

        if (!isSelectedAssigneeValid) {
            setData('assigned_to', '');
        }
    }, [availableAssignees, data.assigned_to, setData]);

    const handleSubmit: FormEventHandler = (event) => {
        event.preventDefault();
        post(tasksStore.url());
    };

    return (
        <AppLayout>
            <Head title="Create Task" />

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
                        <h2 className="text-lg font-semibold text-gray-900">Create Task</h2>
                        <p className="mt-1 text-sm text-gray-500">
                            Add a new task and assign it to team member
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="p-6 space-y-6">
                        {/* Task Information */}
                        <div>
                            <h3 className="text-md font-medium text-gray-900 mb-4">
                                Task Information
                            </h3>
                            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                {/* Title */}
                               {/* Task Title */}
                                <div className="sm:col-span-2">
                                    <Label htmlFor="title" required>
                                        Task Title
                                    </Label>
                                    <Input
                                        id="title"
                                        type="text"
                                        autoComplete="off"
                                        value={data.title}
                                        onChange={(e) =>
                                            setData('title' as keyof FormData, e.target.value.trimStart())
                                        }
                                        placeholder="Fix login bug"
                                        className="mt-1"
                                        maxLength={200}
                                    />
                                    <InputError
                                        message={errors.title}
                                        className="mt-2"
                                    />
                                </div>
                                
                                {/* Description */}
                                <div className="sm:col-span-2">
                                    <Label htmlFor="description">
                                        Description
                                    </Label>
                                    <Description
                                        id="description"
                                        value={data.description}
                                        onChange={(e) =>
                                            setData('description' as keyof FormData, e.target.value)
                                        }
                                        rows={4}
                                        maxLength={2000}
                                        placeholder="Describe the task requirements, expected outcome, and any important notes..."
                                    />
                                    <InputError
                                        message={errors.description}
                                        className="mt-2"
                                    />
                                </div>
                                
                                {/* Project */}
                                <div className="sm:col-span-2">
                                    <Label htmlFor="project_id" required>
                                        Project Name
                                    </Label>
                                    <select
                                        id="project_id"
                                        value={data.project_id}
                                        onChange={(e) =>
                                            setData('project_id' as keyof FormData, e.target.value)
                                        }
                                        className="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                    >
                                        <option value="">Select a project</option>
                                
                                        {projects?.map((project) => (
                                            <option
                                                key={project.id}
                                                value={project.id}
                                            >
                                                {project.name}
                                            </option>
                                        ))}
                                    </select>
                                
                                    <InputError
                                        message={errors.project_id}
                                        className="mt-2"
                                    />
                                </div>
                                {/* Assigned To */}
                                <div>
                                    <Label htmlFor="assigned_to" required>Assign To</Label>
                                    <select
                                        id="assigned_to"
                                        value={data.assigned_to}
                                        onChange={(e) => setData('assigned_to' as keyof FormData, e.target.value)}
                                        className="mt-1 block w-full rounded-lg border-gray-300 shadow-lg focus:border-blue-500 focus:ring-blue-500"
                                    >
                                        <option value="">Select an assignee</option>
                                        {availableAssignees.map((member) => (
                                            <option key={member.id} value={member.id}>
                                                {member.name}
                                            </option>
                                        ))}
                                    </select>
                                    {data.project_id === '' && (
                                        <p className="mt-2 text-xs text-gray-500">Select a project first.</p>
                                    )}
                                    <InputError message={errors.assigned_to} className="mt-2" />
                                </div>

                                {/* Reporting To */}
                                <div>
                                    <Label htmlFor="reporting_to" required>Reporting To</Label>
                                    <select
                                        id="reporting_to"
                                        value={data.reporting_to}
                                        onChange={(e) => setData('reporting_to' as keyof FormData, e.target.value)}
                                        className="mt-1 block w-full rounded-lg border-gray-300 shadow-lg focus:border-blue-500 focus:ring-blue-500"
                                    >
                                        <option value="">Select an admin</option>
                                        {admins.map((admin) => (
                                            <option key={admin.id} value={admin.id}>
                                                {admin.name}
                                            </option>
                                        ))}
                                    </select>
                                    <InputError message={errors.reporting_to} className="mt-2" />
                                </div>

                                {/* Status */}
                                <div>
                                    <Label htmlFor="status" required>Status</Label>
                                    <select
                                        id="status"
                                        value={data.status}
                                        onChange={(e) => setData('status' as keyof FormData, e.target.value as Task['status'])}
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
                                        onChange={(e) => setData('priority' as keyof FormData, (e.target.value || 'medium') as Task['priority'])}
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
                                        onChange={(value) => setData('deadline' as keyof FormData, value)}
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
                                {processing ? 'Creating...' : 'Create Task'}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}
