import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import type { FormEventHandler } from 'react';
import EmployeeMultiSelectDropdown from '@/components/employee-multi-select-dropdown';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import Description from '@/components/ui/Description';
import DatePicker from '@/components/ui/DatePicker';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/AppLayout';
import { index as projectsIndex, update as projectsUpdate } from '@/routes/projects';
import type { PageProps, Project, Client, User } from '@/types';

interface EditProps extends PageProps {
    project: Project;
    clients: Client[];
    employees: User[];
}

export default function Edit({ project, clients, employees }: EditProps) {
    const normalizedProject = project as Project & {
        client_id?: string;
        start_date?: string;
        end_date?: string;
    };
    const currentMemberIds = project.members?.map((member) => String(member.id)) || [];
    
    const { data, setData, put, processing, errors } = useForm({
        name: normalizedProject.name || '',
        description: normalizedProject.description || '',
        client_id: normalizedProject.clientId || normalizedProject.client_id || '',
        status: normalizedProject.status || 'active',
        start_date: normalizedProject.startDate || normalizedProject.start_date || '',
        end_date: normalizedProject.endDate || normalizedProject.end_date || '',
        budget: normalizedProject.budget || '',
        member_ids: currentMemberIds,
    });

    const handleSubmit: FormEventHandler = (event) => {
        event.preventDefault();
        put(projectsUpdate.url(project.id));
    };

    return (
        <AppLayout header="Edit Project">
            <Head title="Edit Project" />

            {/* Back Button */}
            <div className="mb-6">
                <Link
                    href={projectsIndex()}
                    className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900"
                >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Projects
                </Link>
            </div>

            {/* Form Card */}
            <div className="mx-auto max-w-4xl">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
                        <h2 className="text-lg font-semibold text-gray-900">Edit Project</h2>
                        <p className="mt-1 text-sm text-gray-500">
                            Update project information and team members
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="p-6 space-y-6">
                        {/* Basic Information */}
                        <div>
                            <h3 className="text-md font-medium text-gray-900 mb-4">
                                Basic Information
                            </h3>
                            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                {/* Project Name */}
                                <div className="sm:col-span-2">
                                    <Label htmlFor="name" required>Project Name</Label>
                                    <Input
                                        id="name"
                                        type="text"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        className="mt-1"
                                        // required
                                    />
                                    <InputError message={errors.name} className="mt-2" />
                                </div>

                                {/* Description */}
                                <div className="sm:col-span-2">
                                    <Label htmlFor="description">Description of project</Label>
                                    <Description
                                        id="description"
                                        value={data.description}
                                        onChange={(e) => setData('description', e.target.value)}
                                        rows={4}
                                    />
                                    <InputError message={errors.description} className="mt-2" />
                                </div>

                                {/* Client */}
                                <div className="sm:col-span-2">
                                    <Label htmlFor="client_id" required>Client</Label>
                                    <select
                                        id="client_id"
                                        value={data.client_id}
                                        onChange={(e) => setData('client_id', e.target.value)}
                                        className="mt-1 block w-full rounded-lg border-gray-300 shadow-lg focus:border-blue-500 focus:ring-blue-500"
                                    >
                                        <option value="">Select a client</option>
                                        {clients?.map((client) => (
                                            <option key={client.id} value={client.id}>
                                                {client.companyName || client.user?.name}
                                            </option>
                                        ))}
                                    </select>
                                    <InputError message={errors.client_id} className="mt-2" />
                                </div>

                                {/* Status */}
                                <div>
                                    <Label htmlFor="status" required>Status</Label>
                                    <select
                                        id="status"
                                        value={data.status}
                                        onChange={(e) => setData('status', e.target.value as Project['status'])}
                                        className="mt-1 block w-full rounded-lg border-gray-300 shadow-lg focus:border-blue-500 focus:ring-blue-500"
                                    >      
                                        <option value="planning">Planning</option>
                                        <option value="active">Active</option>
                                        <option value="paused">Paused</option>
                                        <option value="completed">Completed</option>
                                    </select>
                                    <InputError message={errors.status} className="mt-2" />
                                </div>

                                {/* Budget */}
                                <div>
                                    <Label htmlFor="budget">Budget</Label>
                                    <Input
                                        id="budget"
                                        type="number"
                                        step="0.01"
                                        value={data.budget}
                                        onChange={(e) => setData('budget', e.target.value)}
                                        className="mt-1"
                                    />
                                    <InputError message={errors.budget} className="mt-2" />
                                </div>

                                {/* Start Date */}
                                <div>
                                    <Label htmlFor="start_date" required>Start Date</Label>
                                    <DatePicker
                                        id="start_date"
                                        value={data.start_date}
                                        onChange={(value) => setData('start_date', value)}
                                    />
                                    <InputError message={errors.start_date} className="mt-2" />
                                </div>

                                {/* End Date */}
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

                        {/* Team Members */}
                        <div className="border-t border-gray-200 pt-6">
                            <h3 className="text-md font-medium text-gray-900 mb-4">
                                Team Members
                            </h3>
                            <EmployeeMultiSelectDropdown
                                employees={employees}
                                selectedIds={data.member_ids}
                                onChange={(ids) => setData('member_ids', ids)}
                            />
                            <InputError message={errors.member_ids} className="mt-2" />
                        </div>

                        {/* Form Actions */}
                        <div className="flex items-center justify-end gap-3 border-t border-gray-200 pt-6">
                            <Link href={projectsIndex()}>
                                <Button type="button" variant="outline">
                                    Cancel
                                </Button>
                            </Link>
                            <Button
                                type="submit"
                                disabled={processing}
                                className="bg-blue-600 hover:bg-blue-700"
                            >
                                {processing ? 'Updating...' : 'Update Project'}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}
