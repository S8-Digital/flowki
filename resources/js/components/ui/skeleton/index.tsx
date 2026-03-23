import MuiSkeleton from '@mui/material/Skeleton';
import { styled } from '@mui/material/styles';
import type { SxProps, Theme } from '@mui/material/styles';
import * as React from 'react';

const StyledSkeleton = styled(MuiSkeleton)(({ theme }) => ({
    borderRadius: theme.shape.borderRadius * 2,
}));

function Skeleton({ className, sx, style, ...props }: React.HTMLAttributes<HTMLDivElement> & { sx?: SxProps<Theme> }) {
    return (
        <StyledSkeleton
            variant="rectangular"
            className={className}
            style={style}
            sx={sx}
            {...(props as any)}
        />
    );
}

export { Skeleton };
