import { SIDEBAR_COLLAPSED_WIDTH, SIDEBAR_WIDTH, useAppSidebar } from '@/components/AppSidebarContext';
import Box from '@mui/material/Box';
import useMediaQuery from '@mui/material/useMediaQuery';
interface AppContentProps {
    variant?: 'header' | 'sidebar';
    className?: string;
    children: React.ReactNode;
}

export default function AppContent({ variant = 'sidebar', className, children }: AppContentProps) {
    const { open } = useAppSidebar();
    const isMobile = useMediaQuery('(max-width:899px)');

    if (variant === 'sidebar') {
        const marginLeft = isMobile ? 0 : open ? SIDEBAR_WIDTH : SIDEBAR_COLLAPSED_WIDTH;

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
                    ml: `${marginLeft}px`,
                    transition: 'margin-left 0.2s ease',
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
            }}
        >
            {children}
        </Box>
    );
}
