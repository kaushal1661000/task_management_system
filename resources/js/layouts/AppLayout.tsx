import { Link, usePage } from '@inertiajs/react';
import { router } from '@inertiajs/react';
import {
    LayoutDashboard,
    Users,
    Building2,
    FolderKanban,
    CheckSquare,
    BarChart3,
    Menu,
    ChevronLeft,
    ChevronRight,
    LogOut,
    User as UserIcon,
} from 'lucide-react';
import type { PropsWithChildren, ReactNode} from 'react';
import { useState } from 'react';
import NotificationBell from '@/components/NotificationBell';
import { index as clientsIndex } from '@/routes/clients';
import { edit as profileEdit } from '@/routes/profile';
import { index as projectsIndex } from '@/routes/projects';
import { index as reportsIndex } from '@/routes/reports';
import { index as tasksIndex } from '@/routes/tasks';
import { index as usersIndex } from '@/routes/users';
import type { PageProps } from '@/types';

interface AppLayoutProps extends PropsWithChildren {
    header?: ReactNode;
}

export default function AppLayout({ children, header }: AppLayoutProps) {
    const page = usePage<PageProps>();
    const { auth, unreadNotificationCount } = page.props;
    const currentPath = page.url.split('?')[0] || '/';
    const dashboardPath = '/dashboard';
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [userMenuOpen, setUserMenuOpen] = useState(false);

    const navigationItems = [
        {
            name: 'Dashboard',
            href: dashboardPath,
            icon: LayoutDashboard,
            current: currentPath === dashboardPath,
            roles: ['admin', 'employee', 'client'],
        },
        {
            name: 'Users',
            href: usersIndex(),
            icon: Users,
            current: currentPath.startsWith(usersIndex.url()),
            roles: ['admin'],
        },
        {
            name: 'Clients',
            href: clientsIndex(),
            icon: Building2,
            current: currentPath.startsWith(clientsIndex.url()),
            roles: ['admin'],
        },
        {
            name: 'Projects',
            href: projectsIndex(),
            icon: FolderKanban,
            current: currentPath.startsWith(projectsIndex.url()),
            roles: ['admin', 'employee', 'client'],
        },
        {
            name: 'Tasks',
            href: tasksIndex(),
            icon: CheckSquare,
            current: currentPath.startsWith(tasksIndex.url()),
            roles: ['admin', 'employee'],
        },
        {
            name: 'Reports',
            href: reportsIndex(),
            icon: BarChart3,
            current: currentPath.startsWith(reportsIndex.url()),
            roles: ['admin'],
        },
    ];

    const filteredNavigation = navigationItems.filter((item) =>
        item.roles.includes(auth.user.role)
    );

    const handleLogout = () => {
        router.post('/logout');
    };

    return (
        <div className="flex h-screen bg-gray-100">
            {/* Sidebar */}
            <aside
                className={`${
                    sidebarOpen ? 'w-64' : 'w-20'
                } relative hidden lg:flex lg:flex-col bg-white border-r border-gray-200 transition-all duration-300 ease-in-out`}
            >
                {/* Collapse Button */}
                <button
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    className="absolute -right-3 top-20 z-10 flex h-6 w-6 items-center justify-center rounded-full border border-gray-200 bg-white shadow-md hover:bg-gray-50 transition-colors"
                >
                    {sidebarOpen ? (
                        <ChevronLeft className="h-4 w-4 text-gray-600" />
                    ) : (
                        <ChevronRight className="h-4 w-4 text-gray-600" />
                    )}
                </button>

                {/* Logo */}
                <div className="flex h-16 items-center justify-center px-4 border-b border-gray-200">
                    <Link href={dashboardPath} className="flex items-center space-x-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600">
                            <svg
                                className="h-6 w-6 text-white"
                                viewBox="0 0 24 24"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path
                                    d="M9 11L12 14L22 4"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                                <path
                                    d="M21 12V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H16"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                            </svg>
                        </div>
                        {sidebarOpen && (
                            <span className="text-2xl font-bold text-gray-900">TaskFlow</span>
                        )}
                    </Link>
                </div>

                {/* Navigation */}
                <nav className="flex-1 space-y-1 px-3 py-4 overflow-y-auto">
                    {filteredNavigation.map((item) => {
                        const Icon = item.icon;

                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={`${
                                    item.current
                                        ? 'bg-blue-600 text-white'
                                        : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'
                                } group flex items-center rounded-lg px-3 py-2.5 text-sm font-medium transition-colors cursor-pointer`}
                            >
                                <Icon className={`${sidebarOpen ? 'mr-3' : 'mx-auto'} h-5 w-5 shrink-0`} />
                                {sidebarOpen && <span className="flex-1">{item.name}</span>}
                            </Link>
                        );
                    })}
                </nav>

                {/* User Profile at Bottom */}
                <div className="border-t border-gray-200 p-3">
                    <div className="relative">
                        <button
                            onClick={() => setUserMenuOpen(!userMenuOpen)}
                            className={`${
                                sidebarOpen ? 'w-full justify-start' : 'justify-center'
                            } group flex items-center rounded-lg px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors`}
                        >
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-white font-medium text-sm shrink-0">
                                {auth.user.name.charAt(0).toUpperCase()}
                            </div>
                            {sidebarOpen && (
                                <div className="ml-3 flex-1 text-left">
                                    <p className="text-sm font-medium text-gray-900">
                                        {auth.user.name}
                                    </p>
                                    <p className="text-xs text-gray-500 capitalize">
                                        {auth.user.role}
                                    </p>
                                </div>
                            )}
                        </button>

                        {/* User Dropdown Menu */}
                        {userMenuOpen && (
                            <div className="absolute bottom-full left-0 mb-2 w-56 origin-bottom-left rounded-lg bg-white shadow-lg ring-1 ring-black ring-opacity-5 z-50">
                                <div className="p-2">
                                    <Link
                                        href={profileEdit()}
                                        className="flex items-center rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                    >
                                        <UserIcon className="mr-3 h-4 w-4" />
                                        Profile Settings
                                    </Link>
                                    <button
                                        onClick={handleLogout}
                                        className="flex w-full items-center rounded-lg px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                                    >
                                        <LogOut className="mr-3 h-4 w-4" />
                                        Logout
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex flex-1 flex-col overflow-hidden">
                {/* Top Bar */}
                <header className="flex h-16 items-center justify-between border-b border-gray-200 bg-white px-6">
                    <div className="flex items-center">
                        <button className="lg:hidden mr-4 rounded-lg p-2 hover:bg-gray-100">
                            <Menu className="h-6 w-6" />
                        </button>
                        {header && <div className="text-xl font-semibold text-gray-900">{header}</div>}
                    </div>

                    {/* Notification Bell - Now Functional */}
                    <NotificationBell initialCount={unreadNotificationCount} />
                </header>

                {/* Page Content */}
                <main className="flex-1 overflow-y-auto bg-gray-100 p-6">
                    {page.props.message && (
                        <div
                            className={`mb-4 rounded-lg border px-4 py-3 text-sm ${
                                page.props.message.status === 'success'
                                    ? 'border-green-200 bg-green-50 text-green-800'
                                    : 'border-red-200 bg-red-50 text-red-800'
                            }`}
                        >
                            {page.props.message.description}
                        </div>
                    )}
                    {children}
                </main>
            </div>
        </div>
    );
}