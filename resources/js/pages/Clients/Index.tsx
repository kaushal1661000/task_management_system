import { Head, Link, router, useForm } from '@inertiajs/react';
import { Search, Edit, Trash2, Eye, Building2, Mail, Phone } from 'lucide-react';
import { useState } from 'react';
import InputError from '@/components/input-error';
import Modal from '@/components/ui/Modal';
import { Button } from '@/components/ui/button';
import Description from '@/components/ui/Description';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/AppLayout';
import {
    index as clientsIndex,
    destroy as clientsDestroy,
    update as clientsUpdate,
} from '@/routes/clients';
import type { ClientsIndexProps } from '@/types';

export default function ClientsIndex({ clients, filters }: ClientsIndexProps) {
    const [search, setSearch] = useState(filters?.search ?? '');
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [clientToDelete, setClientToDelete] = useState<{ id: string; name: string } | null>(null);
    const [viewModalOpen, setViewModalOpen] = useState(false);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [selectedClient, setSelectedClient] = useState<ClientsIndexProps['clients']['data'][number] | null>(null);

    const { data, setData, put, processing, errors, clearErrors } = useForm({
        name: '',
        email: '',
        company_name: '',
        phone: '',
        address: '',
    });

    const paginationMeta = clients.meta ?? {
        from: clients.from,
        to: clients.to,
        total: clients.total,
    };

    const paginationLinks = Array.isArray(clients.links)
        ? {
              prev: clients.prevPageUrl ?? clients.prev_page_url ?? null,
              next: clients.nextPageUrl ?? clients.next_page_url ?? null,
          }
        : clients.links;

    const handleSearch = (event: React.FormEvent) => {
        event.preventDefault();
        const searchTerm = search.trim();

        router.get(
            clientsIndex(),
            { search: searchTerm },
            { preserveState: true }
        );
    };

    const handleDeleteClick = (clientId: string, companyName: string) => {
        setClientToDelete({ id: clientId, name: companyName });
        setDeleteDialogOpen(true);
    };

    const confirmDelete = () => {
        if (clientToDelete) {
            router.delete(clientsDestroy(clientToDelete.id));
            setDeleteDialogOpen(false);
            setClientToDelete(null);
        }
    };

    const openViewModal = (client: ClientsIndexProps['clients']['data'][number]) => {
        setSelectedClient(client);
        setViewModalOpen(true);
    };

    const openEditModal = (client: ClientsIndexProps['clients']['data'][number]) => {
        const normalizedClient = client as typeof client & {
            company_name?: string;
        };

        setSelectedClient(client);
        setData({
            name: client.user?.name || '',
            email: client.user?.email || '',
            company_name: client.companyName || normalizedClient.company_name || '',
            phone: client.phone || '',
            address: client.address || '',
        });
        clearErrors();
        setEditModalOpen(true);
    };

    const closeEditModal = () => {
        if (processing) {
            return;
        }
        setEditModalOpen(false);
        setSelectedClient(null);
        clearErrors();
    };

    const closeViewModal = () => {
        setViewModalOpen(false);
        setSelectedClient(null);
    };

    const handleEditSubmit = (event: React.FormEvent) => {
        event.preventDefault();

        if (!selectedClient) {
            return;
        }

        put(clientsUpdate(selectedClient.id).url, {
            onSuccess: () => {
                setEditModalOpen(false);
                setSelectedClient(null);
                clearErrors();
            },
        });
    };

    return (
        <AppLayout header="Clients">
            <Head title="Clients" />

            {/* Header with Actions */}
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Clients</h1>
                    <p className="mt-1 text-sm text-gray-500">
                        Manage your client accounts and projects
                    </p>
                </div>
            </div>

            {/* Search Bar */}
            <div className="mb-6 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <form onSubmit={handleSearch} className="flex gap-3">
                    <div className="flex-1">
                        <Input
                            type="text"
                            placeholder="Search by company name, contact name, or email..."
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

            {/* Clients Grid */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {clients.data.length === 0 ? (
                    <div className="col-span-full">
                        <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
                            <Building2 className="mx-auto h-12 w-12 text-gray-400" />
                            <h3 className="mt-2 text-sm font-medium text-gray-900">No clients</h3>
                            <p className="mt-1 text-sm text-gray-500">
                                Get started by creating a new client.
                            </p>
                        </div>
                    </div>
                ) : (
                    clients.data.map((client) => {
                        const normalizedClient = client as typeof client & {
                            company_name?: string;
                            projects_count?: number;
                        };

                        const companyName = client.companyName || normalizedClient.company_name || 'N/A';
                        const projectsCount = client.projectsCount ?? normalizedClient.projects_count ?? 0;

                        return (
                        <div
                            key={client.id}
                            className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow overflow-hidden"
                        >
                            <div className="p-6">
                                {/* Company Header */}
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center">
                                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100">
                                            <Building2 className="h-6 w-6 text-green-600" />
                                        </div>
                                        <div className="ml-3">
                                            <h3 className="text-lg font-semibold text-gray-900">
                                                {companyName}
                                            </h3>
                                            <p className="text-sm text-gray-500">
                                                {projectsCount} Projects
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Contact Info */}
                                <div className="space-y-2 mb-4">
                                    <div className="flex items-center text-sm text-gray-600">
                                        <Mail className="h-4 w-4 mr-2 text-gray-400" />
                                        {client.user?.email || 'N/A'}
                                    </div>
                                    {client.phone && (
                                        <div className="flex items-center text-sm text-gray-600">
                                            <Phone className="h-4 w-4 mr-2 text-gray-400" />
                                            {client.phone}
                                        </div>
                                    )}
                                </div>

                                {/* Actions */}
                                <div className="flex items-center gap-2 pt-4 border-t border-gray-200">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="w-full"
                                        onClick={() => openViewModal(client)}
                                    >
                                        <Eye className="mr-2 h-4 w-4" />
                                        View
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="icon"
                                        onClick={() => openEditModal(client)}
                                    >
                                            <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        onClick={() =>
                                            handleDeleteClick(client.id, companyName || 'client')
                                        }
                                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                        );
                    })
                )}
            </div>

            {/* Pagination */}
            {clients.data.length > 0 && (
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
                isOpen={viewModalOpen && Boolean(selectedClient)}
                onClose={closeViewModal}
                title={selectedClient ? `${selectedClient.companyName || (selectedClient as typeof selectedClient & { company_name?: string }).company_name || 'Client'} Details` : 'Client Details'}
                description="View client information without leaving this page"
                maxWidthClassName="max-w-3xl"
            >
                {selectedClient && (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div className="rounded-lg border border-gray-200 p-4">
                                <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Contact Name</p>
                                <p className="mt-1 text-sm font-medium text-gray-900">{selectedClient.user?.name || 'N/A'}</p>
                            </div>
                            <div className="rounded-lg border border-gray-200 p-4">
                                <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Email</p>
                                <p className="mt-1 text-sm font-medium text-gray-900">{selectedClient.user?.email || 'N/A'}</p>
                            </div>
                            <div className="rounded-lg border border-gray-200 p-4">
                                <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Phone</p>
                                <p className="mt-1 text-sm font-medium text-gray-900">{selectedClient.phone || 'N/A'}</p>
                            </div>
                            <div className="rounded-lg border border-gray-200 p-4">
                                <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Total Projects</p>
                                <p className="mt-1 text-sm font-medium text-gray-900">
                                    {selectedClient.projectsCount ?? (selectedClient as typeof selectedClient & { projects_count?: number }).projects_count ?? 0}
                                </p>
                            </div>
                        </div>

                        <div className="rounded-lg border border-gray-200 p-4">
                            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Address</p>
                            <p className="mt-1 text-sm text-gray-900 whitespace-pre-line">{selectedClient.address || 'N/A'}</p>
                        </div>

                        <div className="rounded-lg border border-gray-200 p-4">
                            <div className="mb-3 flex items-center justify-between">
                                <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Assigned Projects</p>
                                <p className="text-xs font-medium text-gray-600">
                                    {selectedClient.projects?.length ?? 0} Total
                                </p>
                            </div>

                            {!selectedClient.projects || selectedClient.projects.length === 0 ? (
                                <p className="text-sm text-gray-500">No projects assigned yet.</p>
                            ) : (
                                <div className="space-y-3">
                                    {selectedClient.projects.map((project) => {
                                        const memberEntries = Array.isArray(project.members) ? project.members : [];

                                        return (
                                            <div key={project.id} className="rounded-lg border border-gray-200 p-3">
                                                <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                                                    <p className="text-sm font-semibold text-gray-900">{project.name}</p>
                                                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium capitalize text-slate-700">
                                                        {String(project.status || '').replace('_', ' ') || 'N/A'}
                                                    </span>
                                                </div>

                                                <div className="mt-2">
                                                    <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Project Members</p>

                                                    {memberEntries.length === 0 ? (
                                                        <p className="mt-1 text-sm text-gray-500">No members assigned.</p>
                                                    ) : (
                                                        <div className="mt-2 flex flex-wrap gap-2">
                                                            {memberEntries.map((member) => {
                                                                const normalizedMember = member as typeof member & {
                                                                    name?: string;
                                                                    email?: string;
                                                                    user?: { name?: string; email?: string };
                                                                };

                                                                const memberName = normalizedMember.name || normalizedMember.user?.name || 'Member';
                                                                const memberEmail = normalizedMember.email || normalizedMember.user?.email || '';

                                                                return (
                                                                    <span
                                                                        key={`${project.id}-${String((normalizedMember as { id?: string }).id || memberName)}`}
                                                                        className="rounded-full border border-gray-200 bg-gray-50 px-2.5 py-1 text-xs text-gray-700"
                                                                        title={memberEmail || memberName}
                                                                    >
                                                                        {memberEmail ? `${memberName} (${memberEmail})` : memberName}
                                                                    </span>
                                                                );
                                                            })}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        <div className="flex justify-end">
                            <Button type="button" variant="outline" onClick={closeViewModal}>
                                Close
                            </Button>
                        </div>
                    </div>
                )}
            </Modal>

            <Modal
                isOpen={editModalOpen && Boolean(selectedClient)}
                onClose={closeEditModal}
                title="Edit Client"
                description="Update client details without leaving this page"
                maxWidthClassName="max-w-3xl"
            >
                {selectedClient && (
                    <form onSubmit={handleEditSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                            <div className="sm:col-span-2">
                                <Label htmlFor="edit_name" required>
                                    Contact Name
                                </Label>
                                <Input
                                    id="edit_name"
                                    type="text"
                                    className="mt-1"
                                    value={data.name}
                                    onChange={(event) => setData('name', event.target.value)}
                                />
                                <InputError message={errors.name} className="mt-2" />
                            </div>

                            <div className="sm:col-span-2">
                                <Label htmlFor="edit_email" required>
                                    Email Address
                                </Label>
                                <Input
                                    id="edit_email"
                                    type="email"
                                    className="mt-1"
                                    value={data.email}
                                    onChange={(event) => setData('email', event.target.value)}
                                />
                                <InputError message={errors.email} className="mt-2" />
                            </div>

                            <div className="sm:col-span-2">
                                <Label htmlFor="edit_company_name" required>
                                    Company Name
                                </Label>
                                <Input
                                    id="edit_company_name"
                                    type="text"
                                    className="mt-1"
                                    value={data.company_name}
                                    onChange={(event) => setData('company_name', event.target.value)}
                                />
                                <InputError message={errors.company_name} className="mt-2" />
                            </div>

                            <div>
                                <Label htmlFor="edit_phone" required>
                                    Phone Number
                                </Label>
                                <Input
                                    id="edit_phone"
                                    type="tel"
                                    className="mt-1"
                                    value={data.phone}
                                    onChange={(event) => setData('phone', event.target.value)}
                                />
                                <InputError message={errors.phone} className="mt-2" />
                            </div>

                            <div className="sm:col-span-2">
                                <Label htmlFor="edit_address">Address</Label>
                                <Description
                                    id="edit_address"
                                    rows={3}
                                    value={data.address}
                                    onChange={(event) => setData('address', event.target.value)}
                                />
                                <InputError message={errors.address} className="mt-2" />
                            </div>
                        </div>

                        <div className="flex items-center justify-end gap-3 border-t border-gray-200 pt-4">
                            <Button type="button" variant="outline" onClick={closeEditModal} disabled={processing}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={processing} className="bg-blue-600 hover:bg-blue-700">
                                {processing ? 'Updating...' : 'Update Client'}
                            </Button>
                        </div>
                    </form>
                )}
            </Modal>

            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <DialogContent className="sm:max-w-100">
                    <DialogHeader>
                        <DialogTitle className="text-red-600">Delete Client</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete <span className="font-semibold text-gray-900">{clientToDelete?.name}</span>? This action cannot be undone.
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