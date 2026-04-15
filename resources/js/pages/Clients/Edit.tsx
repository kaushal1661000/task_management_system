import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import type { FormEventHandler } from 'react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import Description from '@/components/ui/Description';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/AppLayout';
import { index as clientsIndex, update as clientsUpdate } from '@/routes/clients';
import type { PageProps, Client } from '@/types';

interface EditProps extends PageProps {
    client: Client;
}

export default function Edit({ client }: EditProps) {
    const normalizedClient = client as Client & {
        company_name?: string;
    };

    const { data, setData, put, processing, errors } = useForm({
        name: client.user?.name || '',
        email: client.user?.email || '',
        company_name: client.companyName || normalizedClient.company_name || '',
        phone: client.phone || '',
        address: client.address || '',
    });

    const handleSubmit: FormEventHandler = (event) => {
        event.preventDefault();
        put(clientsUpdate(client.id).url);
    };

    return (
        <AppLayout header="Edit Client">
            <Head title="Edit Client" />

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
                        <h2 className="text-lg font-semibold text-gray-900">Edit Client</h2>
                        <p className="mt-1 text-sm text-gray-500">
                            Update client and company information
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="p-6 space-y-6">
                        {/* Contact Information */}
                        <div>
                            <h3 className="text-md font-medium text-gray-900 mb-4">
                                Contact Information
                            </h3>
                            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                {/* Contact Name */}
                                <div className="sm:col-span-2">
                                    <Label htmlFor="name" required>Contact Name</Label>
                                    <Input
                                        id="name"
                                        type="text"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        className="mt-1"
                                        
                                    />
                                    <InputError message={errors.name} className="mt-2" />
                                </div>

                                {/* Email */}
                                <div className="sm:col-span-2">
                                    <Label htmlFor="email"required>Email Address</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                        className="mt-1"
                                        
                                    />
                                    <InputError message={errors.email} className="mt-2" />
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
                                <div className="sm:col-span-2">
                                    <Label htmlFor="company_name" required>
                                        Company Name
                                    </Label>
                                    <Input
                                        id="company_name"
                                        type="text"
                                        value={data.company_name}
                                        onChange={(e) =>
                                            setData('company_name', e.target.value)
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
                                    <Label htmlFor="phone" required>Phone Number</Label>
                                    <Input
                                        id="phone"
                                        type="tel"
                                        value={data.phone}
                                        onChange={(e) => setData('phone', e.target.value)}
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
                                        onChange={(e) => setData('address', e.target.value)}
                                        rows={3}
                                    />
                                    <InputError message={errors.address} className="mt-2" />
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
                                {processing ? 'Updating...' : 'Update Client'}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}