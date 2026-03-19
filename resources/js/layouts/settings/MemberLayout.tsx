import { Link, usePage } from '@inertiajs/react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import type { PropsWithChildren } from 'react';
import { edit as memberProfileEdit } from '@/actions/App/Http/Controllers/Settings/MemberProfileController';
import { edit as permissionsEdit } from '@/actions/App/Http/Controllers/Settings/PermissionController';
import Heading from '@/components/Heading';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { toUrl, urlIsActive } from '@/lib/utils';
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

    return (
        <Box sx={{ px: 2, py: 3 }}>
            <Heading title={`${member.name} Settings`} description={`Manage settings for ${member.name}`} />

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
                                    backgroundColor: urlIsActive(item.href, url) ? 'var(--muted)' : undefined,
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
