import Heading from '@/components/Heading';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { toUrl, urlIsActive } from '@/lib/utils';
import { appearance } from '@/routes';
import type { NavItem } from '@/types';
import { Link } from '@inertiajs/react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import type { PropsWithChildren } from 'react';

const sidebarNavItems: NavItem[] = [
    { title: 'Profile', href: '/settings/profile' },
    { title: 'Password', href: '/settings/password' },
    { title: 'Appearance', href: appearance() },
    { title: 'Categories', href: '/settings/categories' },
    { title: 'Notifications', href: '/settings/notifications' },
];

export default function SettingsLayout({ children }: PropsWithChildren) {
    const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';

    return (
        <Box sx={{ px: 2, py: 3 }}>
            <Heading title="Settings" description="Manage your profile and account settings" />

            <Stack direction={{ xs: 'column', lg: 'row' }} spacing={{ lg: 6 }}>
                <Box component="aside" sx={{ width: '100%', maxWidth: { xs: 576, lg: 192 } }}>
                    <Stack component="nav" direction="column" spacing={0.5}>
                        {sidebarNavItems.map((item) => (
                            <Button
                                key={toUrl(item.href)}
                                variant="ghost"
                                style={{
                                    width: '100%',
                                    justifyContent: 'flex-start',
                                    backgroundColor: urlIsActive(item.href, currentPath) ? 'var(--muted)' : undefined,
                                }}
                                asChild
                            >
                                <Link href={item.href}>{item.title}</Link>
                            </Button>
                        ))}
                    </Stack>
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
