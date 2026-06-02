import { Head, Link, router, useForm } from '@inertiajs/react';
import { Plus, Search, Edit, Trash2, Eye, FolderKanban, Users, Calendar, DollarSign } from 'lucide-react';
import type { FormEvent } from 'react';
import { useState } from 'react';
import InputError from '@/components/input-error';
import ReactMultiSelectField from '@/components/react-multi-select-field';
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
    index as projectsIndex,
    destroy as projectsDestroy,
    store as projectsStore,
    update as projectsUpdate,
} from '@/routes/projects';
import type { Project, ProjectsIndexProps } from '@/types';
import type { ReactSelectOption } from '@/components/react-select-field';

interface ProjectFormData {
    name: string;
    description: string;
    client_id: string;
    status: Project['status'];
    start_date: string;
    end_date: string;
    budget: string | number;
    member_ids: string[];
}

const defaultProjectFormData: ProjectFormData = {
    name: '',
    description: '',
    client_id: '',
    status: 'active',
    start_date: '',
    end_date: '',
    budget: '',
    member_ids: [],
};

export default function ProjectsIndex({ projects, auth, filters, clients, employees }: ProjectsIndexProps) {
    const [search, setSearch] = useState(filters?.search ?? '');
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [projectToDelete, setProjectToDelete] = useState<{ id: string; name: string } | null>(null);
    const [projectModalOpen, setProjectModalOpen] = useState(false);
    const [projectFormMode, setProjectFormMode] = useState<'create' | 'edit'>('create');
    const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
    const [viewModalOpen, setViewModalOpen] = useState(false);
    const [selectedProject, setSelectedProject] = useState<Project | null>(null);
    const isAdmin = auth.user.role === 'admin';

    const { data, setData, post, put, processing, errors, clearErrors } = useForm<ProjectFormData>(
        defaultProjectFormData,
    );

    const paginationMeta = projects.meta ?? {
        from: projects.from,
        to: projects.to,
        total: projects.total,
    };

    const paginationLinks = Array.isArray(projects.links)
        ? {
            prev: projects.prevPageUrl ?? projects.prev_page_url ?? null,
            next: projects.nextPageUrl ?? projects.next_page_url ?? null,
        }
        : projects.links;
    const handleSearch = (event: React.FormEvent) => {
        event.preventDefault();
        const searchTerm = search.trim();

        router.get(
            projectsIndex(),
            { search: searchTerm },
            { preserveState: true }
        );
    };
    const handleDeleteClick = (projectId: string, projectName: string) => {
        setProjectToDelete({ id: projectId, name: projectName });
        setDeleteDialogOpen(true);
    };

    const closeProjectModal = () => {
        setProjectModalOpen(false);
        setProjectFormMode('create');
        setEditingProjectId(null);
        clearErrors();
        setData(defaultProjectFormData);
    };

    const openCreateProjectModal = () => {
        setProjectFormMode('create');
        setEditingProjectId(null);
        clearErrors();
        setData(defaultProjectFormData);
        setProjectModalOpen(true);
    };

    const openEditProjectModal = (project: Project) => {
        const normalizedProject = project as Project & {
            client_id?: string;
            start_date?: string;
            end_date?: string;
        };

        setProjectFormMode('edit');
        setEditingProjectId(project.id);
        clearErrors();
        setData({
            name: normalizedProject.name || '',
            description: normalizedProject.description || '',
            client_id: normalizedProject.clientId || normalizedProject.client_id || '',
            status: normalizedProject.status || 'active',
            start_date: normalizedProject.startDate || normalizedProject.start_date || '',
            end_date: normalizedProject.endDate || normalizedProject.end_date || '',
            budget: normalizedProject.budget || '',
            member_ids: normalizedProject.members?.map((member) => String(member.id)) || [],
        });
        setProjectModalOpen(true);
    };

    const openViewProjectModal = (project: Project) => {
        setSelectedProject(project);
        setViewModalOpen(true);
    };

    const closeViewProjectModal = () => {
        setViewModalOpen(false);
        setSelectedProject(null);
    };

    const handleProjectSubmit = (event: FormEvent) => {
        event.preventDefault();

        if (projectFormMode === 'create') {
            post(projectsStore.url(), {
                preserveScroll: true,
                onSuccess: () => closeProjectModal(),
            });

            return;
        }

        if (!editingProjectId) {
            return;
        }

        put(projectsUpdate.url(editingProjectId), {
            preserveScroll: true,
            onSuccess: () => closeProjectModal(),
        });
    };

    const confirmDelete = () => {
        if (projectToDelete) {
            router.delete(projectsDestroy(projectToDelete.id));
            setDeleteDialogOpen(false);
            setProjectToDelete(null);
        }
    };

    const clientOptions: ReactSelectOption<string>[] = [
        { value: '', label: 'Select a client' },
        ...clients.map((client) => ({
            value: String(client.id),
            label: client.companyName || client.company_name || client.user?.name || 'Unknown client',
        })),
    ];

    const projectStatusOptions: ReactSelectOption<Project['status']>[] = [
        { value: 'planning', label: 'Planning' },
        { value: 'active', label: 'Active' },
        { value: 'paused', label: 'Paused' },
        { value: 'completed', label: 'Completed' },
    ];

    const teamMemberOptions: ReactSelectOption<string>[] = employees.map((employee) => ({
        value: String(employee.id),
        label: employee.name,
    }));

    return (
        <AppLayout >
            <Head title="Projects" />
            {/* Header */}
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Projects</h1>
                    <p className="mt-1 text-sm text-gray-500">
                        {isAdmin ? 'Manage all projects' : 'View your assigned projects'}
                    </p>
                </div>
                {isAdmin && (
                    <Button onClick={openCreateProjectModal} className="cursor-pointer bg-blue-600 hover:bg-blue-700">
                        <Plus className="mr-2 h-4 w-4" />
                        New Project
                    </Button>
                )}
            </div>
            {/* Search */}
            <div className="mb-6 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <form onSubmit={handleSearch} className="flex gap-3">
                    <div className="flex-1">
                        <Input
                            type="text"
                            placeholder="Search projects by name or client..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full"
                        />
                    </div>
                    <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                        <Search className="mr-2 h-4 w-4" />
                        Search
                    </Button>
                </form>
            </div>
            {/* Projects Grid */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3">
                {projects.data.length === 0 ? (
                    <div className="col-span-full">
                        <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
                            <FolderKanban className="mx-auto h-12 w-12 text-gray-400" />
                            <h3 className="mt-2 text-sm font-medium text-gray-900">
                                No projects here
                            </h3>
                            <p className="mt-1 text-sm text-gray-500">
                                {isAdmin
                                    ? 'Get started by creating a new project.'
                                    : 'No projects assigned to you yet.'}
                            </p>
                            {isAdmin && (
                                <div className="mt-6">
                                    <Button onClick={openCreateProjectModal} className="bg-blue-600 hover:bg-blue-700">
                                        <Plus className="mr-2 h-4 w-4" />
                                        New Project
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    projects.data.map((project) => {
                        const normalizedProject = project as typeof project & {
                            tasks_count?: number;
                            members_count?: number;
                            start_date?: string;
                        };

                        const tasksCount =
                            project.tasksCount ??
                            normalizedProject.tasks_count ??
                            project.tasks?.length ??
                            0;

                        const membersCount =
                            project.membersCount ??
                            normalizedProject.members_count ??
                            project.members?.length ??
                            0;

                        const startDate = project.startDate ?? normalizedProject.start_date;

                        return (
                        <div
                            key={project.id}
                            className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow overflow-hidden"
                        >
                            <div className="p-6">
                                {/* Project Header */}
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">
                                                {project.name}
                                            </h3>
                                        </div>
                                        <StatusBadge status={project.status} size="sm" />
                                    </div>
                                </div>
                                {/* Description */}
                                {project.description && (
                                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                                        {project.description}
                                    </p>
                                )}
                                {/* Project Info */}
                                <div className="space-y-2 mb-4">
                                    <div className="flex items-center text-sm text-gray-600">
                                        <Users className="h-4 w-4 mr-2 text-gray-400" />
                                        Client: {project.client?.user?.name || 'N/A'}
                                    </div>
                                    {startDate && (
                                        <div className="flex items-center text-sm text-gray-600">
                                            <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                                            {new Date(startDate).toLocaleDateString()}
                                        </div>
                                    )}
                                </div>
                                {/* Stats */}
                                <div className="flex items-center gap-4 mb-4 p-3 bg-gray-50 rounded-lg">
                                    <div className="text-center">
                                        <p className="text-2xl font-bold text-blue-600">
                                            {tasksCount}
                                        </p>
                                        <p className="text-xs text-gray-500">Tasks</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-2xl font-bold text-purple-600">
                                            {membersCount}
                                        </p>
                                        <p className="text-xs text-gray-500">Members</p>
                                    </div>
                                </div>
                                {/* Actions */}
                                <div className="flex items-center gap-2 pt-4 border-t border-gray-200">
                                    <Button variant="outline" className="flex-1" onClick={() => openViewProjectModal(project)}>
                                        <Eye className="mr-2 h-4 w-4" />
                                        View
                                    </Button>
                                    {isAdmin && (
                                        <>
                                            <Button variant="outline" size="icon" onClick={() => openEditProjectModal(project)}>
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                onClick={() =>
                                                    handleDeleteClick(project.id, project.name)
                                                }
                                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                        );
                    })
                )}
            </div>
            {/* Pagination */}
            {projects.data.length > 0 && (
                <div className="mt-6 bg-white rounded-xl border border-gray-200 px-4 py-3">
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
                onClose={closeViewProjectModal}
                title={selectedProject ? `Project: ${selectedProject.name}` : 'Project Details'}
                description="View project information"
                maxWidthClassName="max-w-2xl"
            >
                {selectedProject && (() => {
                    const normalizedSelectedProject = selectedProject as Project & {
                        tasks_count?: number;
                        members_count?: number;
                        start_date?: string;
                        end_date?: string;
                    };

                    const selectedTasksCount =
                        selectedProject.tasksCount ??
                        normalizedSelectedProject.tasks_count ??
                        selectedProject.tasks?.length ??
                        0;

                    const selectedMembersCount =
                        selectedProject.membersCount ??
                        normalizedSelectedProject.members_count ??
                        selectedProject.members?.length ??
                        0;

                    const selectedStartDate = selectedProject.startDate ?? normalizedSelectedProject.start_date;
                    const selectedEndDate = selectedProject.endDate ?? normalizedSelectedProject.end_date;

                    return (
                        <div className="space-y-5">
                            <div className="flex items-center gap-3">
                                <StatusBadge status={selectedProject.status} size="md" />
                                {selectedProject.budget && (
                                    <div className="inline-flex items-center rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800">
                                        <DollarSign className="mr-1 h-3 w-3" />
                                        {parseFloat(String(selectedProject.budget)).toLocaleString()}
                                    </div>
                                )}
                            </div>

                            {selectedProject.description && (
                                <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
                                    {selectedProject.description}
                                </div>
                            )}

                            <div className="grid grid-cols-1 gap-4 rounded-lg border border-gray-200 p-4 sm:grid-cols-2">
                                <div>
                                    <p className="text-xs uppercase tracking-wide text-gray-500">Client</p>
                                    <p className="mt-1 text-sm text-gray-900">
                                        {selectedProject.client?.companyName || selectedProject.client?.user?.name || 'N/A'}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs uppercase tracking-wide text-gray-500">Start Date</p>
                                    <p className="mt-1 text-sm text-gray-900">
                                        {selectedStartDate ? new Date(selectedStartDate).toLocaleDateString() : 'N/A'}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs uppercase tracking-wide text-gray-500">End Date</p>
                                    <p className="mt-1 text-sm text-gray-900">
                                        {selectedEndDate ? new Date(selectedEndDate).toLocaleDateString() : 'N/A'}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs uppercase tracking-wide text-gray-500">Tasks / Members</p>
                                    <p className="mt-1 text-sm text-gray-900">{selectedTasksCount} / {selectedMembersCount}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                                <div className="rounded-lg border border-gray-200 p-4">
                                    <h4 className="mb-3 text-sm font-semibold text-gray-900">
                                        Project Members ({selectedProject.members?.length || 0})
                                    </h4>
                                    {!selectedProject.members || selectedProject.members.length === 0 ? (
                                        <p className="text-sm text-gray-500">No members assigned</p>
                                    ) : (
                                        <div className="space-y-2">
                                            {selectedProject.members.map((member) => (
                                                <div key={member.id} className="rounded-md bg-gray-50 px-3 py-2">
                                                    <p className="text-sm font-medium text-gray-900">
                                                        {member.user?.name || member.name || 'Unknown'}
                                                    </p>
                                                    <p className="text-xs text-gray-500">
                                                        {member.user?.email || member.email || 'N/A'}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div className="rounded-lg border border-gray-200 p-4">
                                    <h4 className="mb-3 text-sm font-semibold text-gray-900">
                                        Project Tasks ({selectedProject.tasks?.length || 0})
                                    </h4>
                                    {!selectedProject.tasks || selectedProject.tasks.length === 0 ? (
                                        <p className="text-sm text-gray-500">No tasks created</p>
                                    ) : (
                                        <div className="space-y-2">
                                            {selectedProject.tasks.map((task) => (
                                                <div key={task.id} className="rounded-md bg-gray-50 px-3 py-2">
                                                    <div className="flex items-center justify-between gap-2">
                                                        <p className="text-sm font-medium text-gray-900">{task.title}</p>
                                                        <StatusBadge status={task.status} size="sm" />
                                                    </div>
                                                    <p className="mt-1 text-xs text-gray-500">
                                                        Assignee: {task.assignee?.name || 'Unassigned'}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="flex justify-between border-t border-gray-200 pt-4">
                                {isAdmin ? (
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => {
                                            closeViewProjectModal();
                                            openEditProjectModal(selectedProject);
                                        }}
                                    >
                                        Edit Project
                                    </Button>
                                ) : (
                                    <div />
                                )}
                                <Button type="button" variant="outline" onClick={closeViewProjectModal}>
                                    Close
                                </Button>
                            </div>
                        </div>
                    );
                })()}
            </Modal>

            {isAdmin && (
                <Modal
                    isOpen={projectModalOpen}
                    onClose={closeProjectModal}
                    title={projectFormMode === 'create' ? 'Create New Project' : 'Edit Project'}
                    description={
                        projectFormMode === 'create'
                            ? 'Set up a new project with client and team members'
                            : 'Update project information and team members'
                    }
                    maxWidthClassName="max-w-4xl"
                >
                    <form onSubmit={handleProjectSubmit} className="space-y-6">
                        <div>
                            <h3 className="mb-4 text-md font-medium text-gray-900">Basic Information</h3>
                            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                <div className="sm:col-span-2">
                                    <Label htmlFor="name" required>
                                        Project Name
                                    </Label>
                                    <Input
                                        id="name"
                                        type="text"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        placeholder="Website Redesign"
                                        className="mt-1"
                                    />
                                    <InputError message={errors.name} className="mt-2" />
                                </div>

                                <div className="sm:col-span-2">
                                    <Label htmlFor="description">Description</Label>
                                    <Description
                                        id="description"
                                        value={data.description}
                                        onChange={(e) => setData('description', e.target.value)}
                                        rows={4}
                                        placeholder="Project description and objectives..."
                                    />
                                    <InputError message={errors.description} className="mt-2" />
                                </div>

                                <div className="sm:col-span-2">
                                    <Label htmlFor="client_id" required>
                                        Client
                                    </Label>
                                    <ReactSelectField<string>
                                        id="client_id"
                                        value={data.client_id}
                                        options={clientOptions}
                                        onChange={(value) => setData('client_id', value)}
                                        className="mt-1"
                                    />
                                    <InputError message={errors.client_id} className="mt-2" />
                                </div>

                                <div>
                                    <Label htmlFor="status" required>
                                        Status
                                    </Label>
                                    <ReactSelectField<Project['status']>
                                        id="status"
                                        value={data.status}
                                        options={projectStatusOptions}
                                        onChange={(value) => setData('status', value)}
                                        isClearable={false}
                                        className="mt-1"
                                    />
                                    <InputError message={errors.status} className="mt-2" />
                                </div>

                                <div>
                                    <Label htmlFor="budget">Budget</Label>
                                    <Input
                                        id="budget"
                                        type="number"
                                        step="0.01"
                                        value={data.budget}
                                        onChange={(e) => setData('budget', e.target.value)}
                                        placeholder="10000.00"
                                        className="mt-1"
                                    />
                                    <InputError message={errors.budget} className="mt-2" />
                                </div>

                                <div>
                                    <Label htmlFor="start_date" required>
                                        Start Date
                                    </Label>
                                    <DatePicker
                                        id="start_date"
                                        value={data.start_date}
                                        onChange={(value) => setData('start_date', value)}
                                    />
                                    <InputError message={errors.start_date} className="mt-2" />
                                </div>

                                <div>
                                    <Label htmlFor="end_date">End Date</Label>
                                    <DatePicker
                                        id="end_date"
                                        value={data.end_date}
                                        onChange={(value) => setData('end_date', value)}
                                    />
                                    <InputError message={errors.end_date} className="mt-2" />
                                </div>
                            </div>
                        </div>

                        <div className="border-t border-gray-200 pt-6">
                            <h3 className="mb-4 text-md font-medium text-gray-900">Team Members</h3>
                            <ReactMultiSelectField<string>
                                id="member_ids"
                                value={data.member_ids}
                                options={teamMemberOptions}
                                onChange={(ids) => setData('member_ids', ids)}
                                placeholder="Select team members"
                                menuPlacement="top"
                            />
                            <InputError message={errors.member_ids} className="mt-2" />
                        </div>

                        <div className="flex items-center justify-end gap-3 border-t border-gray-200 pt-6">
                            <Button type="button" variant="outline" onClick={closeProjectModal}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={processing} className="bg-blue-600 hover:bg-blue-700">
                                {processing
                                    ? projectFormMode === 'create'
                                        ? 'Creating...'
                                        : 'Updating...'
                                    : projectFormMode === 'create'
                                      ? 'Create Project'
                                      : 'Update Project'}
                            </Button>
                        </div>
                    </form>
                </Modal>
            )}

            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="text-red-600">Delete Project</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete <span className="font-semibold text-gray-900">{projectToDelete?.name}</span>? This action cannot be undone.
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
        </AppLayout>
    );
}
