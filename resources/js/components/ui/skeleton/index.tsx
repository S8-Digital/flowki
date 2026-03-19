import MuiSkeleton from '@mui/material/Skeleton';
import type { SxProps, Theme } from '@mui/material/styles';
import * as React from 'react';

function Skeleton({ className, sx, style, ...props }: React.HTMLAttributes<HTMLDivElement> & { sx?: SxProps<Theme> }) {
    return (
        <MuiSkeleton
            variant="rectangular"
            className={className}
            style={style}
            sx={{ borderRadius: 2, ...sx }}
            {...(props as any)}
        />
    );
}

export { Skeleton };
