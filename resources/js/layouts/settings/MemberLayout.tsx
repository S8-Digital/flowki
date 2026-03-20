import { Link, usePage } from '@inertiajs/react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import type { PropsWithChildren } from 'react';
import { edit as memberProfileEdit } from '@/actions/App/Http/Controllers/Settings/MemberProfileController';
import { edit as permissionsEdit } from '@/actions/App/Http/Controllers/Settings/PermissionController';
import Heading from '@/components/Heading';
import { Separator } from '@/components/ui/separator';
import { urlIsActive } from '@/lib/utils';
import type { NavItem } from '@/types';

interface Member {
    id: number;
    name: string;
}

interface Props extends PropsWithChildren {
    member: Member;
}

export default function MemberSettingsLayout({ member, children }: Props) {
    const { url } = usePage();

    const sidebarNavItems: NavItem[] = [
        { title: 'Profile', href: memberProfileEdit({ user: member.id }).url },
        { title: 'Permissions', href: permissionsEdit({ user: member.id }).url },
    ];

    const activeItem = sidebarNavItems.find((item) => urlIsActive(item.href, url));
    const activeTab = activeItem ? (typeof activeItem.href === 'string' ? activeItem.href : activeItem.href.url) : false;

    return (
        <Box sx={{ px: 2, py: 3 }}>
            <Heading title={`${member.name} Settings`} description={`Manage settings for ${member.name}`} />

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
                        {sidebarNavItems.map((item) => {
                            const hrefString = typeof item.href === 'string' ? item.href : item.href.url;

                            return <Tab key={hrefString} label={item.title} value={hrefString} component={Link} href={item.href} />;
                        })}
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
