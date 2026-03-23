import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import useMediaQuery from '@mui/material/useMediaQuery';
import { Menu, PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { useAppSidebar } from '@/components/AppSidebarContext';
import Breadcrumbs from '@/components/Breadcrumbs';
import GlobalSearch from '@/components/GlobalSearch';
import NotificationBell from '@/components/NotificationBell';
import type { BreadcrumbItem } from '@/types';

interface AppSidebarHeaderProps {
    breadcrumbs?: BreadcrumbItem[];
}

export default function AppSidebarHeader({ breadcrumbs = [] }: AppSidebarHeaderProps) {
    const { open, setOpen, setMobileOpen } = useAppSidebar();
    const isMobile = useMediaQuery('(max-width:899px)');

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
                    {isMobile ? (
                        <IconButton size="small" onClick={() => setMobileOpen(true)} aria-label="Open sidebar">
                            <Menu size={20} />
                        </IconButton>
                    ) : (
                        <IconButton size="small" onClick={() => setOpen(!open)} aria-label={open ? 'Collapse sidebar' : 'Expand sidebar'}>
                            {open ? <PanelLeftClose size={20} /> : <PanelLeftOpen size={20} />}
                        </IconButton>
                    )}
                </Box>
                {breadcrumbs.length > 0 && <Breadcrumbs breadcrumbs={breadcrumbs} />}
            </Stack>
            <Stack direction="row" sx={{ alignItems: 'center' }}>
                <GlobalSearch />
                <NotificationBell />
            </Stack>
        </Box>
    );
}
