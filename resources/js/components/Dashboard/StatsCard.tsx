import type { LucideIcon } from 'lucide-react';

interface StatsCardProps {
    title: string;
    value: string | number;
    icon: LucideIcon;
    trend?: {
        value: string; // Changed to string to support custom text like "↑ 12% from last week"
        isPositive: boolean;
    };
    color?: 'blue' | 'green' | 'yellow' | 'red' | 'purple' | 'indigo' | 'teal' | 'orange';
}

export default function StatsCard({ 
    title, 
    value, 
    icon: Icon, 
    trend,
    color = 'blue' 
}: StatsCardProps) {
    // Border colors for top accent
    const borderColorClasses = {
        blue: 'border-blue-500',
        green: 'border-green-500',
        yellow: 'border-yellow-500',
        red: 'border-red-500',
        purple: 'border-purple-500',
        indigo: 'border-indigo-500',
        teal: 'border-teal-500',
        orange: 'border-orange-500',
    };

    // Icon background colors (lighter shades)
    const iconBgClasses = {
        blue: 'bg-blue-100',
        green: 'bg-green-100',
        yellow: 'bg-yellow-100',
        red: 'bg-red-100',
        purple: 'bg-purple-100',
        indigo: 'bg-indigo-100',
        teal: 'bg-teal-100',
        orange: 'bg-orange-100',
    };

    // Icon colors
    const iconColorClasses = {
        blue: 'text-blue-600',
        green: 'text-green-600',
        yellow: 'text-yellow-600',
        red: 'text-red-600',
        purple: 'text-purple-600',
        indigo: 'text-indigo-600',
        teal: 'text-teal-600',
        orange: 'text-orange-600',
    };

    return (
        <div className={`bg-white rounded-2xl shadow-sm border-t-4 ${borderColorClasses[color]} p-6 hover:shadow-lg transition-all duration-200 hover:scale-[1.02]`}>
            {/* Icon at top */}
            <div className="flex items-start justify-between mb-4">
                <div className={`${iconBgClasses[color]} rounded-xl p-3 shadow-sm`}>
                    <Icon className={`h-6 w-6 ${iconColorClasses[color]}`} />
                </div>
            </div>

            {/* Content */}
            <div>
                <p className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-1">
                    {title}
                </p>
                <p className="text-3xl font-bold text-gray-900 mb-2">
                    {value}
                </p>
                {trend && (
                    <p className={`text-sm font-medium ${trend.isPositive ? 'text-teal-600' : 'text-red-600'}`}>
                        {trend.value}
                    </p>
                )}
            </div>
        </div>
    );
}