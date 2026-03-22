import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type React from 'react';

/** Titled section block used on Privacy and Terms pages. */
export function Section({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <Stack spacing={1.5}>
            {/* h6 fontWeight comes from theme; fontSize trimmed down from h6 default for legal body flow */}
            <Typography variant="h6" sx={{ fontSize: '1.0625rem' }}>
                {title}
            </Typography>
            {children}
        </Stack>
    );
}

/** Body paragraph for legal pages — slightly smaller than body1 with a generous line-height for readability. */
export function P({ children }: { children: React.ReactNode }) {
    return <Typography sx={{ fontSize: '0.9375rem', color: 'text.secondary', lineHeight: 1.75 }}>{children}</Typography>;
}

/** Unordered list wrapper for legal pages. */
export function Ul({ children }: { children: React.ReactNode }) {
    return (
        <Box component="ul" sx={{ m: 0, pl: 3, '& li': { mb: 0.5 } }}>
            {children}
        </Box>
    );
}

/** List item for legal pages — inherits P styling. */
export function Li({ children }: { children: React.ReactNode }) {
    return (
        <Typography component="li" sx={{ fontSize: '0.9375rem', color: 'text.secondary', lineHeight: 1.75 }}>
            {children}
        </Typography>
    );
}
