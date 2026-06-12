import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import type { FormEventHandler } from 'react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import Description from '@/components/ui/Description';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/AppLayout';
import { index as clientsIndex, store as clientsStore } from '@/routes/clients';

export default function Create() {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        company_name: '',
        phone: '',
        address: '',
    });

    const handleSubmit: FormEventHandler = (event) => {
        event.preventDefault();
        post(clientsStore().url, {
            onSuccess: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <AppLayout header="Create Client">
            <Head title="Create Client" />

            {/* Back Button */}
            <div className="mb-6">
                <Link
                    href={clientsIndex()}
                    className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900"
                >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Clients
                </Link>
            </div>

            {/* Form Card */}
            <div className="mx-auto max-w-3xl">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
                        <h2 className="text-lg font-semibold text-gray-900">
                            Create New Client
                        </h2>
                        <p className="mt-1 text-sm text-gray-500">
                            Add a new client and their company informationn
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="p-6 space-y-6">
                        {/* User Account Information */}
                        <div>
                            <h3 className="text-md font-medium text-gray-900 mb-4">
                                Account Information
                            </h3>
                            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                {/* Contact Name */}
                                <div className="sm:col-span-2">
                                    <Label htmlFor="name" required>Contact Name</Label>
                                    <Input
                                        id="name"
                                        // type="text"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        placeholder="John Doe"
                                        className="mt-1"
                                        // required
                                    />
                                    <InputError message={errors.name} className="mt-2" />
                                </div>

                                {/* Email */}
                                <Input
                                    id="email"
                                    type="email"
                                    autoComplete="email"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value.trim().toLowerCase())}
                                    placeholder="john@company.com"
                                    className="mt-1"
                                />

                                <Input
                                    id="password"
                                    type="password"
                                    autoComplete="new-password"
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                    placeholder="Min. 8 characters"
                                    className="mt-1"
                                />

                                {/* Confirm Password */}
                                <div>
                                    <Label htmlFor="password_confirmation" required>
                                        Confirm Password
                                    </Label>
                                    <Input
                                        id="password_confirmation"
                                        type="password"
                                        value={data.password_confirmation}
                                        onChange={(e) =>
                                            setData('password_confirmation', e.target.value)
                                        }
                                        placeholder="Confirm password"
                                        className="mt-1"
                                        
                                    />
                                    <InputError
                                        message={errors.password_confirmation}
                                        className="mt-2"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Company Information */}
                        <div className="border-t border-gray-200 pt-6">
                            <h3 className="text-md font-medium text-gray-900 mb-4">
                                Company Information
                            </h3>
                            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                {/* Company Name */}
                               {/* Company Name */}
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
                                            setData('company_name', e.target.value.trimStart())
                                        }
                                        placeholder="Acme Corporation"
                                        className="mt-1"
                                    />
                                    <InputError
                                        message={errors.company_name}
                                        className="mt-2"
                                    />
                                </div>
                                
                                {/* Phone */}
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
                                            setData('phone', e.target.value.replace(/[^\d+\-\s()]/g, ''))
                                        }
                                        placeholder="+1 (555) 123-4567"
                                        className="mt-1"
                                    />
                                    <InputError
                                        message={errors.phone}
                                        className="mt-2"
                                    />
                                </div>
                                
                                {/* Address */}
                                <div className="sm:col-span-2">
                                    <Label htmlFor="address">
                                        Address
                                    </Label>
                                    <Description
                                        id="address"
                                        value={data.address}
                                        onChange={(e) =>
                                            setData('address', e.target.value)
                                        }
                                        rows={3}
                                        placeholder="123 Main Street, City, State, ZIP Code"
                                        autoComplete="street-address"
                                    />
                                    <InputError
                                        message={errors.address}
                                        className="mt-2"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Form Actions */}
                        <div className="flex items-center justify-end gap-3 border-t border-gray-200 pt-6">
                            <Link href={clientsIndex()}>
                                <Button type="button" variant="outline">
                                    Cancel
                                </Button>
                            </Link>
                            <Button
                                type="submit"
                                disabled={processing}
                                className="bg-blue-600 hover:bg-blue-700"
                            >
                                {processing ? 'Creating...' : 'Create Client'}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}
