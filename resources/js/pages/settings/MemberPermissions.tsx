import { Head, useForm } from '@inertiajs/react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useState } from 'react';
import HeadingSmall from '@/components/HeadingSmall';
import { Button } from '@/components/ui/button';
import UserPermissionsPanel from '@/components/UserPermissionsPanel';
import AppLayout from '@/layouts/AppLayout';
import MemberSettingsLayout from '@/layouts/settings/MemberLayout';
import type { BreadcrumbItem, PermissionGroup } from '@/types';
import { edit as memberProfileEdit } from '@/actions/App/Http/Controllers/Settings/MemberProfileController';
import { edit as permissionEdit, update as permissionUpdate } from '@/actions/App/Http/Controllers/Settings/PermissionController';

interface Member {
    id: number;
    name: string;
    role: string | null;
    profile_color: string | null;
    permissionGroups: PermissionGroup[];
}

interface Props {
    member: Member;
}

export default function MemberPermissions({ member }: Props) {
    const breadcrumbItems: BreadcrumbItem[] = [
        { title: 'Family', href: '/family' },
        { title: `${member.name} Settings`, href: memberProfileEdit({ user: member.id }).url },
        { title: 'Permissions', href: permissionEdit({ user: member.id }).url },
    ];

    const initialGranted = member.permissionGroups.flatMap((g) => g.permissions.filter((p) => p.granted).map((p) => p.name));

    const [grantedPermissions, setGrantedPermissions] = useState<string[]>(initialGranted);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    const { put } = useForm();

    function handlePermissionChange(permission: string, granted: boolean) {
        setGrantedPermissions((prev) => (granted ? [...prev, permission] : prev.filter((p) => p !== permission)));
    }

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setSaving(true);

        put(permissionUpdate({ user: member.id }).url, {
            data: { permissions: grantedPermissions },
            preserveScroll: true,
            onSuccess: () => {
                setSaved(true);
                setTimeout(() => setSaved(false), 2000);
            },
            onFinish: () => setSaving(false),
        } as Parameters<typeof put>[1]);
    }

    return (
        <AppLayout breadcrumbs={breadcrumbItems}>
            <Head title={`${member.name} Permissions`} />
            <MemberSettingsLayout member={member}>
                <Stack spacing={3}>
                    <HeadingSmall
                        title={`Permissions for ${member.name}`}
                        description={`Manage individual permissions for ${member.name}${member.role ? ` (${member.role})` : ''}. These override their role's default permissions.`}
                    />

                    <Stack component="form" onSubmit={handleSubmit} spacing={3}>
                        <UserPermissionsPanel
                            permissionGroups={member.permissionGroups}
                            grantedPermissions={grantedPermissions}
                            onChange={handlePermissionChange}
                        />

                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Button type="submit" disabled={saving}>
                                {saving ? 'Saving…' : 'Save permissions'}
                            </Button>
                            {saved && (
                                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                    Permissions saved.
                                </Typography>
                            )}
                        </Box>
                    </Stack>
                </Stack>
            </MemberSettingsLayout>
        </AppLayout>
    );
}
