import { Head, Link, router, useForm } from '@inertiajs/react';
import { Plus, Search, Edit, Trash2, Eye, Calendar, User, AlertCircle } from 'lucide-react';
import type { FormEvent } from 'react';
import { useEffect, useMemo, useState } from 'react';
import InputError from '@/components/input-error';
import ReactSelectField from '@/components/react-select-field';
import StatusBadge from '@/components/StatusBadge';
import { Button } from '@/components/ui/button';
import DatePicker from '@/components/ui/DatePicker';
import Description from '@/components/ui/Description';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Modal from '@/components/ui/Modal';
import AppLayout from '@/layouts/AppLayout';
import {
    index as tasksIndex,
    destroy as tasksDestroy,
    store as tasksStore,
    update as tasksUpdate,
} from '@/routes/tasks';
import type { Task, TasksIndexProps } from '@/types';
import type { ReactSelectOption } from '@/components/react-select-field';

interface TaskFormData {
    title: string;
    description: string;
    project_id: string;
    assigned_to: string;
    reporting_to: string;
    status: Task['status'];
    priority: Task['priority'];
    deadline: string;
}

const defaultTaskFormData: TaskFormData = {
    title: '',
    description: '',
    project_id: '',
    assigned_to: '',
    reporting_to: '',
    status: 'pending',
    priority: 'medium',
    deadline: '',
};

export default function TasksIndex({
    tasks,
    auth,
    filters,
    createProjects,
    admins,
    projectMembersByProject,
    editProjects,
    employees,
}: TasksIndexProps) {
    const [search, setSearch] = useState(filters?.search ?? '');
    const [statusFilter, setStatusFilter] = useState(filters?.status ?? '');
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [taskToDelete, setTaskToDelete] = useState<{ id: string; title: string } | null>(null);
    const [taskModalOpen, setTaskModalOpen] = useState(false);
    const [viewModalOpen, setViewModalOpen] = useState(false);
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);
    const [taskFormMode, setTaskFormMode] = useState<'create' | 'edit'>('create');
    const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
    const isAdmin = auth.user.role === 'admin';
    const canCreateTask = auth.user.role === 'admin' || auth.user.role === 'employee';

    const defaultReportingTo = admins.some((admin) => String(admin.id) === String(auth.user.id))
        ? String(auth.user.id)
        : '';

    const { data, setData, post, put, processing, errors, clearErrors } = useForm<TaskFormData>({
        ...defaultTaskFormData,
        reporting_to: defaultReportingTo,
    });

    const availableAssignees = useMemo(() => {
        if (taskFormMode === 'edit' && isAdmin) {
            return employees;
        }

        return projectMembersByProject?.[data.project_id] ?? [];
    }, [taskFormMode, isAdmin, employees, projectMembersByProject, data.project_id]);

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

    const paginationMeta = tasks.meta ?? {
        from: tasks.from,
        to: tasks.to,
        total: tasks.total,
    };

    const paginationLinks = Array.isArray(tasks.links)
        ? {
              prev: tasks.prevPageUrl ?? tasks.prev_page_url ?? null,
              next: tasks.nextPageUrl ?? tasks.next_page_url ?? null,
          }
        : tasks.links;

    const handleSearch = (event: React.FormEvent) => {
        event.preventDefault();
        const searchTerm = search.trim();

        router.get(
            tasksIndex(),
            { search: searchTerm, status: statusFilter },
            { preserveState: true }
        );
    };

    const handleDeleteClick = (taskId: string, taskTitle: string) => {
        setTaskToDelete({ id: taskId, title: taskTitle });
        setDeleteDialogOpen(true);
    };

    const closeTaskModal = () => {
        setTaskModalOpen(false);
        setTaskFormMode('create');
        setEditingTaskId(null);
        clearErrors();
        setData({
            ...defaultTaskFormData,
            reporting_to: defaultReportingTo,
        });
    };

    const openCreateTaskModal = () => {
        setTaskFormMode('create');
        setEditingTaskId(null);
        clearErrors();
        setData({
            ...defaultTaskFormData,
            assigned_to: auth.user.role === 'employee' ? String(auth.user.id) : '',
            reporting_to: defaultReportingTo,
        });
        setTaskModalOpen(true);
    };

    const openEditTaskModal = (task: Task) => {
        const normalizedTask = task as Task & {
            project_id?: string;
            assigned_to?: string;
            reporting_to?: string;
        };

        setTaskFormMode('edit');
        setEditingTaskId(task.id);
        clearErrors();
        setData({
            title: normalizedTask.title || '',
            description: normalizedTask.description || '',
            project_id: normalizedTask.projectId || normalizedTask.project_id || '',
            assigned_to: normalizedTask.assignedTo || normalizedTask.assigned_to || '',
            reporting_to: normalizedTask.reportingTo || normalizedTask.reporting_to || defaultReportingTo,
            status: normalizedTask.status || 'pending',
            priority: normalizedTask.priority || 'medium',
            deadline: normalizedTask.deadline ? normalizedTask.deadline.slice(0, 10) : '',
        });
        setTaskModalOpen(true);
    };

    const openViewTaskModal = (task: Task) => {
        setSelectedTask(task);
        setViewModalOpen(true);
    };

    const closeViewTaskModal = () => {
        setViewModalOpen(false);
        setSelectedTask(null);
    };

    const handleTaskSubmit = (event: FormEvent) => {
        event.preventDefault();

        if (taskFormMode === 'create') {
            post(tasksStore.url(), {
                preserveScroll: true,
                onSuccess: () => closeTaskModal(),
            });

            return;
        }

        if (!editingTaskId) {
            return;
        }

        put(tasksUpdate.url(editingTaskId), {
            preserveScroll: true,
            onSuccess: () => closeTaskModal(),
        });
    };

    const confirmDelete = () => {
        if (taskToDelete) {
            router.delete(tasksDestroy(taskToDelete.id));
            setDeleteDialogOpen(false);
            setTaskToDelete(null);
        }
    };

    const getPriorityBadge = (priority: string) => {
        const priorityConfig = {
            low: 'bg-gray-100 text-gray-800',
            medium: 'bg-blue-100 text-blue-800',
            high: 'bg-orange-100 text-orange-800',
            urgent: 'bg-red-100 text-red-800',
        };

        return (
            <span
                className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium capitalize ${
                    priorityConfig[priority as keyof typeof priorityConfig]
                }`}
            >
                {priority}
            </span>
        );
    };

    const isOverdue = (deadline: string, status: string) => {
        return status !== 'completed' && new Date(deadline) < new Date();
    };

    const projectOptions: ReactSelectOption<string>[] = [
        { value: '', label: 'Select a project' },
        ...(taskFormMode === 'create' ? createProjects : editProjects).map((project) => ({
            value: String(project.id),
            label: project.name,
        })),
    ];

    const assigneeOptions: ReactSelectOption<string>[] = [
        { value: '', label: 'Select an assignee' },
        ...availableAssignees.map((member) => ({
            value: String(member.id),
            label: member.name,
        })),
    ];

    const adminOptions: ReactSelectOption<string>[] = [
        { value: '', label: 'Select an admin' },
        ...admins.map((admin) => ({
            value: String(admin.id),
            label: admin.name,
        })),
    ];

    const statusOptions: ReactSelectOption<Task['status']>[] = [
        { value: 'pending', label: 'Pending' },
        { value: 'in_progress', label: 'In Progress' },
        { value: 'completed', label: 'Completed' },
        { value: 'cancelled', label: 'Cancelled' },
    ];

    const filterStatusOptions: ReactSelectOption<string>[] = [
        { value: '', label: 'All Status' },
        { value: 'pending', label: 'Pending' },
        { value: 'in_progress', label: 'In Progress' },
        { value: 'completed', label: 'Completed' },
        { value: 'cancelled', label: 'Cancelled' },
    ];

    const priorityOptions: ReactSelectOption<NonNullable<Task['priority']>>[] = [
        { value: 'low', label: 'Low' },
        { value: 'medium', label: 'Medium' },
        { value: 'high', label: 'High' },
        { value: 'urgent', label: 'Urgent' },
    ];

    return (
        <AppLayout >
            <Head title="Tasks" />

            {/* Header */}
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Tasks</h1>
                    <p className="mt-1 text-sm text-gray-500">
                        {isAdmin ? 'Manage all tasks' : 'View and update your assigned tasks'}
                    </p>
                </div>
                {canCreateTask && (
                    <Button onClick={openCreateTaskModal} className="cursor-pointer bg-blue-600 hover:bg-blue-700">
                        <Plus className="mr-2 h-4 w-4" />
                        New Task
                    </Button>
                )}
            </div>

            {/* Filters */}
            <div className="mb-6 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <form onSubmit={handleSearch} className="flex flex-col gap-4 sm:flex-row">
                    <div className="flex-1">
                        <Input
                            type="text"
                            placeholder="Search tasks by title or description..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full h-9"
                        />
                    </div>
                    <ReactSelectField<string>
                        id="tasks-status-filter"
                        value={statusFilter}
                        options={filterStatusOptions}
                        onChange={(value) => setStatusFilter(value)}
                        className="min-w-44"
                    />
                    <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                        <Search className="mr-2 h-4 w-4" />
                        Search
                    </Button>
                </form>
            </div>

            {/* Tasks Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                    Task
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                    Project
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                    Assignee
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                    Status
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                    Priority
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                    Deadline
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 bg-white">
                            {tasks.data.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                                        No tasks found
                                    </td>
                                </tr>
                            ) : (
                                tasks.data.map((task) => (
                                    <tr key={task.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center">
                                                {task.deadline && isOverdue(task.deadline, task.status) && (
                                                    <AlertCircle className="h-4 w-4 text-red-500 mr-2" />
                                                )}
                                                <div>
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {task.title}
                                                    </div>
                                                    {task.description && (
                                                        <div className="text-sm text-gray-500 line-clamp-1">
                                                            {task.description}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {task.project?.name || 'N/A'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <User className="h-4 w-4 text-gray-400 mr-2" />
                                                <span className="text-sm text-gray-900">
                                                    {task.assignee?.name || 'Unassigned'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <StatusBadge status={task.status} size="sm" />
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {task.priority && getPriorityBadge(task.priority)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {task.deadline ? (
                                                <div className="flex items-center text-sm">
                                                    <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                                                    <span
                                                        className={
                                                            isOverdue(task.deadline, task.status)
                                                                ? 'text-red-600 font-medium'
                                                                : 'text-gray-900'
                                                        }
                                                    >
                                                        {new Date(task.deadline).toLocaleDateString()}
                                                    </span>
                                                </div>
                                            ) : (
                                                <span className="text-sm text-gray-400">-</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => openViewTaskModal(task)}
                                                    className="text-blue-600 hover:text-blue-900"
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </button>
                                                <button
                                                    onClick={() => openEditTaskModal(task)}
                                                    className="text-gray-600 hover:text-gray-900"
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </button>
                                                {isAdmin && (
                                                    <button
                                                        onClick={() => handleDeleteClick(task.id, task.title)}
                                                        className="text-red-600 hover:text-red-900"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {tasks.data.length > 0 && (
                    <div className="border-t border-gray-200 bg-white px-4 py-3">
                        <div className="flex items-center justify-between">
                            <div className="text-sm text-gray-700">
                                Showing <span className="font-medium">{paginationMeta.from ?? 0}</span> to{' '}
                                <span className="font-medium">{paginationMeta.to ?? 0}</span> of{' '}
                                <span className="font-medium">{paginationMeta.total ?? 0}</span> results
                            </div>
                            <div className="flex gap-2">
                                {paginationLinks.prev && (
                                    <Link
                                        href={paginationLinks.prev}
                                        className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                                    >
                                        Previous
                                    </Link>
                                )}
                                {paginationLinks.next && (
                                    <Link
                                        href={paginationLinks.next}
                                        className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                                    >
                                        Next
                                    </Link>
                                )}
                            </div>
                        </div>
                    </div>
                )}

            <Modal
                isOpen={viewModalOpen}
                onClose={closeViewTaskModal}
                title={selectedTask ? `Task: ${selectedTask.title}` : 'Task Details'}
                description="View task details"
                maxWidthClassName="max-w-2xl"
            >
                {selectedTask && (
                    <div className="space-y-5">
                        <div className="flex items-center gap-3">
                            <StatusBadge status={selectedTask.status} size="md" />
                            {selectedTask.priority && getPriorityBadge(selectedTask.priority)}
                        </div>

                        {selectedTask.description && (
                            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
                                {selectedTask.description}
                            </div>
                        )}

                        <div className="grid grid-cols-1 gap-4 rounded-lg border border-gray-200 p-4 sm:grid-cols-2">
                            <div>
                                <p className="text-xs uppercase tracking-wide text-gray-500">Project</p>
                                <p className="mt-1 text-sm text-gray-900">{selectedTask.project?.name || 'N/A'}</p>
                            </div>
                            <div>
                                <p className="text-xs uppercase tracking-wide text-gray-500">Assignee</p>
                                <p className="mt-1 text-sm text-gray-900">{selectedTask.assignee?.name || 'Unassigned'}</p>
                            </div>
                            <div>
                                <p className="text-xs uppercase tracking-wide text-gray-500">Reporter</p>
                                <p className="mt-1 text-sm text-gray-900">{selectedTask.reporter?.name || 'N/A'}</p>
                            </div>
                            <div>
                                <p className="text-xs uppercase tracking-wide text-gray-500">Deadline</p>
                                <p className="mt-1 text-sm text-gray-900">
                                    {selectedTask.deadline
                                        ? new Date(selectedTask.deadline).toLocaleDateString()
                                        : 'N/A'}
                                </p>
                            </div>
                        </div>

                        <div className="flex justify-between border-t border-gray-200 pt-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                    closeViewTaskModal();
                                    openEditTaskModal(selectedTask);
                                }}
                            >
                                Edit Task
                            </Button>
                            <Button type="button" variant="outline" onClick={closeViewTaskModal}>
                                Close
                            </Button>
                        </div>
                    </div>
                )}
            </Modal>

            <Modal
                isOpen={taskModalOpen}
                onClose={closeTaskModal}
                title={taskFormMode === 'create' ? 'Create New Task' : 'Edit Task'}
                description={
                    taskFormMode === 'create'
                        ? 'Add a new task and assign it to team members'
                        : 'Update task information'
                }
                maxWidthClassName="max-w-3xl"
            >
                <form onSubmit={handleTaskSubmit} className="space-y-6">
                    <div>
                        <h3 className="mb-4 text-md font-medium text-gray-900">Task Information</h3>
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                            <div className="sm:col-span-2">
                                <Label htmlFor="title" required>
                                    Task Title
                                </Label>
                                <Input
                                    id="title"
                                    type="text"
                                    value={data.title}
                                    onChange={(e) => setData('title', e.target.value)}
                                    placeholder="Fix login bug"
                                    className="mt-1"
                                />
                                <InputError message={errors.title} className="mt-2" />
                            </div>

                            <div className="sm:col-span-2">
                                <Label htmlFor="description">Description</Label>
                                <Description
                                    id="description"
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                    rows={4}
                                    placeholder="Detailed description of the task..."
                                />
                                <InputError message={errors.description} className="mt-2" />
                            </div>

                            {(taskFormMode === 'create' || isAdmin) && (
                                <div className="sm:col-span-2">
                                    <Label htmlFor="project_id" required>
                                        Project
                                    </Label>
                                    <ReactSelectField<string>
                                        id="project_id"
                                        value={data.project_id}
                                        options={projectOptions}
                                        onChange={(value) => setData('project_id', value)}
                                        className="mt-1"
                                    />
                                    <InputError message={errors.project_id} className="mt-2" />
                                </div>
                            )}

                            {(taskFormMode === 'create' || isAdmin) && (
                                <div>
                                    <Label htmlFor="assigned_to" required>
                                        Assign To
                                    </Label>
                                    <ReactSelectField<string>
                                        id="assigned_to"
                                        value={data.assigned_to}
                                        options={assigneeOptions}
                                        onChange={(value) => setData('assigned_to', value)}
                                        className="mt-1"
                                    />
                                    {taskFormMode === 'create' && data.project_id === '' && (
                                        <p className="mt-2 text-xs text-gray-500">Select a project first.</p>
                                    )}
                                    <InputError message={errors.assigned_to} className="mt-2" />
                                </div>
                            )}

                            {taskFormMode === 'create' && (
                                <div>
                                    <Label htmlFor="reporting_to" required>
                                        Reporting To
                                    </Label>
                                    <ReactSelectField<string>
                                        id="reporting_to"
                                        value={data.reporting_to}
                                        options={adminOptions}
                                        onChange={(value) => setData('reporting_to', value)}
                                        className="mt-1"
                                    />
                                    <InputError message={errors.reporting_to} className="mt-2" />
                                </div>
                            )}

                            {!isAdmin && taskFormMode === 'edit' && (
                                <div className="sm:col-span-2 rounded-lg border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-700">
                                    You can update progress and details of tasks assigned to you.
                                </div>
                            )}

                            <div>
                                <Label htmlFor="status" required>
                                    Status
                                </Label>
                                <ReactSelectField<Task['status']>
                                    id="status"
                                    value={data.status}
                                    options={statusOptions}
                                    onChange={(value) => setData('status', value)}
                                    isClearable={false}
                                    className="mt-1"
                                />
                                <InputError message={errors.status} className="mt-2" />
                            </div>

                            <div>
                                <Label htmlFor="priority">Priority</Label>
                                <ReactSelectField<NonNullable<Task['priority']>>
                                    id="priority"
                                    value={data.priority ?? 'medium'}
                                    options={priorityOptions}
                                    onChange={(value) => setData('priority', value)}
                                    isClearable={false}
                                    className="mt-1"
                                />
                                <InputError message={errors.priority} className="mt-2" />
                            </div>

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

                    <div className="flex items-center justify-end gap-3 border-t border-gray-200 pt-6">
                        <Button type="button" variant="outline" onClick={closeTaskModal}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={processing} className="bg-blue-600 hover:bg-blue-700">
                            {processing
                                ? taskFormMode === 'create'
                                    ? 'Creating...'
                                    : 'Updating...'
                                : taskFormMode === 'create'
                                  ? 'Create Task'
                                  : 'Update Task'}
                        </Button>
                    </div>
                </form>
            </Modal>

            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <DialogContent className="sm:max-w-100">
                    <DialogHeader>
                        <DialogTitle className="text-red-600">Delete Task</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete <span className="font-semibold text-gray-900">{taskToDelete?.title}</span>? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="gap-2">
                        <Button
                            variant="outline"
                            onClick={() => setDeleteDialogOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={confirmDelete}
                            className="bg-red-600 hover:bg-red-700 text-white"
                        >
                            Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
            </div>
        </AppLayout>
    );
}