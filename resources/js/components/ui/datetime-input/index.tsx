import * as React from 'react';
import { cn } from '@/lib/utils';

function DateTimeInput({ className, ...props }: React.ComponentProps<'input'>) {
    return (
        <input
            type="datetime-local"
            data-slot="datetime-input"
            className={cn(
                'border-input dark:bg-input/30 [color-scheme:light] dark:[color-scheme:dark] flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
                className,
            )}
            {...props}
        />
    );
}

export { DateTimeInput };
