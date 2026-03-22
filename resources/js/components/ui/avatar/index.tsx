import Box from '@mui/material/Box';
import { styled } from '@mui/material/styles';
import * as React from 'react';

const StyledAvatar = styled(Box)({
    borderRadius: '50%',
});

const StyledAvatarFallback = styled(Box)(({ theme }) => ({
    borderRadius: '50%',
    backgroundColor: theme.palette.action.selected,
    fontSize: '0.875rem',
    fontWeight: 500,
}));

function Avatar({ className, children, ...props }: React.HTMLAttributes<HTMLSpanElement>) {
    return (
        <StyledAvatar
            component="span"
            className={className}
            sx={{ position: 'relative', display: 'flex', flexShrink: 0, overflow: 'hidden' }}
            {...(props as any)}
        >
            {children}
        </StyledAvatar>
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
        <StyledAvatarFallback
            component="span"
            className={className}
            sx={{ display: 'flex', height: '100%', width: '100%', alignItems: 'center', justifyContent: 'center' }}
            {...(props as any)}
        >
            {children}
        </StyledAvatarFallback>
    );
}

export { Avatar, AvatarFallback, AvatarImage };
