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
import { index as usersIndex, store as usersStore } from '@/routes/users';

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

export default function Create() {
    const { data, setData, post, processing, errors, reset } = useForm<FormData>({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        role: 'employee',
        company_name: '',
        phone: '',
        address: '',
    });

    const handleSubmit: FormEventHandler = (event) => {
        event.preventDefault();

        post(usersStore().url, {
            onSuccess: () => reset('password', 'password_confirmation'),
        });
    };

    const handleRoleChange = (role: FormData['role']) => {
        setData('role', role);
    };

    const roleOptions: ReactSelectOption<FormData['role']>[] = [
        { value: 'employee', label: 'Employee' },
        { value: 'client', label: 'Client' },
    ];

    return (
        <AppLayout header="Create User">
            <Head title="Create User" />

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
                        <h2 className="text-lg font-semibold text-gray-900">
                            Create New User
                        </h2>
                        <p className="mt-1 text-sm text-gray-500">
                            Add a new employee or client
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6 p-6">
                        {Object.keys(errors).length > 0 && (
                            <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                                <p className="text-sm font-medium text-red-700">
                                    Please fix the following errors before submitting:
                                </p>
                                <ul className="mt-2 list-disc pl-5 text-sm text-red-600">
                                    {Object.values(errors).map((error, index) => (
                                        <li key={`${error}-${index}`}>{error}</li>
                                    ))}
                                </ul>
                            </div>
                        )}

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
                                        onChange={(e) =>
                                            setData('name', e.target.value.trimStart())
                                        }
                                        placeholder="John Doe"
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
                                        onChange={(e) =>
                                            setData(
                                                'email',
                                                e.target.value.trim().toLowerCase(),
                                            )
                                        }
                                        placeholder="john@company.com"
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
                                        onChange={handleRoleChange}
                                        isClearable={false}
                                        className="mt-1"
                                    />
                                    <InputError message={errors.role} className="mt-2" />
                                </div>

                                <div>
                                    <Label htmlFor="password" required>
                                        Password
                                    </Label>
                                    <Input
                                        id="password"
                                        type="password"
                                        autoComplete="new-password"
                                        value={data.password}
                                        onChange={(e) =>
                                            setData('password', e.target.value)
                                        }
                                        placeholder="Min. 8 characters"
                                        className="mt-1"
                                        minLength={8}
                                    />
                                    <InputError
                                        message={errors.password}
                                        className="mt-2"
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="password_confirmation" required>
                                        Confirm Password
                                    </Label>
                                    <Input
                                        id="password_confirmation"
                                        type="password"
                                        autoComplete="new-password"
                                        value={data.password_confirmation}
                                        onChange={(e) =>
                                            setData(
                                                'password_confirmation',
                                                e.target.value,
                                            )
                                        }
                                        placeholder="Confirm password"
                                        className="mt-1"
                                        minLength={8}
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
                                    Client Info
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
                                            onChange={(e) =>
                                                setData(
                                                    'company_name',
                                                    e.target.value.trimStart(),
                                                )
                                            }
                                            placeholder="Acme Corporation"
                                            className="mt-1"
                                            required={data.role === 'client'}
                                            maxLength={150}
                                        />
                                        <InputError
                                            message={errors.company_name}
                                            className="mt-2"
                                        />
                                    </div>

                                    <div>
                                        <Label htmlFor="phone" required>
                                            Phone Number
                                        </Label>
                                        <Input
                                            id="phone"
                                            type="tel"
                                            autoComplete="tel"
                                            value={data.phone}
                                            onChange={(e) =>
                                                setData(
                                                    'phone',
                                                    e.target.value.replace(
                                                        /[^\d+\-\s()]/g,
                                                        '',
                                                    ),
                                                )
                                            }
                                            placeholder="+1 (555) 123-4567"
                                            className="mt-1"
                                            required={data.role === 'client'}
                                        />
                                        <InputError
                                            message={errors.phone}
                                            className="mt-2"
                                        />
                                    </div>

                                    <div className="sm:col-span-2">
                                        <Label htmlFor="address">Address</Label>
                                        <Description
                                            id="address"
                                            value={data.address}
                                            onChange={(e) =>
                                                setData('address', e.target.value)
                                            }
                                            rows={3}
                                            placeholder="123 Main St, City, State, ZIP"
                                        />
                                        <InputError
                                            message={errors.address}
                                            className="mt-2"
                                        />
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
                                {processing ? 'Creating...' : 'Create User'}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}
