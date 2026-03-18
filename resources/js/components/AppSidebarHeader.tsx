import Breadcrumbs from '@/components/Breadcrumbs';
import NotificationBell from '@/components/NotificationBell';
import { SidebarTrigger } from '@/components/ui/sidebar';
import type { BreadcrumbItem } from '@/types';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';

interface AppSidebarHeaderProps {
    breadcrumbs?: BreadcrumbItem[];
}

export default function AppSidebarHeader({ breadcrumbs = [] }: AppSidebarHeaderProps) {
    return (
        <Box
            component="header"
            sx={{
                display: 'flex',
                height: 64,
                flexShrink: 0,
                alignItems: 'center',
                gap: 1,
                borderBottom: '1px solid',
                borderColor: 'var(--sidebar-border)',
                px: 3,
            }}
        >
            <Stack direction="row" sx={{ flex: 1, alignItems: 'center', gap: 1 }}>
                <Box sx={{ ml: -1 }}>
                    <SidebarTrigger />
                </Box>
                {breadcrumbs.length > 0 && <Breadcrumbs breadcrumbs={breadcrumbs} />}
            </Stack>
            <Stack direction="row" sx={{ alignItems: 'center' }}>
                <NotificationBell />
            </Stack>
        </Box>
    );
}
