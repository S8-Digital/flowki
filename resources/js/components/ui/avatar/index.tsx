import Box from '@mui/material/Box';
import * as React from 'react';

function Avatar({ className, children, ...props }: React.HTMLAttributes<HTMLSpanElement>) {
    return (
        <Box
            component="span"
            className={className}
            sx={{ position: 'relative', display: 'flex', flexShrink: 0, overflow: 'hidden', borderRadius: '50%' }}
            {...(props as any)}
        >
            {children}
        </Box>
    );
}

function AvatarImage({ src, alt, className, ...props }: React.ImgHTMLAttributes<HTMLImageElement> & { src?: string }) {
    if (!src) return null;
    return (
        <Box
            component="img"
            src={src}
            alt={alt || ''}
            className={className}
            sx={{ aspectRatio: '1 / 1', height: '100%', width: '100%', objectFit: 'cover' }}
            {...(props as any)}
        />
    );
}

function AvatarFallback({ className, children, ...props }: React.HTMLAttributes<HTMLSpanElement>) {
    return (
        <Box
            component="span"
            className={className}
            sx={{
                display: 'flex',
                height: '100%',
                width: '100%',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '50%',
                bgcolor: 'action.selected',
                fontSize: '0.875rem',
                fontWeight: 500,
            }}
            {...(props as any)}
        >
            {children}
        </Box>
    );
}

export { Avatar, AvatarFallback, AvatarImage };
