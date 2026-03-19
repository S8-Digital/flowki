import OutlinedInput from '@mui/material/OutlinedInput';
import * as React from 'react';
import { cn } from '@/lib/utils';

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<'input'>>(({ className, type, ...props }, ref) => {
    if (type === 'file' || type === 'date' || type === 'datetime-local' || type === 'color') {
        return (
            <input
                ref={ref}
                type={type}
                className={cn(
                    'w-full rounded-md border border-[var(--border)] bg-transparent px-2.5 py-2 text-sm shadow-sm outline-none transition-all hover:border-[var(--primary)] focus:border-[var(--primary)] disabled:pointer-events-none disabled:opacity-50',
                    type === 'file' && 'cursor-pointer file:cursor-pointer file:border-0 file:bg-transparent file:text-sm file:font-medium',
                    className,
                )}
                {...props}
            />
        );
    }

    return (
        <OutlinedInput
            inputRef={ref}
            type={type}
            inputProps={{ ...props }}
            className={cn(className)}
            size="small"
            fullWidth
        />
    );
});
Input.displayName = 'Input';

export { Input };
