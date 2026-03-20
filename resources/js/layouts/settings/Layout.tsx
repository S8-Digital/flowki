import { Link } from '@inertiajs/react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import type { PropsWithChildren } from 'react';
import Heading from '@/components/Heading';
import { Separator } from '@/components/ui/separator';
import { toUrl, urlIsActive } from '@/lib/utils';
import { appearance } from '@/routes';
import type { NavItem } from '@/types';

const sidebarNavItems: NavItem[] = [
    { title: 'Profile', href: '/settings/profile' },
    { title: 'Password', href: '/settings/password' },
    { title: 'Appearance', href: appearance() },
    { title: 'Categories', href: '/settings/categories' },
    { title: 'Notifications', href: '/settings/notifications' },
];

export default function SettingsLayout({ children }: PropsWithChildren) {
    const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';
    const activeItem = sidebarNavItems.find((item) => urlIsActive(item.href, currentPath));
    const activeTab = activeItem ? toUrl(activeItem.href) : false;

    return (
        <Box sx={{ px: 2, py: 3 }}>
            <Heading title="Settings" description="Manage your profile and account settings" />

            <Stack direction={{ xs: 'column', lg: 'row' }} spacing={{ lg: 6 }}>
                <Box component="aside" sx={{ width: '100%', maxWidth: { xs: 576, lg: 192 } }}>
                    <Tabs
                        orientation="vertical"
                        value={activeTab}
                        sx={{
                            borderRight: 0,
                            '& .MuiTab-root': {
                                alignItems: 'flex-start',
                                textTransform: 'none',
                                minHeight: 40,
                                px: 1.5,
                                py: 1,
                                fontSize: '0.875rem',
                            },
                            '& .MuiTabs-indicator': {
                                left: 0,
                                right: 'auto',
                                width: 3,
                                borderRadius: 1,
                            },
                        }}
                    >
                        {sidebarNavItems.map((item) => (
                            <Tab key={toUrl(item.href)} label={item.title} value={toUrl(item.href)} component={Link} href={item.href} />
                        ))}
                    </Tabs>
                </Box>

                <Box sx={{ display: { xs: 'block', lg: 'none' }, my: 3 }}>
                    <Separator />
                </Box>

                <Box sx={{ flex: 1, maxWidth: { md: 672 } }}>
                    <Box component="section" sx={{ maxWidth: 576 }}>
                        <Stack spacing={6}>{children}</Stack>
                    </Box>
                </Box>
            </Stack>
        </Box>
    );
}
