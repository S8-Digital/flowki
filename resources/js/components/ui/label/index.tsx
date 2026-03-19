import FormLabel from '@mui/material/FormLabel';
import * as React from 'react';
import { cn } from '@/lib/utils';

function Label({ className, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) {
    return (
        <FormLabel
            className={cn(className)}
            sx={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--foreground)', cursor: 'pointer' }}
            {...(props as any)}
        />
    );
}

export { Label };
