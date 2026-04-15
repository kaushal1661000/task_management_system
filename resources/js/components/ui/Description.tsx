import type { TextareaHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

type DescriptionProps = TextareaHTMLAttributes<HTMLTextAreaElement>;

export default function Description({ className, ...props }: DescriptionProps) {
    return (
        <textarea
            {...props}
            className={cn(
                'mt-1 block w-full rounded-lg textsmm  border border-gray-300 px-3 py-2 shadow-none focus:border-blue-500 focus:outline-none focus:ring-blue-500',
                className,
            )}
        />
    );
}
