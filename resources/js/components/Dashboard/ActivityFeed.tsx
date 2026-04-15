import { CheckSquare, FolderKanban, Clock, ArrowRight, UserPlus } from 'lucide-react';
import { useState } from 'react';
import StatusBadge from '@/components/StatusBadge';
import Modal from '@/components/ui/Modal';
import { Button } from '@/components/ui/button';
import type { Activity } from '@/types';

interface ActivityFeedProps {
    activities: Activity[];
}

export default function ActivityFeed({ activities }: ActivityFeedProps) {
    const [allActivitiesOpen, setAllActivitiesOpen] = useState(false);
    const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);

    const previewActivities = activities.slice(0, 5);

    const getIcon = (type: string) => {
        switch (type) {
            case 'task':
                return CheckSquare;
            case 'project':
                return FolderKanban;
            case 'user':
                return UserPlus;
            default:
                return Clock;
        }
    };

    const getIconColors = (type: string, status?: string) => {
        // If status is completed, always use green
        if (status?.toLowerCase() === 'completed') {
            return {
                bg: 'bg-green-50',
                ring: 'ring-green-100',
                icon: 'bg-green-100',
                iconColor: 'text-green-600',
                cardBg: 'bg-green-50/30',
                border: 'border-green-200',
            };
        }

        switch (type) {
            case 'task':
                return {
                    bg: 'bg-blue-50',
                    ring: 'ring-blue-100',
                    icon: 'bg-blue-100',
                    iconColor: 'text-blue-600',
                    cardBg: 'bg-blue-50/30',
                    border: 'border-blue-200',
                };
            case 'project':
                return {
                    bg: 'bg-purple-50',
                    ring: 'ring-purple-100',
                    icon: 'bg-purple-100',
                    iconColor: 'text-purple-600',
                    cardBg: 'bg-purple-50/30',
                    border: 'border-purple-200',
                };
            case 'user':
                return {
                    bg: 'bg-indigo-50',
                    ring: 'ring-indigo-100',
                    icon: 'bg-indigo-100',
                    iconColor: 'text-indigo-600',
                    cardBg: 'bg-indigo-50/30',
                    border: 'border-indigo-200',
                };
            default:
                return {
                    bg: 'bg-gray-50',
                    ring: 'ring-gray-100',
                    icon: 'bg-gray-100',
                    iconColor: 'text-gray-600',
                    cardBg: 'bg-gray-50/30',
                    border: 'border-gray-200',
                };
        }
    };

    const getTimeAgo = (dateString?: string) => {
        if (!dateString) {
            return 'Recently';
        }

        const date = new Date(dateString);

        if (Number.isNaN(date.getTime())) {
            return 'Recently';
        }

        const now = new Date();
        const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

        if (seconds < 60) {
            return 'Just now';
        }

        const minutes = Math.floor(seconds / 60);

        if (minutes < 60) {
            return `${minutes}m ago`;
        }

        const hours = Math.floor(minutes / 60);

        if (hours < 24) {
            return `${hours}h ago`;
        }

        const days = Math.floor(hours / 24);

        if (days < 7) {
            return `${days}d ago`;
        }

        const weeks = Math.floor(days / 7);
        
        if (weeks < 4) {
            return `${weeks}w ago`;
        }

        return date.toLocaleDateString();
    };

    const openActivityModal = (activity: Activity) => {
        setSelectedActivity(activity);
    };

    const closeActivityModal = () => {
        setSelectedActivity(null);
    };

    if (activities.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="rounded-full bg-linear-to-br from-blue-50 to-indigo-50 p-6 mb-4 shadow-sm">
                    <Clock className="h-10 w-10 text-blue-400" />
                </div>
                <p className="text-base font-semibold text-gray-900 mb-1">No activities yet</p>
                <p className="text-sm text-gray-500 max-w-sm">
                    Your recent activities will appear here as you work on tasks and projects
                </p>
            </div>
        );
    }

    return (
        <div className="flow-root">
            <ul className="-mb-8 space-y-3">
                {previewActivities.map((activity, index) => {
                    const Icon = getIcon(activity.type);
                    const isLast = index === previewActivities.length - 1;
                    const normalizedActivity = activity as Activity & { created_at?: string };
                    const createdAt = activity.createdAt || normalizedActivity.created_at;
                    const colors = getIconColors(activity.type, activity.status);

                    return (
                        <li key={activity.id}>
                            <div className="relative pb-3">
                                {!isLast && (
                                    <span
                                        className="absolute left-5 top-12 -ml-px h-full w-0.5 bg-gradient-to-b from-gray-300 to-gray-100"
                                        aria-hidden="true"
                                    />
                                )}
                                
                                {/* Enhanced Card Layout */}
                                <div 
                                    className={`group relative flex items-start gap-4 p-4 rounded-xl border ${colors.border} ${colors.cardBg} 
                                    hover:shadow-lg hover:scale-[1.01] transition-all duration-200 bg-white`}
                                >
                                    {/* Icon with enhanced styling */}
                                    <div className="relative shrink-0">
                                        <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${colors.icon} shadow-sm ring-4 ${colors.ring}`}>
                                            <Icon className={`h-5 w-5 ${colors.iconColor}`} />
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="flex-1 min-w-0">
                                                {/* Title */}
                                                <h4 className="text-sm font-semibold text-gray-900 mb-1 line-clamp-1">
                                                    {activity.title}
                                                </h4>
                                                
                                                {/* Description */}
                                                <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                                                    {activity.description}
                                                </p>

                                                {/* Project tag */}
                                                {activity.project && (
                                                    <div className="flex items-center gap-1.5 mt-2">
                                                        <FolderKanban className="h-3.5 w-3.5 text-gray-400" />
                                                        <span className="text-xs font-medium text-gray-500">
                                                            Project:
                                                        </span>
                                                        <span className="text-xs text-gray-700 font-medium">
                                                            {activity.project}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Right side - Status and Time */}
                                            <div className="flex flex-col items-end gap-2 flex-shrink-0">
                                                {activity.status && (
                                                    <StatusBadge 
                                                        status={activity.status as any} 
                                                        size="sm" 
                                                    />
                                                )}
                                                <div className="flex items-center gap-1.5">
                                                    <Clock className="h-3.5 w-3.5 text-gray-400" />
                                                    <p className="text-xs text-gray-500 font-medium whitespace-nowrap">
                                                        {getTimeAgo(createdAt)}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Hover arrow indicator */}
                                    <button
                                        type="button"
                                        onClick={() => openActivityModal(activity)}
                                        className="flex-shrink-0 rounded-lg p-1 text-gray-400 transition-all duration-200 hover:bg-gray-100 hover:text-gray-600"
                                        aria-label={`Open activity ${activity.title}`}
                                    >
                                        <ArrowRight className="h-5 w-5" />
                                    </button>
                                </div>
                            </div>
                        </li>
                    );
                })}
            </ul>

            {/* View All Button - appears if more than 5 activities */}
            {activities.length > 5 && (
                <div className="mt-6 pt-4 border-t border-gray-200">
                    <button 
                        type="button"
                        onClick={() => setAllActivitiesOpen(true)}
                        className="w-full py-3 px-4 text-sm font-semibold text-blue-600 hover:text-blue-700 
                        hover:bg-blue-50 rounded-xl transition-all duration-200 flex items-center justify-center gap-2"
                    >
                        View all activities
                        <ArrowRight className="h-4 w-4" />
                    </button>
                </div>
            )}

            <Modal
                isOpen={allActivitiesOpen}
                onClose={() => setAllActivitiesOpen(false)}
                title="All Activities"
                description="Recent updates across tasks and projects"
                maxWidthClassName="max-w-4xl"
            >
                <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-1">
                    {activities.map((activity) => {
                        const Icon = getIcon(activity.type);
                        const normalizedActivity = activity as Activity & { created_at?: string };
                        const createdAt = activity.createdAt || normalizedActivity.created_at;
                        const colors = getIconColors(activity.type, activity.status);

                        return (
                            <div
                                key={activity.id}
                                className={`flex items-start gap-4 rounded-xl border ${colors.border} ${colors.cardBg} p-4`}
                            >
                                <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${colors.icon} shadow-sm ring-4 ${colors.ring}`}>
                                    <Icon className={`h-5 w-5 ${colors.iconColor}`} />
                                </div>

                                <div className="min-w-0 flex-1">
                                    <p className="text-sm font-semibold text-gray-900">{activity.title}</p>
                                    <p className="mt-1 text-sm text-gray-600">{activity.description}</p>
                                    <p className="mt-1 text-xs text-gray-500">{getTimeAgo(createdAt)}</p>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => openActivityModal(activity)}
                                    className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                                    aria-label={`Open activity ${activity.title}`}
                                >
                                    <ArrowRight className="h-5 w-5" />
                                </button>
                            </div>
                        );
                    })}
                </div>
            </Modal>

            <Modal
                isOpen={Boolean(selectedActivity)}
                onClose={closeActivityModal}
                title={selectedActivity?.title ?? 'Activity Details'}
                description="Activity information"
                maxWidthClassName="max-w-2xl"
            >
                {selectedActivity && (() => {
                    const normalizedActivity = selectedActivity as Activity & { created_at?: string };
                    const createdAt = selectedActivity.createdAt || normalizedActivity.created_at;
                    const Icon = getIcon(selectedActivity.type);
                    const colors = getIconColors(selectedActivity.type, selectedActivity.status);

                    return (
                        <div className="space-y-5">
                            <div className="flex items-start gap-4 rounded-xl border border-gray-200 bg-gray-50 p-4">
                                <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${colors.icon}`}>
                                    <Icon className={`h-5 w-5 ${colors.iconColor}`} />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="text-sm text-gray-700">{selectedActivity.description}</p>
                                    {selectedActivity.project && (
                                        <p className="mt-2 text-xs text-gray-500">Project: {selectedActivity.project}</p>
                                    )}
                                    <p className="mt-1 text-xs text-gray-500">{getTimeAgo(createdAt)}</p>
                                </div>
                                {selectedActivity.status && (
                                    <StatusBadge status={selectedActivity.status as any} size="sm" />
                                )}
                            </div>

                            <div className="flex justify-end border-t border-gray-200 pt-4">
                                <Button type="button" variant="outline" onClick={closeActivityModal}>
                                    Close
                                </Button>
                            </div>
                        </div>
                    );
                })()}
            </Modal>
        </div>
    );
}