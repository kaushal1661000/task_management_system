import { Head, Link, router, useForm } from '@inertiajs/react';
import { Plus, Search, Edit, Trash2, Eye } from 'lucide-react';
import type { FormEvent } from 'react';
import { useState } from 'react';
import InputError from '@/components/input-error';
import ReactSelectField, { type ReactSelectOption } from '@/components/react-select-field';
import { Button } from '@/components/ui/button';
import Description from '@/components/ui/Description';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Modal from '@/components/ui/Modal';
import AppLayout from '@/layouts/AppLayout';
import {
    destroy as usersDestroy,
    index as usersIndexRoute,
    store as usersStore,
    update as usersUpdate,
} from '@/routes/users';
import type { Client, TaskUser, UsersIndexProps } from '@/types';

type UserRole = 'admin' | 'employee' | 'client';

interface UserFormData {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
    role: UserRole;
    company_name: string;
    phone: string;
    address: string;
}

const defaultUserFormData: UserFormData = {
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
    role: 'employee',
    company_name: '',
    phone: '',
    address: '',
};

export default function UsersIndex({ users }: UsersIndexProps) {
    const [search, setSearch] = useState('');
    const [selectedRole, setSelectedRole] = useState('');
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [userToDelete, setUserToDelete] = useState<{ id: string; name: string } | null>(null);
    const [userModalOpen, setUserModalOpen] = useState(false);
    const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
    const [editingUserId, setEditingUserId] = useState<string | null>(null);
    const [viewModalOpen, setViewModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<TaskUser | null>(null);

    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm<UserFormData>(
        defaultUserFormData
    );

    const paginationMeta = users.meta ?? {
        from: users.from,
        to: users.to,
        total: users.total,
    };

    const paginationLinks = Array.isArray(users.links)
        ? {
              prev: users.prevPageUrl ?? users.prev_page_url ?? null,
              next: users.nextPageUrl ?? users.next_page_url ?? null,
          }
        : users.links;

    const formatJoinedDate = (createdAt?: string) => {
        if (!createdAt) {
            return 'N/A';
        }

        const date = new Date(createdAt);

        return Number.isNaN(date.getTime()) ? 'N/A' : date.toLocaleDateString();
    };

    const handleSearch = (event: React.FormEvent) => {
        event.preventDefault();
        router.get(
            usersIndexRoute(),
            { search, role: selectedRole },
            { preserveState: true }
        );
    };

    const handleDeleteClick = (userId: string, userName: string) => {
        setUserToDelete({ id: userId, name: userName });
        setDeleteDialogOpen(true);
    };

    const closeUserModal = () => {
        setUserModalOpen(false);
        setFormMode('create');
        setEditingUserId(null);
        clearErrors();
        reset();
    };

    const openCreateModal = () => {
        setFormMode('create');
        setEditingUserId(null);
        clearErrors();
        reset();
        setUserModalOpen(true);
    };

    const openEditModal = (user: TaskUser) => {
        const clientData = (user.clients?.[0] ?? null) as (Client & { company_name?: string }) | null;

        setFormMode('edit');
        setEditingUserId(user.id);
        clearErrors();
        setData({
            name: user.name,
            email: user.email,
            password: '',
            password_confirmation: '',
            role: user.role,
            company_name: clientData?.company_name ?? clientData?.companyName ?? '',
            phone: clientData?.phone ?? '',
            address: clientData?.address ?? '',
        });
        setUserModalOpen(true);
    };

    const openViewModal = (user: TaskUser) => {
        setSelectedUser(user);
        setViewModalOpen(true);
    };

    const closeViewModal = () => {
        setViewModalOpen(false);
        setSelectedUser(null);
    };

    const handleUserSubmit = (event: FormEvent) => {
        event.preventDefault();

        if (formMode === 'create') {
            post(usersStore().url, {
                preserveScroll: true,
                onSuccess: () => {
                    closeUserModal();
                },
            });

            return;
        }

        if (!editingUserId) {
            return;
        }

        put(usersUpdate(editingUserId).url, {
            preserveScroll: true,
            onSuccess: () => {
                closeUserModal();
            },
        });
    };

    const confirmDelete = () => {
        if (userToDelete) {
            router.delete(usersDestroy(userToDelete.id));
            setDeleteDialogOpen(false);
            setUserToDelete(null);
        }
    };

    const getRoleBadge = (role: string) => {
        const roleConfig = {
            admin: 'bg-purple-100 text-purple-800 border-purple-200',
            employee: 'bg-blue-100 text-blue-800 border-blue-200',
            client: 'bg-green-100 text-green-800 border-green-200',
        };

        return (
            <span
                className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium capitalize ${
                    roleConfig[role as keyof typeof roleConfig]
                }`}
            >
                {role}
            </span>
        );
    };

    const selectedUserClient = (selectedUser?.clients?.[0] ?? null) as
        | (Client & { company_name?: string })
        | null;

    const filterRoleOptions: ReactSelectOption<string>[] = [
        { value: '', label: 'All Roles' },
        { value: 'admin', label: 'Admin' },
        { value: 'employee', label: 'Employee' },
        { value: 'client', label: 'Client' },
    ];

    const formRoleOptions: ReactSelectOption<UserRole>[] = [
        { value: 'employee', label: 'Employee' },
        { value: 'client', label: 'Client' },
    ];

    return (
        <AppLayout>
            <Head title="Users" />

            {/* Header with Actions */}
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Users</h1>
                    <p className="mt-1 text-sm text-gray-500">
                        Manage employees and clients
                    </p>
                </div>
                <Button onClick={openCreateModal} className="cursor-pointer bg-blue-600 hover:bg-blue-700">
                    <Plus className="mr-2 h-4 w-4" />
                    Add User
                </Button>
            </div>

            {/* Filters */}
            <div className="mb-6 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <form onSubmit={handleSearch} className="flex flex-col gap-4 sm:flex-row">
                    <div className="flex-1">
                        <Input
                            type="text"
                            placeholder="Search by name or email..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full"
                        />
                    </div>
                    <ReactSelectField<string>
                        id="users-role-filter"
                        value={selectedRole}
                        options={filterRoleOptions}
                        onChange={(role) => setSelectedRole(role)}
                        isClearable={false}
                        className="min-w-44 border rounded-4xl"
                    />
                    <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                        <Search className="mr-2 h-4 w-4" />
                        Search
                    </Button>
                </form>
            </div>

            {/* Users Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                    User
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                    Email
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                    Role
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                    Joined
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 bg-white">
                            {users.data.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                                        No users found
                                    </td>
                                </tr>
                            ) : (
                                users.data.map((user) => (
                                    (() => {
                                        const userWithTimestamps = user as typeof user & { created_at?: string };

                                        return (
                                    <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-white font-medium">
                                                    {user.name.charAt(0).toUpperCase()}
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {user.name}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {user.email}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {getRoleBadge(user.role)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {formatJoinedDate(user.createdAt ?? userWithTimestamps.created_at)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => openViewModal(user)}
                                                    className="text-blue-600 hover:text-blue-900"
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </button>
                                                <button
                                                    onClick={() => openEditModal(user)}
                                                    className="text-gray-600 hover:text-gray-900"
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteClick(user.id, user.name)}
                                                    className="text-red-600 hover:text-red-900"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                        );
                                    })()
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {users.data.length > 0 && (
                    <div className="border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
                        <div className="flex items-center justify-between">
                            <div className="text-sm text-gray-700">
                                Showing <span className="font-medium">{paginationMeta.from ?? 1}</span> to{' '}
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
                onClose={closeViewModal}
                title={selectedUser ? ` ${selectedUser.name}` : 'User Details'}
                description="View user information"
                maxWidthClassName="max-w-xl"
            >
                {selectedUser && (
                    <div className="space-y-5">
                        <div className="flex items-center gap-4">
                            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 text-xl font-semibold text-white">
                                {selectedUser.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <p className="text-lg font-semibold text-gray-900">{selectedUser.name}</p>
                                <div className="mt-1">{getRoleBadge(selectedUser.role)}</div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-4 rounded-lg border border-gray-200 p-4 sm:grid-cols-2">
                            <div>
                                <p className="text-xs uppercase tracking-wide text-gray-500">Email</p>
                                <p className="mt-1 text-sm text-gray-900">{selectedUser.email}</p>
                            </div>
                            <div>
                                <p className="text-xs uppercase tracking-wide text-gray-500">Joined</p>
                                <p className="mt-1 text-sm text-gray-900">
                                    {formatJoinedDate(selectedUser.createdAt ?? selectedUser.created_at)}
                                </p>
                            </div>
                            {selectedUser.role === 'client' && (
                                <>
                                    <div>
                                        <p className="text-xs uppercase tracking-wide text-gray-500">Company</p>
                                        <p className="mt-1 text-sm text-gray-900">
                                            {selectedUserClient?.company_name ??
                                                selectedUserClient?.companyName ??
                                                'N/A'}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs uppercase tracking-wide text-gray-500">Phone</p>
                                        <p className="mt-1 text-sm text-gray-900">{selectedUserClient?.phone ?? 'N/A'}</p>
                                    </div>
                                    <div className="sm:col-span-2">
                                        <p className="text-xs uppercase tracking-wide text-gray-500">Address</p>
                                        <p className="mt-1 text-sm text-gray-900">{selectedUserClient?.address ?? 'N/A'}</p>
                                    </div>
                                </>
                            )}
                        </div>

                        <div className="flex justify-end border-t border-gray-200 pt-4">
                            <Button type="button" onClick={closeViewModal} variant="outline">
                                Close
                            </Button>
                        </div>
                    </div>
                )}
            </Modal>

            <Modal
                isOpen={userModalOpen}
                onClose={closeUserModal}
                title={formMode === 'create' ? 'Create New User' : 'Edit User'}
                description={
                    formMode === 'create'
                        ? 'Add a new employee or client to the system'
                        : 'Update user information'
                }
                maxWidthClassName="max-w-3xl"
            >
                <form onSubmit={handleUserSubmit} className="space-y-6">
                
                    <div>
                        <h3 className="mb-4 text-md font-medium text-gray-900">Basic Information</h3>
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                            <div className="sm:col-span-2">
                                <Label htmlFor="name" required>
                                    Full Name
                                </Label>
                                <Input
                                    id="name"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    placeholder="John Doe"
                                    className="mt-1"
                                />
                                <InputError message={errors.name} className="mt-2" />
                            </div>

                            <div className="sm:col-span-2">
                                <Label htmlFor="email" required>
                                    Email Address
                                </Label>
                                <Input
                                    id="email"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    placeholder="john@company.com"
                                    className="mt-1"
                                />
                                <InputError message={errors.email} className="mt-2" />
                            </div>

                            <div className="sm:col-span-2">
                                <Label htmlFor="role" required>
                                    Role
                                </Label>
                                <ReactSelectField<UserRole>
                                    id="role"
                                    value={data.role}
                                    options={formRoleOptions}
                                    onChange={(role) => setData('role', role)}
                                    isClearable={false}
                                    className="mt-1"
                                />
                                <InputError message={errors.role} className="mt-2" />
                            </div>

                            <div>
                                <Label htmlFor="password" required={formMode === 'create'}>
                                    {formMode === 'create' ? 'Password' : 'New Password'}
                                </Label>
                                <Input
                                    id="password"
                                    type="password"
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                    placeholder={formMode === 'create' ? 'Min. 8 characters' : 'Leave blank to keep current'}
                                    className="mt-1"
                                />
                                <InputError message={errors.password} className="mt-2" />
                            </div>

                            <div>
                                <Label htmlFor="password_confirmation" required={formMode === 'create'}>
                                    {formMode === 'create' ? 'Confirm Password' : 'Confirm New Password'}
                                </Label>
                                <Input
                                    id="password_confirmation"
                                    type="password"
                                    value={data.password_confirmation}
                                    onChange={(e) => setData('password_confirmation', e.target.value)}
                                    placeholder={formMode === 'create' ? 'Confirm password' : 'Confirm new password'}
                                    className="mt-1"
                                />
                                <InputError message={errors.password_confirmation} className="mt-2" />
                            </div>
                        </div>
                    </div>

                    {data.role === 'client' && (
                        <div className="border-t border-gray-200 pt-6">
                            <h3 className="mb-4 text-md font-medium text-gray-900">Client Information</h3>
                            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                <div className="sm:col-span-2">
                                    <Label htmlFor="company_name" required>
                                        Company Name
                                    </Label>
                                    <Input
                                        id="company_name"
                                        value={data.company_name}
                                        onChange={(e) => setData('company_name', e.target.value)}
                                        placeholder="Acme Corporation"
                                        className="mt-1"
                                        required={data.role === 'client'}
                                    />
                                    <InputError message={errors.company_name} className="mt-2" />
                                </div>

                                <div>
                                    <Label htmlFor="phone" required>
                                        Phone Number
                                    </Label>
                                    <Input
                                        id="phone"
                                        value={data.phone}
                                        onChange={(e) => setData('phone', e.target.value)}
                                        placeholder="+1 (555) 123-4567"
                                        className="mt-1"
                                        required={data.role === 'client'}
                                    />
                                    <InputError message={errors.phone} className="mt-2" />
                                </div>

                                <div className="sm:col-span-2">
                                    <Label htmlFor="address">Address</Label>
                                    <Description
                                        id="address"
                                        value={data.address}
                                        onChange={(e) => setData('address', e.target.value)}
                                        rows={3}
                                        placeholder="123 Main St, City, State, ZIP"
                                    />
                                    <InputError message={errors.address} className="mt-2" />
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="flex items-center justify-end gap-3 border-t border-gray-200 pt-6">
                        <Button type="button" variant="outline" onClick={closeUserModal}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={processing} className="bg-blue-600 hover:bg-blue-700">
                            {processing
                                ? formMode === 'create'
                                    ? 'Creating...'
                                    : 'Updating...'
                                : formMode === 'create'
                                  ? 'Create User'
                                  : 'Update User'}
                        </Button>
                    </div>
                </form>
            </Modal>

            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <DialogContent className="sm:max-w-100">
                    <DialogHeader>
                        <DialogTitle className="text-red-600">Delete User</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete <span className="font-semibold text-gray-900">{userToDelete?.name}</span>? This action cannot be undone.
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