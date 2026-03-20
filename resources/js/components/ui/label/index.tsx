import FormLabel from '@mui/material/FormLabel';
import type { SxProps, Theme } from '@mui/material/styles';
import * as React from 'react';
import { cn } from '@/lib/utils';

function Label({ className, sx, ...props }: React.LabelHTMLAttributes<HTMLLabelElement> & { sx?: SxProps<Theme> }) {
    return (
        <FormLabel
            className={cn(className)}
            sx={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--foreground)', cursor: 'pointer', ...sx }}
            {...(props as any)}
        />
    );
}

export { Label };
