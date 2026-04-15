import { Head, usePage } from '@inertiajs/react';
import {
    CheckSquare,
    FolderKanban,
    Users,
    TrendingUp,
    AlertCircle,
    FileText,
    CheckCircle,
} from 'lucide-react';
import ActivityFeed from '@/components/Dashboard/ActivityFeed';
import AppLayout from '@/layouts/AppLayout';
import type { DashboardPageProps, PageProps } from '@/types';

// Enhanced Stats Card Component
interface EnhancedStatsCardProps {
    title: string;
    value: number | string;
    icon: React.ElementType;
    borderColor: string;
    iconBgColor: string;
    iconColor: string;
    trend?: {
        value: string;
        isPositive: boolean;
    };
}

function EnhancedStatsCard({
    title,
    value,
    icon: Icon,
    borderColor,
    iconBgColor,
    iconColor,
    trend,
}: EnhancedStatsCardProps) {
    return (
        <div className={`bg-white rounded-2xl shadow-sm border-t-4 ${borderColor} p-6`}>
            <div className="flex items-start justify-between mb-4">
                <div className={`${iconBgColor} rounded-xl p-3`}>
                    <Icon className={`h-6 w-6 ${iconColor}`} />
                </div>
            </div>
            <div>
                <p className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-1">
                    {title}
                </p>
                <p className="text-3xl font-bold text-gray-900 mb-2">{value}</p>
                {trend && (
                    <p className={`text-sm font-medium ${trend.isPositive ? 'text-teal-600' : 'text-gray-500'}`}>
                        {trend.value}
                    </p>
                )}
            </div>
        </div>
    );
}

// Progress Bar Component
interface ProgressBarProps {
    label: string;
    value: number;
    total: number;
    color: string;
}

function ProgressBar({ label, value, total, color }: ProgressBarProps) {
    const percentage = total > 0 ? (value / total) * 100 : 0;
    
    return (
        <div className="mb-4 last:mb-0">
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                    <div className={`h-3 w-3 rounded-full ${color} mr-3`}></div>
                    <span className="text-sm font-medium text-gray-900">{label}</span>
                </div>
                <span className="text-sm font-bold text-gray-900">{value}</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2">
                <div
                    className={`h-2 rounded-full ${color}`}
                    style={{ width: `${Math.min(percentage, 100)}%` }}
                ></div>
            </div>
        </div>
    );
}

// Quick Stats Card Component
interface QuickStatsItemProps {
    label: string;
    value: number;
    borderColor: string;
}

function QuickStatsItem({ label, value, borderColor }: QuickStatsItemProps) {
    return (
        <div className={`border-l-4 ${borderColor} bg-gray-50 rounded-lg pl-4 py-3`}>
            <p className="text-sm font-medium text-gray-600 mb-1">{label}</p>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
    );
}

export default function Dashboard({ stats, recentActivities, userRole }: DashboardPageProps) {
    const { auth } = usePage<PageProps>().props;

    // Calculate completion rate
    const totalTasksForCompletion = (stats.pendingTasks || 0) + (stats.inProgressTasks || 0) + (stats.completedTasks || 0);
    const completionRate = totalTasksForCompletion > 0 
        ? Math.round((stats.completedTasks || 0) / totalTasksForCompletion * 100) 
        : 0;

    const renderAdminDashboard = () => (
        <>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
                <EnhancedStatsCard
                    title="Total Tasks"
                    value={stats.totalTasks || 0}
                    icon={FileText}
                    borderColor="border-blue-500"
                    iconBgColor="bg-blue-100"
                    iconColor="text-blue-600"
                    trend={{
                        value:
                            (stats.taskGrowthPercent || 0) > 0
                                ? `↑ ${stats.taskGrowthPercent}% from last week`
                                : (stats.taskGrowthPercent || 0) < 0
                                  ? `↓ ${Math.abs(stats.taskGrowthPercent || 0)}% from last week`
                                  : 'No change from last week',
                        isPositive: (stats.taskGrowthPercent || 0) > 0,
                    }}
                />
                <EnhancedStatsCard
                    title="Active Projects"
                    value={stats.activeProjects || 0}
                    icon={FolderKanban}
                    borderColor="border-purple-500"
                    iconBgColor="bg-purple-100"
                    iconColor="text-purple-600"
                    trend={{
                        value:
                            (stats.newProjectsThisMonth || 0) > 0
                                ? `↑ ${stats.newProjectsThisMonth} new this month`
                                : 'No new projects this month',
                        isPositive: (stats.newProjectsThisMonth || 0) > 0,
                    }}
                />
                <EnhancedStatsCard
                    title="Completion Rate"
                    value={`${completionRate}%`}
                    icon={CheckCircle}
                    borderColor="border-teal-500"
                    iconBgColor="bg-teal-100"
                    iconColor="text-teal-600"
                    trend={{
                        value:
                            (stats.completionRateDelta || 0) > 0
                                ? `↑ ${stats.completionRateDelta}% improvement`
                                : (stats.completionRateDelta || 0) < 0
                                  ? `↓ ${Math.abs(stats.completionRateDelta || 0)}% decline`
                                  : 'No change in completion',
                        isPositive: (stats.completionRateDelta || 0) > 0,
                    }}
                />
                <EnhancedStatsCard
                    title="Team Members"
                    value={stats.totalEmployees || 0}
                    icon={Users}
                    borderColor="border-orange-500"
                    iconBgColor="bg-orange-100"
                    iconColor="text-orange-600"
                    trend={{
                        value:
                            (stats.joinedRecentlyCount || 0) > 0
                                ? `${stats.joinedRecentlyCount} joined recently`
                                : 'No one joined recently',
                        isPositive: (stats.joinedRecentlyCount || 0) > 0,
                    }}
                />
            </div>

            {/* Task Overview and Quick Stats */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 mb-8">
                {/* Task Overview */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-6">
                        Task Overview
                    </h3>
                    <div className="space-y-1">
                        <ProgressBar
                            label="Pending"
                            value={stats.pendingTasks || 0}
                            total={stats.totalTasks || 0}
                            color="bg-yellow-500"
                        />
                        <ProgressBar
                            label="In Progress"
                            value={stats.inProgressTasks || 0}
                            total={stats.totalTasks || 0}
                            color="bg-blue-500"
                        />
                        <ProgressBar
                            label="Completed"
                            value={stats.completedTasks || 0}
                            total={stats.totalTasks || 0}
                            color="bg-teal-500"
                        />
                    </div>
                </div>

                {/* Quick Stats */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-6">
                        Quick Stats
                    </h3>
                    <div className="space-y-4">
                        <QuickStatsItem
                            label="Active Projects"
                            value={stats.activeProjects || 0}
                            borderColor="border-teal-500"
                        />
                        <QuickStatsItem
                            label="Overdue Tasks"
                            value={stats.overdueTasks || 0}
                            borderColor="border-yellow-500"
                        />
                        <QuickStatsItem
                            label="In Progress"
                            value={stats.inProgressTasks || 0}
                            borderColor="border-blue-500"
                        />
                    </div>
                </div>
            </div>

            {/* Recent Activities */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">
                    Recent Activities
                </h3>
                <ActivityFeed activities={recentActivities} />
            </div>
        </>
    );

    const renderEmployeeDashboard = () => (
        <>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 mb-8">
                <EnhancedStatsCard
                    title="My Tasks"
                    value={stats.totalTasks || 0}
                    icon={FileText}
                    borderColor="border-blue-500"
                    iconBgColor="bg-blue-100"
                    iconColor="text-blue-600"
                />
                <EnhancedStatsCard
                    title="My Projects"
                    value={stats.totalProjects || 0}
                    icon={FolderKanban}
                    borderColor="border-purple-500"
                    iconBgColor="bg-purple-100"
                    iconColor="text-purple-600"
                />
                <EnhancedStatsCard
                    title="Overdue"
                    value={stats.overdueTasks || 0}
                    icon={AlertCircle}
                    borderColor="border-red-500"
                    iconBgColor="bg-red-100"
                    iconColor="text-red-600"
                />
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        Task Status
                    </h3>
                    <div className="space-y-3">
                        <ProgressBar
                            label="Pending"
                            value={stats.pendingTasks || 0}
                            total={stats.totalTasks || 0}
                            color="bg-yellow-500"
                        />
                        <ProgressBar
                            label="In Progress"
                            value={stats.inProgressTasks || 0}
                            total={stats.totalTasks || 0}
                            color="bg-blue-500"
                        />
                        <ProgressBar
                            label="Completed"
                            value={stats.completedTasks || 0}
                            total={stats.totalTasks || 0}
                            color="bg-teal-500"
                        />
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-6">
                        My Recent Tasks
                    </h3>
                    <ActivityFeed activities={recentActivities} />
                </div>
            </div>
        </>
    );

    const renderClientDashboard = () => (
        <>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
                <EnhancedStatsCard
                    title="Total Projects"
                    value={stats.totalProjects || 0}
                    icon={FolderKanban}
                    borderColor="border-purple-500"
                    iconBgColor="bg-purple-100"
                    iconColor="text-purple-600"
                />
                <EnhancedStatsCard
                    title="Active Projects"
                    value={stats.activeProjects || 0}
                    icon={TrendingUp}
                    borderColor="border-green-500"
                    iconBgColor="bg-green-100"
                    iconColor="text-green-600"
                />
                <EnhancedStatsCard
                    title="Total Tasks"
                    value={stats.totalTasks || 0}
                    icon={CheckSquare}
                    borderColor="border-blue-500"
                    iconBgColor="bg-blue-100"
                    iconColor="text-blue-600"
                />
                <EnhancedStatsCard
                    title="Completed Projects"
                    value={stats.completedProjects || 0}
                    icon={CheckSquare}
                    borderColor="border-indigo-500"
                    iconBgColor="bg-indigo-100"
                    iconColor="text-indigo-600"
                />
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">
                    Project Activities
                </h3>
                <ActivityFeed activities={recentActivities} />
            </div>
        </>
    );

    const renderDashboard = () => {
        switch (userRole) {
            case 'admin':
                return renderAdminDashboard();
            case 'employee':
                return renderEmployeeDashboard();
            case 'client':
                return renderClientDashboard();
            default:
                return renderAdminDashboard();
        }
    };

    return (
        <AppLayout header="Dashboard">
            <Head title="Dashboard" />

            {/* Welcome Banner */}
            <div className="mb-8 rounded-2xl border-4 border-black bg-blue-600 p-8 shadow-sm">
                <h2 className="text-3xl font-bold text-white mb-2 flex items-center gap-2">
                    Welcome back, {auth.user.name}! 
                    <span className="text-2xl">👋</span>
                </h2>
                <p className="text-white">
                    Here's your project overview for today
                </p>
            </div>

            {renderDashboard()}
        </AppLayout>
    );
}