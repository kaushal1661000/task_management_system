
import { formatDistanceToNow } from 'date-fns';
import { Bell, CheckSquare, FolderKanban, Users, X, Check } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import Modal from '@/components/ui/Modal';

interface Notification {
    id: string;
    type: string;
    title: string;
    message: string;
    icon: string;
    color: string;
    link: string | null;
    readAt: string | null;
    createdAt: string;
}

interface NotificationBellProps {
    initialCount?: number;
}

export default function NotificationBell({ initialCount = 0 }: NotificationBellProps) {
    const [notificationOpen, setNotificationOpen] = useState(false);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [allNotificationsOpen, setAllNotificationsOpen] = useState(false);
    const [allNotifications, setAllNotifications] = useState<Notification[]>([]);
    const [activityModalOpen, setActivityModalOpen] = useState(false);
    const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
    const [unreadCount, setUnreadCount] = useState(initialCount);
    const [loading, setLoading] = useState(false);
    const [allLoading, setAllLoading] = useState(false);

    const getCsrfToken = () =>
        document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';

    const notificationRequestHeaders = () => {
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
            const response = await fetch('/notifications');

            if (!response.ok) {
                throw new Error(`Failed to load notifications: ${response.status}`);
            }

            const data = await response.json();
            setNotifications(Array.isArray(data.notifications) ? data.notifications : []);
            setUnreadCount(typeof data.unreadCount === 'number' ? data.unreadCount : 0);
        } catch (error) {
            console.error('Error fetching notifications:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchAllNotifications = async () => {
        setAllLoading(true);

        try {
            const response = await fetch('/notifications?limit=200', {
                headers: {
                    Accept: 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                },
                credentials: 'same-origin',
            });

            if (!response.ok) {
                throw new Error(`Failed to load all notifications: ${response.status}`);
            }

            const data = await response.json();
            setAllNotifications(Array.isArray(data.notifications) ? data.notifications : []);
            setUnreadCount(typeof data.unreadCount === 'number' ? data.unreadCount : 0);
        } catch (error) {
            console.error('Error fetching all notifications:', error);
        } finally {
            setAllLoading(false);
        }
    };

    useEffect(() => {
        if (notificationOpen) {
            fetchNotifications();
        }
    }, [notificationOpen]);

    const handleMarkAsRead = async (notificationId: string): Promise<boolean> => {
        try {
            const response = await fetch(`/notifications/${notificationId}/read`, {
                method: 'POST',
                headers: notificationRequestHeaders(),
                credentials: 'same-origin',
                keepalive: true,
            });

            const data = await response.json();

            if (!response.ok || !data?.success) {
                throw new Error(data?.error || data?.message || `Failed to mark as read (${response.status})`);
            }

            setNotifications((prev) =>
                prev.map((notif) =>
                    notif.id === notificationId ? { ...notif, readAt: new Date().toISOString() } : notif
                )
            );
            setAllNotifications((prev) =>
                prev.map((notif) =>
                    notif.id === notificationId ? { ...notif, readAt: new Date().toISOString() } : notif
                )
            );
            setUnreadCount((prevCount) =>
                typeof data.unreadCount === 'number' ? data.unreadCount : Math.max(0, prevCount - 1)
            );

            return true;
        } catch (error) {
            console.error('Error marking notification as read:', error);

            return false;
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            const response = await fetch('/notifications/mark-all-read', {
                method: 'POST',
                headers: notificationRequestHeaders(),
                credentials: 'same-origin',
            });

            const data = await response.json();

            if (!response.ok || !data?.success) {
                throw new Error(data?.error || data?.message || `Failed to mark all as read (${response.status})`);
            }

            setNotifications((prev) =>
                prev.map((notif) => ({ ...notif, readAt: new Date().toISOString() }))
            );
            setAllNotifications((prev) =>
                prev.map((notif) => ({ ...notif, readAt: new Date().toISOString() }))
            );
            setUnreadCount(typeof data.unreadCount === 'number' ? data.unreadCount : 0);
        } catch (error) {
            console.error('Error marking all as read:', error);
        }
    };

    const handleDelete = async (notificationId: string) => {
        try {
            const response = await fetch(`/notifications/${notificationId}`, {
                method: 'DELETE',
                headers: notificationRequestHeaders(),
                credentials: 'same-origin',
            });

            const data = await response.json();

            if (!response.ok || !data?.success) {
                throw new Error(data?.error || data?.message || `Failed to delete notification (${response.status})`);
            }

            setNotifications((prev) => prev.filter((notif) => notif.id !== notificationId));
            setAllNotifications((prev) => prev.filter((notif) => notif.id !== notificationId));
            setUnreadCount((prevCount) =>
                typeof data.unreadCount === 'number' ? data.unreadCount : prevCount
            );
        } catch (error) {
            console.error('Error deleting notification:', error);
        }
    };

    const openActivityModal = (notification: Notification) => {
        setSelectedNotification(notification);
        setActivityModalOpen(true);
    };

    const closeActivityModal = () => {
        setActivityModalOpen(false);
        setSelectedNotification(null);
    };

    const handleNotificationClick = async (notification: Notification) => {
        if (!notification.readAt) {
            const marked = await handleMarkAsRead(notification.id);

            if (!marked) {
                return;
            }
        }

        setNotificationOpen(false);
        openActivityModal(notification);
    };

    const getIcon = (iconName: string) => {
        const icons: Record<string, any> = {
            task: CheckSquare,
            project: FolderKanban,
            user: Users,
            bell: Bell,
        };

        return icons[iconName] || Bell;
    };

    const getColorClasses = (color: string, isRead: boolean) => {
        const colors: Record<string, string> = {
            blue: 'bg-blue-100 text-blue-600',
            green: 'bg-green-100 text-green-600',
            purple: 'bg-purple-100 text-purple-600',
            red: 'bg-red-100 text-red-600',
            yellow: 'bg-yellow-100 text-yellow-600',
        };
        
        if (isRead) {
            return 'bg-gray-100 text-gray-400';
        }
        
        return colors[color] || 'bg-blue-100 text-blue-600';
    };

    const getTimeAgo = (dateString: string) => {
        try {
            return formatDistanceToNow(new Date(dateString), { addSuffix: true });
        } catch {
            return 'Recently';
        }
    };

    return (
        <div className="relative">
            <button
                onClick={() => setNotificationOpen(!notificationOpen)}
                className="relative rounded-lg p-2 hover:bg-gray-100 transition-colors"
            >
                <Bell className="h-6 w-6 text-gray-600" />
                {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-medium text-white">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {/* Notification Dropdown */}
            {notificationOpen && (
                <div className="absolute right-0 mt-2 w-96 origin-top-right rounded-lg bg-white shadow-lg ring-1 ring-black ring-opacity-5 z-50">
                    <div className="p-4">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-semibold text-gray-900">
                                Notifications
                            </h3>
                            {unreadCount > 0 && (
                                <button
                                    onClick={handleMarkAllAsRead}
                                    className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                                >
                                    Mark all as read
                                </button>
                            )}
                        </div>

                        {loading ? (
                            <div className="py-8 text-center">
                                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
                                <p className="mt-2 text-sm text-gray-500">Loading...</p>
                            </div>
                        ) : notifications.length === 0 ? (
                            <div className="py-8 text-center">
                                <Bell className="mx-auto h-12 w-12 text-gray-400" />
                                <p className="mt-2 text-sm text-gray-500">No notifications</p>
                            </div>
                        ) : (
                            <div className="max-h-96 overflow-y-auto space-y-2">
                                {notifications.map((notification) => {
                                    const Icon = getIcon(notification.icon);
                                    const isRead = !!notification.readAt;
                                    
                                    return (
                                        <div
                                            key={notification.id}
                                            className={`group relative flex items-start p-3 rounded-lg transition-colors ${
                                                isRead ? 'bg-white hover:bg-gray-50' : 'bg-blue-50 hover:bg-blue-100'
                                            } cursor-pointer`}
                                            onClick={() => handleNotificationClick(notification)}
                                        >
                                            <div
                                                className={`flex h-10 w-10 items-center justify-center rounded-full shrink-0 ${getColorClasses(
                                                    notification.color,
                                                    isRead
                                                )}`}
                                            >
                                                <Icon className="h-5 w-5" />
                                            </div>
                                            <div className="ml-3 flex-1 min-w-0">
                                                <p className={`text-sm font-medium ${isRead ? 'text-gray-600' : 'text-gray-900'}`}>
                                                    {notification.title}
                                                </p>
                                                <p className={`text-sm mt-1 ${isRead ? 'text-gray-400' : 'text-gray-600'}`}>
                                                    {notification.message}
                                                </p>
                                                <p className="text-xs text-gray-400 mt-1">
                                                    {getTimeAgo(notification.createdAt)}
                                                </p>
                                            </div>
                                            <div className="ml-2 flex items-start gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                {!isRead && (
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleMarkAsRead(notification.id);
                                                        }}
                                                        className="p-1 rounded hover:bg-gray-200"
                                                        title="Mark as read"
                                                    >
                                                        <Check className="h-4 w-4 text-gray-600" />
                                                    </button>
                                                )}
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDelete(notification.id);
                                                    }}
                                                    className="p-1 rounded hover:bg-red-100"
                                                    title="Delete"
                                                >
                                                    <X className="h-4 w-4 text-red-600" />
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {notifications.length > 0 && (
                            <div className="mt-4 pt-3 border-t border-gray-200">
                                <button
                                    className="text-sm text-blue-600 hover:text-blue-700 font-medium w-full text-center"
                                    onClick={async () => {
                                        setNotificationOpen(false);
                                        setAllNotificationsOpen(true);
                                        await fetchAllNotifications();
                                    }}
                                >
                                    View all notifications
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            <Modal
                isOpen={allNotificationsOpen}
                onClose={() => setAllNotificationsOpen(false)}
                title="All Notifications"
                description={`Unread: ${unreadCount}`}
                maxWidthClassName="max-w-4xl"
            >
                <div className="space-y-4">
                    <div className="flex items-center justify-end">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleMarkAllAsRead}
                            disabled={unreadCount === 0}
                        >
                            Mark all as read
                        </Button>
                    </div>

                    {allLoading && (
                        <div className="rounded-xl border border-gray-200 bg-white p-8 text-center text-gray-500">
                            Loading notifications...
                        </div>
                    )}

                    {!allLoading && allNotifications.length === 0 && (
                        <div className="rounded-xl border border-gray-200 bg-white p-8 text-center">
                            <Bell className="mx-auto mb-2 h-8 w-8 text-gray-400" />
                            <p className="text-gray-500">No notifications found.</p>
                        </div>
                    )}

                    {!allLoading && allNotifications.length > 0 && (
                        <div className="max-h-[60vh] space-y-3 overflow-y-auto pr-1">
                            {allNotifications.map((notification) => {
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
                                                className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${getColorClasses(
                                                    notification.color,
                                                    isRead
                                                )}`}
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
                                                        onClick={() => openActivityModal(notification)}
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
                                                    <X className="h-4 w-4 text-red-600" />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </Modal>

            <Modal
                isOpen={activityModalOpen}
                onClose={closeActivityModal}
                title={selectedNotification?.title ?? 'Notification Activity'}
                description="Notification details"
                maxWidthClassName="max-w-2xl"
            >
                {selectedNotification && (
                    <div className="space-y-5">
                        <div
                            className={`inline-flex h-10 w-10 items-center justify-center rounded-full ${getColorClasses(
                                selectedNotification.color,
                                Boolean(selectedNotification.readAt)
                            )}`}
                        >
                            {(() => {
                                const Icon = getIcon(selectedNotification.icon);

                                return <Icon className="h-5 w-5" />;
                            })()}
                        </div>

                        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                            <p className="text-sm text-gray-700">{selectedNotification.message}</p>
                            <p className="mt-2 text-xs text-gray-500">
                                {getTimeAgo(selectedNotification.createdAt)}
                            </p>
                        </div>

                        <div className="flex justify-end border-t border-gray-200 pt-4">
                            <Button type="button" variant="outline" onClick={closeActivityModal}>
                                Close
                            </Button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
}