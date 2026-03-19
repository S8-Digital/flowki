import type { SxProps, Theme } from '@mui/material/styles';
import Box from '@mui/material/Box';

interface AppContentProps {
    variant?: 'header' | 'sidebar';
    className?: string;
    sx?: SxProps<Theme>;
    children: React.ReactNode;
}

export default function AppContent({ variant = 'sidebar', className, sx, children }: AppContentProps) {
    if (variant === 'sidebar') {
        return (
            <Box
                component="main"
                className={className}
                sx={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    minWidth: 0,
                    minHeight: '100vh',
                    ...sx,
                }}
            >
                {children}
            </Box>
        );
    }

    return (
        <Box
            component="main"
            className={className}
            sx={{
                mx: 'auto',
                display: 'flex',
                height: '100%',
                width: '100%',
                maxWidth: 1280,
                flex: 1,
                flexDirection: 'column',
                gap: 2,
                borderRadius: '0.75rem',
                ...sx,
            }}
        >
            {children}
        </Box>
    );
}
