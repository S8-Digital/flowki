import { usePage } from '@inertiajs/react';
import Box from '@mui/material/Box';
import { styled } from '@mui/material/styles';
import * as React from 'react';
import { AppSidebarContext, SIDEBAR_COOKIE } from '@/components/AppSidebarContext';
import type { AppPageProps } from '@/types';

const SidebarShell = styled(Box)(({ theme }) => ({
    backgroundColor: theme.palette.background.default,
}));

interface AppShellProps {
    variant?: 'header' | 'sidebar';
    children: React.ReactNode;
}

export default function AppShell({ variant = 'sidebar', children }: AppShellProps) {
    const page = usePage<AppPageProps>();
    const [open, setOpenState] = React.useState(page.props.sidebarOpen);
    const [mobileOpen, setMobileOpen] = React.useState(false);

    const setOpen = React.useCallback((value: boolean) => {
        setOpenState(value);
        document.cookie = `${SIDEBAR_COOKIE}=${value}; path=/; max-age=${60 * 60 * 24 * 7}`;
    }, []);

    if (variant === 'header') {
        return <Box sx={{ display: 'flex', minHeight: '100vh', width: '100%', flexDirection: 'column' }}>{children}</Box>;
    }

    return (
        <AppSidebarContext.Provider value={{ open, setOpen, mobileOpen, setMobileOpen }}>
            <SidebarShell sx={{ display: 'flex', minHeight: '100vh' }}>{children}</SidebarShell>
        </AppSidebarContext.Provider>
    );
}
