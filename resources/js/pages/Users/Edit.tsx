import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import type { FormEventHandler } from 'react';
import InputError from '@/components/input-error';
import ReactSelectField, { type ReactSelectOption } from '@/components/react-select-field';
import { Button } from '@/components/ui/button';
import Description from '@/components/ui/Description';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/AppLayout';
import { index as usersIndex, update as usersUpdate } from '@/routes/users';
import type { Client, PageProps, TaskUser } from '@/types';

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
    const resolvedClient = client ?? user.clients?.[0];

    const { data, setData, put, processing, errors } = useForm<FormData>({
        name: user.name ?? '',
        email: user.email ?? '',
        password: '',
        password_confirmation: '',
        role: user.role ?? 'employee',
        company_name: resolvedClient?.company_name ?? resolvedClient?.companyName ?? '',
        phone: resolvedClient?.phone ?? '',
        address: resolvedClient?.address ?? '',
    });

    const roleOptions: ReactSelectOption<FormData['role']>[] = [
        { value: 'employee', label: 'Employee' },
        { value: 'client', label: 'Client' },
        { value: 'admin', label: 'Admin' },
    ];

    const handleSubmit: FormEventHandler = (event) => {
        event.preventDefault();

        put(usersUpdate(user.id).url);
    };

    return (
        <AppLayout header="Edit User">
            <Head title="Edit User" />

            <div className="mb-6">
                <Link
                    href={usersIndex()}
                    className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900"
                >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Users
                </Link>
            </div>

            <div className="mx-auto max-w-3xl">
                <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                    <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
                        <h2 className="text-lg font-semibold text-gray-900">Edit User</h2>
                        <p className="mt-1 text-sm text-gray-500">
                            Update user information
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6 p-6">
                        <div>
                            <h3 className="mb-4 text-md font-medium text-gray-900">
                                Basic Information
                            </h3>

                            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                <div className="sm:col-span-2">
                                    <Label htmlFor="name" required>
                                        Full Name
                                    </Label>
                                    <Input
                                        id="name"
                                        type="text"
                                        autoComplete="name"
                                        value={data.name}
                                        onChange={(event) =>
                                            setData('name', event.target.value.trimStart())
                                        }
                                        placeholder="Enter full name"
                                        className="mt-1"
                                        maxLength={100}
                                    />
                                    <InputError message={errors.name} className="mt-2" />
                                </div>

                                <div className="sm:col-span-2">
                                    <Label htmlFor="email" required>
                                        Email Address
                                    </Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        autoComplete="email"
                                        value={data.email}
                                        onChange={(event) =>
                                            setData('email', event.target.value.trimStart())
                                        }
                                        placeholder="Enter email address"
                                        className="mt-1"
                                        maxLength={255}
                                    />
                                    <InputError message={errors.email} className="mt-2" />
                                </div>

                                <div className="sm:col-span-2">
                                    <Label htmlFor="role" required>
                                        Role
                                    </Label>
                                    <ReactSelectField<FormData['role']>
                                        id="role"
                                        value={data.role}
                                        options={roleOptions}
                                        onChange={(role) => setData('role', role)}
                                        isClearable={false}
                                        className="mt-1"
                                    />
                                    <InputError message={errors.role} className="mt-2" />
                                </div>

                                <div>
                                    <Label htmlFor="password">New Password</Label>
                                    <Input
                                        id="password"
                                        type="password"
                                        autoComplete="new-password"
                                        value={data.password}
                                        onChange={(event) =>
                                            setData('password', event.target.value)
                                        }
                                        placeholder="Leave blank to keep current"
                                        className="mt-1"
                                    />
                                    <InputError message={errors.password} className="mt-2" />
                                </div>

                                <div>
                                    <Label htmlFor="password_confirmation">
                                        Confirm New Password
                                    </Label>
                                    <Input
                                        id="password_confirmation"
                                        type="password"
                                        autoComplete="new-password"
                                        value={data.password_confirmation}
                                        onChange={(event) =>
                                            setData(
                                                'password_confirmation',
                                                event.target.value,
                                            )
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

                        {data.role === 'client' && (
                            <div className="border-t border-gray-200 pt-6">
                                <h3 className="mb-4 text-md font-medium text-gray-900">
                                    Client Information
                                </h3>

                                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                    <div className="sm:col-span-2">
                                        <Label htmlFor="company_name" required>
                                            Company Name
                                        </Label>
                                        <Input
                                            id="company_name"
                                            type="text"
                                            autoComplete="organization"
                                            value={data.company_name}
                                            onChange={(event) =>
                                                setData(
                                                    'company_name',
                                                    event.target.value.trimStart(),
                                                )
                                            }
                                            placeholder="Enter company name"
                                            className="mt-1"
                                            maxLength={150}
                                        />
                                        <InputError
                                            message={errors.company_name}
                                            className="mt-2"
                                        />
                                    </div>

                                    <div>
                                        <Label htmlFor="phone">Phone Number</Label>
                                        <Input
                                            id="phone"
                                            type="tel"
                                            autoComplete="tel"
                                            value={data.phone}
                                            onChange={(event) =>
                                                setData('phone', event.target.value.trimStart())
                                            }
                                            placeholder="Enter phone number"
                                            className="mt-1"
                                            maxLength={20}
                                        />
                                        <InputError message={errors.phone} className="mt-2" />
                                    </div>

                                    <div className="sm:col-span-2">
                                        <Label htmlFor="address">Address</Label>
                                        <Description
                                            id="address"
                                            value={data.address}
                                            onChange={(event) =>
                                                setData('address', event.target.value.trimStart())
                                            }
                                            rows={3}
                                            placeholder="Enter address"
                                        />
                                        <InputError message={errors.address} className="mt-2" />
                                    </div>
                                </div>
                            </div>
                        )}

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
