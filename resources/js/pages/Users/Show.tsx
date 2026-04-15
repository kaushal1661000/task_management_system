import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Edit, Mail, Calendar, Briefcase, FolderKanban, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/AppLayout';
import { edit as usersEdit, index as usersIndex } from '@/routes/users';
import type { PageProps, TaskUser } from '@/types';

interface UserStats {
    totalTasks?: number;
    completedTasks?: number;
    totalProjects?: number;
    activeProjects?: number;
}

interface ShowProps extends PageProps {
    user: TaskUser;
    stats: UserStats;
}

export default function Show({ user, stats }: ShowProps) {
    const joinedAt = user.createdAt ?? user.created_at;

    return (
        <AppLayout header="User Details">
            <Head title={`User: ${user.name}`} />

            <div className="mb-6 flex items-center justify-between">
                <Link
                    href={usersIndex()}
                    className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900"
                >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Users
                </Link>
                <Link href={usersEdit(user.id)}>
                    <Button className="bg-blue-600 hover:bg-blue-700">
                        <Edit className="mr-2 h-4 w-4" />
                        Edit User
                    </Button>
                </Link>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                <div className="lg:col-span-1">
                    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                        <div className="mb-6 flex items-center justify-center">
                            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-blue-600 text-2xl font-semibold text-white">
                                {user.name.charAt(0).toUpperCase()}
                            </div>
                        </div>

                        <div className="mb-6 text-center">
                            <h2 className="text-xl font-bold text-gray-900">{user.name}</h2>
                            <p className="mt-1 text-sm capitalize text-gray-500">{user.role}</p>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <p className="mb-1 text-xs font-medium uppercase tracking-wide text-gray-500">
                                    Email
                                </p>
                                <div className="flex items-center text-sm text-gray-900">
                                    <Mail className="mr-2 h-4 w-4 text-gray-400" />
                                    {user.email}
                                </div>
                            </div>

                            <div>
                                <p className="mb-1 text-xs font-medium uppercase tracking-wide text-gray-500">
                                    Joined
                                </p>
                                <div className="flex items-center text-sm text-gray-900">
                                    <Calendar className="mr-2 h-4 w-4 text-gray-400" />
                                    {joinedAt
                                        ? new Date(joinedAt).toLocaleDateString('en-US', {
                                              year: 'numeric',
                                              month: 'long',
                                              day: 'numeric',
                                          })
                                        : 'N/A'}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-2">
                    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                        <h3 className="mb-6 text-lg font-semibold text-gray-900">Performance Overview</h3>

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div className="rounded-lg border border-gray-200 p-4">
                                <div className="flex items-center gap-2 text-sm text-gray-500">
                                    <Briefcase className="h-4 w-4" />
                                    Total Projects
                                </div>
                                <p className="mt-2 text-2xl font-semibold text-gray-900">
                                    {stats.totalProjects ?? 0}
                                </p>
                            </div>

                            <div className="rounded-lg border border-gray-200 p-4">
                                <div className="flex items-center gap-2 text-sm text-gray-500">
                                    <FolderKanban className="h-4 w-4" />
                                    Total Tasks
                                </div>
                                <p className="mt-2 text-2xl font-semibold text-gray-900">
                                    {stats.totalTasks ?? 0}
                                </p>
                            </div>

                            <div className="rounded-lg border border-gray-200 p-4">
                                <div className="flex items-center gap-2 text-sm text-gray-500">
                                    <CheckCircle2 className="h-4 w-4" />
                                    Completed Tasks
                                </div>
                                <p className="mt-2 text-2xl font-semibold text-gray-900">
                                    {stats.completedTasks ?? 0}
                                </p>
                            </div>

                            <div className="rounded-lg border border-gray-200 p-4">
                                <div className="flex items-center gap-2 text-sm text-gray-500">
                                    <Briefcase className="h-4 w-4" />
                                    Active Projects
                                </div>
                                <p className="mt-2 text-2xl font-semibold text-gray-900">
                                    {stats.activeProjects ?? 0}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
