import { update as colorUpdate } from '@/actions/App/Http/Controllers/Settings/MemberColorController';
import { edit as permissionEdit, update as permissionUpdate } from '@/actions/App/Http/Controllers/Settings/PermissionController';
import HeadingSmall from '@/components/HeadingSmall';
import InputError from '@/components/InputError';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import UserPermissionsPanel from '@/components/UserPermissionsPanel';
import AppLayout from '@/layouts/AppLayout';
import SettingsLayout from '@/layouts/settings/Layout';
import type { BreadcrumbItem, PermissionGroup } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import { useState } from 'react';

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
        { title: `${member.name} Permissions`, href: permissionEdit({ user: member.id }).url },
    ];

    const initialGranted = member.permissionGroups.flatMap((g) => g.permissions.filter((p) => p.granted).map((p) => p.name));

    const [grantedPermissions, setGrantedPermissions] = useState<string[]>(initialGranted);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    const {
        patch: patchColor,
        data: colorData,
        setData: setColorData,
        processing: colorProcessing,
        errors: colorErrors,
        recentlySuccessful: colorRecentlySuccessful,
    } = useForm({
        profile_color: member.profile_color ?? '',
    });

    function handleColorSubmit(e: React.FormEvent) {
        e.preventDefault();
        patchColor(colorUpdate({ user: member.id }).url, { preserveScroll: true });
    }

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
            <SettingsLayout>
                <div className="space-y-6">
                    <HeadingSmall
                        title={`Permissions for ${member.name}`}
                        description={`Manage individual permissions for ${member.name}${member.role ? ` (${member.role})` : ''}. These override their role's default permissions.`}
                    />

                    {/* Profile Colour */}
                    <div className="space-y-4 rounded-lg border p-4">
                        <HeadingSmall
                            title="Profile Colour"
                            description={`Set a personal colour for ${member.name} that identifies their items across the app.`}
                        />
                        <form onSubmit={handleColorSubmit} className="space-y-4">
                            <div className="grid gap-2">
                                <Label htmlFor={`color-${member.id}`}>Colour</Label>
                                <div className="flex items-center gap-3">
                                    <input
                                        id={`color-${member.id}`}
                                        type="color"
                                        className="h-9 w-14 cursor-pointer rounded-md border bg-background p-1"
                                        value={colorData.profile_color || '#6366f1'}
                                        onChange={(e) => setColorData('profile_color', e.target.value)}
                                        aria-label={`Pick colour for ${member.name}`}
                                    />
                                    <span className="text-sm text-muted-foreground">
                                        {colorData.profile_color ? colorData.profile_color : 'No colour set'}
                                    </span>
                                    {colorData.profile_color && (
                                        <button
                                            type="button"
                                            className="text-xs text-muted-foreground underline"
                                            onClick={() => setColorData('profile_color', '')}
                                        >
                                            Clear
                                        </button>
                                    )}
                                </div>
                                <InputError message={colorErrors.profile_color} />
                            </div>
                            <div className="flex items-center gap-4">
                                <Button type="submit" disabled={colorProcessing}>
                                    {colorProcessing ? 'Saving…' : 'Save colour'}
                                </Button>
                                {colorRecentlySuccessful && <p className="text-sm text-muted-foreground">Colour saved.</p>}
                            </div>
                        </form>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <UserPermissionsPanel
                            permissionGroups={member.permissionGroups}
                            grantedPermissions={grantedPermissions}
                            onChange={handlePermissionChange}
                        />

                        <div className="flex items-center gap-4">
                            <Button type="submit" disabled={saving}>
                                {saving ? 'Saving…' : 'Save permissions'}
                            </Button>
                            {saved && <p className="text-sm text-muted-foreground">Permissions saved.</p>}
                        </div>
                    </form>
                </div>
            </SettingsLayout>
        </AppLayout>
    );
}
