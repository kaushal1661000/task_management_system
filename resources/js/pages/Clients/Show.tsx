import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Edit, Mail, Phone, MapPin, Building2, FolderKanban } from 'lucide-react';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/AppLayout';
import { edit as clientsEdit, index as clientsIndex } from '@/routes/clients';
import { show as projectsShow } from '@/routes/projects';
import type { PageProps, Client } from '@/types';

interface ShowProps extends PageProps {
    client: Client;
}

export default function Show({ client }: ShowProps) {
    const normalizedClient = client as Client & {
        company_name?: string;
        projects_count?: number;
        created_at?: string;
    };

    const companyName = client.companyName || normalizedClient.company_name || 'Details';
    const projectsCount = client.projectsCount ?? normalizedClient.projects_count ?? 0;
    const createdAt = client.createdAt || normalizedClient.created_at;
    const memberSince = createdAt
        ? new Date(createdAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
          })
        : 'N/A';

    return (
        <AppLayout header="Client Details">
            <Head title={`Client: ${companyName}`} />

            {/* Back Button */}
            <div className="mb-6 flex items-center justify-between">
                <Link
                    href={clientsIndex()}
                    className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900"
                >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Clients
                </Link>
                <Link href={clientsEdit(client.id)}>
                    <Button className="bg-blue-600 hover:bg-blue-700">
                        <Edit className="mr-2 h-4 w-4" />
                        Edit Client
                    </Button>
                </Link>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                {/* Client Information Card */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center justify-center mb-6">
                            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
                                <Building2 className="h-10 w-10 text-green-600" />
                            </div>
                        </div>

                        <div className="text-center mb-6">
                            <h2 className="text-xl font-bold text-gray-900">
                                {companyName || 'N/A'}
                            </h2>
                            <p className="text-sm text-gray-500 mt-1">Client Account</p>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                                    Contact Person
                                </p>
                                <p className="text-sm text-gray-900">{client.user?.name || 'N/A'}</p>
                            </div>

                            <div>
                                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                                    Email
                                </p>
                                <div className="flex items-center text-sm text-gray-900">
                                    <Mail className="h-4 w-4 mr-2 text-gray-400" />
                                    {client.user?.email || 'N/A'}
                                </div>
                            </div>

                            {client.phone && (
                                <div>
                                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                                        Phone
                                    </p>
                                    <div className="flex items-center text-sm text-gray-900">
                                        <Phone className="h-4 w-4 mr-2 text-gray-400" />
                                        {client.phone}
                                    </div>
                                </div>
                            )}

                            {client.address && (
                                <div>
                                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                                        Address
                                    </p>
                                    <div className="flex items-start text-sm text-gray-900">
                                        <MapPin className="h-4 w-4 mr-2 text-gray-400 mt-0.5 shrink-0" />
                                        <span>{client.address}</span>
                                    </div>
                                </div>
                            )}

                            <div>
                                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                                    Member Since
                                </p>
                                <p className="text-sm text-gray-900">{memberSince}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Projects Section */}
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-semibold text-gray-900">
                                Projects ({projectsCount})
                            </h3>
                        </div>

                        {!client.projects || client.projects.length === 0 ? (
                            <div className="text-center py-12">
                                <FolderKanban className="mx-auto h-12 w-12 text-gray-400" />
                                <h3 className="mt-2 text-sm font-medium text-gray-900">
                                    No projects
                                </h3>
                                <p className="mt-1 text-sm text-gray-500">
                                    This client doesn't have any projects yet.
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {client.projects.map((project) => (
                                    <div
                                        key={project.id}
                                        className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors"
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <h4 className="text-sm font-semibold text-gray-900">
                                                    {project.name}
                                                </h4>
                                                {project.description && (
                                                    <p className="mt-1 text-sm text-gray-500 line-clamp-2">
                                                        {project.description}
                                                    </p>
                                                )}
                                                <div className="mt-2 flex items-center gap-4 text-xs text-gray-500">
                                                    <span>
                                                        Status:{' '}
                                                        <span className="font-medium capitalize">
                                                            {project.status.replace('_', ' ')}
                                                        </span>
                                                    </span>
                                                    {project.startDate && (
                                                        <span>
                                                            Started:{' '}
                                                            {new Date(project.startDate).toLocaleDateString()}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <Link href={projectsShow(project.id)}>
                                                <Button variant="outline" size="sm">
                                                    View
                                                </Button>
                                            </Link>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}