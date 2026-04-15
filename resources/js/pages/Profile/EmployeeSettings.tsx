import { Head, useForm, usePage } from '@inertiajs/react';
import type { FormEventHandler } from 'react';
import { useState } from 'react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Modal from '@/components/ui/Modal';
import AppLayout from '@/layouts/AppLayout';
import { update as profileUpdate } from '@/routes/profile';
import type { PageProps } from '@/types';

export default function EmployeeSettings() {
    const { auth } = usePage<PageProps>().props;
    const [isModalOpen, setIsModalOpen] = useState(true);

    const { data, setData, patch, processing, errors, recentlySuccessful } = useForm({
        name: auth.user.name,
        email: auth.user.email,
    });

    const submit: FormEventHandler = (event) => {
        event.preventDefault();
        patch(profileUpdate.url(), {
            preserveScroll: true,
        });
    };

    return (
        <AppLayout header="Profile Settings">
            <Head title="Profile Settings" />

            <div className="mx-auto max-w-3xl">
                <div className="mb-6 flex items-center justify-between gap-3">
                    <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
                    <Button type="button" variant="outline" onClick={() => setIsModalOpen(true)}>
                        Open Profile Settings
                    </Button>
                </div>
                <p className="mt-1 text-sm text-gray-500">
                    Update your personal account details.
                </p>
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Profile Settings"
                description="Update your personal account details"
                maxWidthClassName="max-w-2xl"
            >
                    <form onSubmit={submit} className="space-y-6">
                        <div className="grid gap-2">
                            <Label htmlFor="name">Name</Label>
                            <Input
                                id="name"
                                name="name"
                                value={data.name}
                                onChange={(event) => setData('name', event.target.value)}
                                required
                                autoComplete="name"
                            />
                            <InputError message={errors.name} className="mt-1" />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                name="email"
                                value={data.email}
                                onChange={(event) => setData('email', event.target.value)}
                                required
                                autoComplete="email"
                            />
                            <InputError message={errors.email} className="mt-1" />
                        </div>

                        <div className="flex items-center gap-3">
                            <Button type="submit" disabled={processing} className="bg-blue-600 hover:bg-blue-700">
                                {processing ? 'Saving...' : 'Save Changes'}
                            </Button>
                            {recentlySuccessful && (
                                <span className="text-sm text-green-600">Profile updated successfully.</span>
                            )}
                        </div>
                    </form>
            </Modal>
        </AppLayout>
    );
}