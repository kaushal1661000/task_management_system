// resources/js/Components/StatusBadge.tsx
// Following VCS-7: JavaScript Standards

interface StatusBadgeProps {
    status:
        | 'pending'
        | 'in_progress'
        | 'completed'
        | 'cancelled'
        | 'planning'
        | 'active'
        | 'paused'
        | 'on_hold'
        | string
        | null
        | undefined;
    size?: 'sm' | 'md' | 'lg';
}

export default function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
    const sizeClasses = {
        sm: 'px-2 py-0.5 text-xs',
        md: 'px-2.5 py-1 text-sm',
        lg: 'px-3 py-1.5 text-base',
    };

    const statusConfig = {
        pending: {
            label: 'Pending',
            classes: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        },
        in_progress: {
            label: 'In Progress',
            classes: 'bg-blue-100 text-blue-800 border-blue-200',
        },
        completed: {
            label: 'Completed',
            classes: 'bg-green-100 text-green-800 border-green-200',
        },
        cancelled: {
            label: 'Cancelled',
            classes: 'bg-red-100 text-red-800 border-red-200',
        },
        planning: {
            label: 'Planning',
            classes: 'bg-purple-100 text-purple-800 border-purple-200',
        },
        active: {
            label: 'Active',
            classes: 'bg-green-100 text-green-800 border-green-200',
        },
        paused: {
            label: 'Paused',
            classes: 'bg-orange-100 text-orange-800 border-orange-200',
        },
        on_hold: {
            label: 'On Hold',
            classes: 'bg-orange-100 text-orange-800 border-orange-200',
        },
    };

    const normalizedStatus = (status ?? '').toString();
    const config =
        statusConfig[normalizedStatus as keyof typeof statusConfig] ?? {
            label: normalizedStatus
                ? normalizedStatus.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase())
                : 'Unknown',
            classes: 'bg-gray-100 text-gray-700 border-gray-200',
        };

    return (
        <span
            className={`inline-flex items-center justify-center rounded-full border font-medium ${sizeClasses[size]} ${config.classes}`}
        >
            {config.label}
        </span>
    );
}