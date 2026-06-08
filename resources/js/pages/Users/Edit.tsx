import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import type { FormEventHandler} from 'react';
import { useState } from 'react';
import InputError from '@/components/input-error';
import ReactSelectField, { type ReactSelectOption } from '@/components/react-select-field';
import { Button } from '@/components/ui/button';
import Description from '@/components/ui/Description';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/AppLayout';
import { index as usersIndex, update as usersUpdate } from '@/routes/users';
import type { PageProps, TaskUser, Client } from '@/types';

interface EditProps extends PageProps {
    user: TaskUser;
    client?: Client;
}

interface FormData {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
    role: 'admin' | 'employee' | 'client';
    company_name: string;
    phone: string;
    address: string;
}

export default function Edit({ user, client }: EditProps) {
    const [selectedRole, setSelectedRole] = useState<'admin' | 'employee' | 'client'>(user.role);
    const resolvedClient = client ?? user.clients?.[0];
    const resolvedClientData = resolvedClient as
        | (Client & { company_name?: string; user_id?: string; created_at?: string; updated_at?: string })
        | undefined;
    
    const { data, setData, put, processing, errors } = useForm<FormData>({
        name: user.name || '',
        email: user.email || '',
        password: '',
        password_confirmation: '',
        role: user.role || 'employee',
        company_name: resolvedClientData?.company_name ?? resolvedClientData?.companyName ?? '',
        phone: resolvedClientData?.phone ?? '',
        address: resolvedClientData?.address ?? '',
    });

    const handleSubmit: FormEventHandler = (event) => {
        event.preventDefault();
        put(usersUpdate(user.id).url);
    };

    const handleRoleChange = (role: 'admin' | 'employee' | 'client') => {
        setSelectedRole(role);
        setData('role', role);
    };

    const roleOptions: ReactSelectOption<FormData['role']>[] = [
        { value: 'employee', label: 'Employee' },
        { value: 'client', label: 'Client' },
        { value: 'admin', label: 'Admin' },
    ];

    return (
        <AppLayout header="Edit User">
            <Head title="Edit User" />

            {/* Back Button */}
            <div className="mb-6">
                <Link
                    href={usersIndex()}
                    className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900"
                >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Users
                </Link>
            </div>

            {/* Form Card */}
            <div className="mx-auto max-w-3xl">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
                        <h2 className="text-lg font-semibold text-gray-900">Edit User</h2>
                        <p className="mt-1 text-sm text-gray-500">
                            Update user informationn
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="p-6 space-y-6">
                        {/* Basic Information */}
                        <div>
                            <h3 className="text-md font-medium text-gray-900 mb-4">
                                Basic Information
                            </h3>
                            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                {/* Name */}
                                <div className="sm:col-span-2">
                                    <Label htmlFor="name" required>Full Name</Label>
                                    <Input
                                        id="name"
                                        // type="text"
                                        value={data.name}
                                        onChange={(e) => setData('name' as keyof FormData, e.target.value)}
                                        className="mt-1"
                                        // required
                                    />
                                    <InputError message={errors.name} className="mt-2" />
                                </div>

                                {/* Email */}
                                <div className="sm:col-span-2">
                                    <Label htmlFor="email" required>Email Address</Label>
                                    <Input
                                        id="email"
                                        // type="email"
                                        value={data.email}
                                        onChange={(e) => setData('email' as keyof FormData, e.target.value)}
                                        className="mt-1"
                                        // required
                                    />
                                    <InputError message={errors.email} className="mt-2" />
                                </div>

                                {/* Role */}
                                <div className="sm:col-span-2">
                                    <Label htmlFor="role" required>Role</Label>
                                    <ReactSelectField<FormData['role']>
                                        id="role"
                                        value={data.role}
                                        options={roleOptions}
                                        onChange={handleRoleChange}
                                        isClearable={false}
                                        className="mt-1"
                                    />
                                    <InputError message={errors.role} className="mt-2" />
                                </div>

                                {/* Password */}
                                <div>
                                    <Label htmlFor="password">New Password</Label>
                                    <Input
                                        id="password"
                                        // type="password"
                                        value={data.password}
                                        onChange={(e) => setData('password' as keyof FormData, e.target.value)}
                                        placeholder="Leave blank to keep current"
                                        className="mt-1"
                                    />
                                    <InputError message={errors.password} className="mt-2" />
                                </div>

                                {/* Confirm Password */}
                                <div>
                                    <Label htmlFor="password_confirmation">
                                        Confirm New Password
                                    </Label>
                                    <Input
                                        id="password_confirmation"
                                        // type="password"
                                        value={data.password_confirmation}
                                        onChange={(e) =>
                                            setData('password_confirmation' as keyof FormData, e.target.value)
                                        }
                                        placeholder="Confirm new password"
                                        className="mt-1"
                                    />
                                    <InputError
                                        message={errors.password_confirmation}
                                        className="mt-2"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Client Information */}
                        {selectedRole === 'client' && (
                            <div className="border-t border-gray-200 pt-6">
                                <h3 className="text-md font-medium text-gray-900 mb-4">
                                    Client Information
                                </h3>
                                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                    {/* Company Name */}
                                    <div className="sm:col-span-2">
                                        <Label htmlFor="company_name"required >Company Name</Label>
                                        <Input
                                            id="company_name"
                                            // type="text"
                                            value={data.company_name}
                                            onChange={(e) =>
                                                setData('company_name' as keyof FormData, e.target.value)
                                            }
                                            className="mt-1"
                                        />
                                        <InputError
                                            message={errors.company_name}
                                            className="mt-2"
                                        />
                                    </div>

                                    {/* Phone */}
                                    <div>
                                        <Label htmlFor="phone">Phone Number</Label>
                                        <Input
                                            id="phone"
                                            // type="tel"
                                            value={data.phone}
                                            onChange={(e) => setData('phone' as keyof FormData, e.target.value)}
                                            className="mt-1"
                                        />
                                        <InputError message={errors.phone} className="mt-2" />
                                    </div>

                                    {/* Address */}
                                    <div className="sm:col-span-2">
                                        <Label htmlFor="address">Address</Label>
                                        <Description
                                            id="address"
                                            value={data.address}
                                            onChange={(e) => setData('address' as keyof FormData, e.target.value)}
                                            rows={3}
                                        />
                                        <InputError message={errors.address} className="mt-2" />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Form Actions */}
                        <div className="flex items-center justify-end gap-3 border-t border-gray-200 pt-6">
                            <Link href={usersIndex()}>
                                <Button type="button" variant="outline">
                                    Cancel
                                </Button>
                            </Link>
                            <Button
                                type="submit"
                                disabled={processing}
                                className="bg-blue-600 hover:bg-blue-700"
                            >
                                {processing ? 'Updating...' : 'Update User'}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}
