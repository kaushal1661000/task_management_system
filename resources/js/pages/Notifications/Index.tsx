import { Head, router } from '@inertiajs/react';
import { formatDistanceToNow } from 'date-fns';
import { Bell, Check, CheckSquare, FolderKanban, Trash2, Users } from 'lucide-react';
import type { ComponentType } from 'react';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/AppLayout';

type NotificationItem = {
    id: string;
    type: string;
    title: string;
    message: string;
    icon: string;
    color: string;
    link: string | null;
    readAt: string | null;
    createdAt: string;
};

export default function Index() {
    const [loading, setLoading] = useState(true);
    const [notifications, setNotifications] = useState<NotificationItem[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);

    const getCsrfToken = () =>
        document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';

    const requestHeaders = () => {
        const csrf = getCsrfToken();

        return {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
            ...(csrf ? { 'X-CSRF-TOKEN': csrf } : {}),
        };
    };

    const fetchNotifications = async () => {
        setLoading(true);

        try {
            const response = await fetch('/notifications?limit=200', {
                headers: {
                    Accept: 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                },
                credentials: 'same-origin',
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch notifications: ${response.status}`);
            }

            const data = await response.json();
            setNotifications(Array.isArray(data.notifications) ? data.notifications : []);
            setUnreadCount(typeof data.unreadCount === 'number' ? data.unreadCount : 0);
        } catch (error) {
            console.error('Error loading notifications:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, []);

    const handleMarkAsRead = async (notificationId: string) => {
        try {
            const response = await fetch(`/notifications/${notificationId}/read`, {
                method: 'POST',
                headers: requestHeaders(),
                credentials: 'same-origin',
            });

            const data = await response.json();

            if (!response.ok || !data?.success) {
                throw new Error(data?.error || data?.message || 'Failed to mark notification as read.');
            }

            setNotifications((prev) =>
                prev.map((notification) =>
                    notification.id === notificationId
                        ? { ...notification, readAt: new Date().toISOString() }
                        : notification
                )
            );
            setUnreadCount(typeof data.unreadCount === 'number' ? data.unreadCount : 0);
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    };

    const handleDelete = async (notificationId: string) => {
        try {
            const response = await fetch(`/notifications/${notificationId}`, {
                method: 'DELETE',
                headers: requestHeaders(),
                credentials: 'same-origin',
            });

            const data = await response.json();

            if (!response.ok || !data?.success) {
                throw new Error(data?.error || data?.message || 'Failed to delete notification.');
            }

            setNotifications((prev) => prev.filter((notification) => notification.id !== notificationId));
            setUnreadCount(typeof data.unreadCount === 'number' ? data.unreadCount : 0);
        } catch (error) {
            console.error('Error deleting notification:', error);
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            const response = await fetch('/notifications/mark-all-read', {
                method: 'POST',
                headers: requestHeaders(),
                credentials: 'same-origin',
            });

            const data = await response.json();

            if (!response.ok || !data?.success) {
                throw new Error(data?.error || data?.message || 'Failed to mark all notifications as read.');
            }

            setNotifications((prev) => prev.map((notification) => ({ ...notification, readAt: new Date().toISOString() })));
            setUnreadCount(typeof data.unreadCount === 'number' ? data.unreadCount : 0);
        } catch (error) {
            console.error('Error marking all as read:', error);
        }
    };

    const getIcon = (iconName: string) => {
        const icons: Record<string, ComponentType<{ className?: string }>> = {
            task: CheckSquare,
            project: FolderKanban,
            user: Users,
            bell: Bell,
        };

        return icons[iconName] || Bell;
    };

    const getTimeAgo = (dateString: string) => {
        try {
            return formatDistanceToNow(new Date(dateString), { addSuffix: true });
        } catch {
            return 'Recently';
        }
    };

    return (
        <AppLayout header="All Notifications">
            <Head title="Notifications" />

            <div className="mx-auto max-w-4xl">
                <div className="mb-6 flex items-center justify-between rounded-xl border border-gray-200 bg-white p-4">
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900">Notifications</h2>
                        <p className="text-sm text-gray-500">Unread: {unreadCount}</p>
                    </div>

                    <Button
                        type="button"
                        variant="outline"
                        onClick={handleMarkAllAsRead}
                        disabled={unreadCount === 0}
                    >
                        Mark all as read
                    </Button>
                </div>

                <div className="space-y-3">
                    {loading && (
                        <div className="rounded-xl border border-gray-200 bg-white p-8 text-center text-gray-500">
                            Loading notifications...
                        </div>
                    )}

                    {!loading && notifications.length === 0 && (
                        <div className="rounded-xl border border-gray-200 bg-white p-8 text-center">
                            <Bell className="mx-auto mb-2 h-8 w-8 text-gray-400" />
                            <p className="text-gray-500">No notifications found.</p>
                        </div>
                    )}

                    {!loading &&
                        notifications.map((notification) => {
                            const Icon = getIcon(notification.icon);
                            const isRead = Boolean(notification.readAt);

                            return (
                                <div
                                    key={notification.id}
                                    className={`rounded-xl border bg-white p-4 transition-colors ${
                                        isRead ? 'border-gray-200' : 'border-blue-200 bg-blue-50'
                                    }`}
                                >
                                    <div className="flex items-start gap-3">
                                        <div
                                            className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                                                isRead ? 'bg-gray-100 text-gray-500' : 'bg-blue-100 text-blue-600'
                                            }`}
                                        >
                                            <Icon className="h-5 w-5" />
                                        </div>

                                        <div className="min-w-0 flex-1">
                                            <p className={`text-sm font-medium ${isRead ? 'text-gray-700' : 'text-gray-900'}`}>
                                                {notification.title}
                                            </p>
                                            <p className={`mt-1 text-sm ${isRead ? 'text-gray-500' : 'text-gray-700'}`}>
                                                {notification.message}
                                            </p>
                                            <p className="mt-1 text-xs text-gray-400">
                                                {getTimeAgo(notification.createdAt)}
                                            </p>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            {!isRead && (
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="icon"
                                                    onClick={() => handleMarkAsRead(notification.id)}
                                                    title="Mark as read"
                                                >
                                                    <Check className="h-4 w-4" />
                                                </Button>
                                            )}

                                            {notification.link && (
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    onClick={() => router.visit(notification.link as string)}
                                                >
                                                    Open
                                                </Button>
                                            )}

                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="icon"
                                                onClick={() => handleDelete(notification.id)}
                                                title="Delete"
                                            >
                                                <Trash2 className="h-4 w-4 text-red-600" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                </div>
            </div>
        </AppLayout>
    );
}
