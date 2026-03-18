import * as React from 'react';
import { cn } from '@/lib/utils';

function DateTimeInput({ className, ...props }: React.ComponentProps<'input'>) {
    return (
        <input
            type="datetime-local"
            data-slot="datetime-input"
            className={cn(
                // Mimics MT's outlined input appearance without using InputRoot
                // (InputRoot coerces unsupported types like datetime-local back to text)
                'w-full select-none rounded-md border border-surface bg-transparent px-2.5 py-2 text-sm text-black shadow-sm ring ring-transparent outline-none transition-all duration-300 ease-in [color-scheme:light] hover:border-primary hover:ring-primary/10 focus:border-primary focus:ring-primary/10 focus:outline-none disabled:pointer-events-none disabled:opacity-50 dark:text-white dark:[color-scheme:dark]',
                className,
            )}
            {...props}
        />
    );
}

export { DateTimeInput };
