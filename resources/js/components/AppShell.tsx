import { SidebarProvider } from '@/components/ui/sidebar';
import type { AppPageProps } from '@/types';
import { usePage } from '@inertiajs/react';
import Box from '@mui/material/Box';

interface AppShellProps {
    variant?: 'header' | 'sidebar';
    children: React.ReactNode;
}

export default function AppShell({ variant = 'sidebar', children }: AppShellProps) {
    const page = usePage<AppPageProps>();

    if (variant === 'header') {
        return <Box sx={{ display: 'flex', minHeight: '100vh', width: '100%', flexDirection: 'column' }}>{children}</Box>;
    }

    return <SidebarProvider defaultOpen={page.props.sidebarOpen}>{children}</SidebarProvider>;
}
