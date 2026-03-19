import OutlinedInput from '@mui/material/OutlinedInput';
import * as React from 'react';
import { cn } from '@/lib/utils';

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<'input'>>(({ className, type, ...props }, ref) => {
    if (type === 'file') {
        // File inputs require a native element for the browser's file picker UI.
        // MUI OutlinedInput does not expose the native file picker affordance.
        return (
            <input
                ref={ref}
                type="file"
                className={cn(className)}
                style={{
                    width: '100%',
                    cursor: 'pointer',
                    borderRadius: 6,
                    border: '1px solid',
                    borderColor: 'var(--border)',
                    backgroundColor: 'transparent',
                    padding: '8px 10px',
                    fontSize: '0.875rem',
                    outline: 'none',
                    transition: 'border-color 0.2s',
                    opacity: (props as any).disabled ? 0.5 : 1,
                    pointerEvents: (props as any).disabled ? 'none' : undefined,
                }}
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
