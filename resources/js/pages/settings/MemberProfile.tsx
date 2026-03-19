import { Head, useForm } from '@inertiajs/react';
import { update as colorUpdate } from '@/actions/App/Http/Controllers/Settings/MemberColorController';
import { edit as memberProfileEdit } from '@/actions/App/Http/Controllers/Settings/MemberProfileController';
import HeadingSmall from '@/components/HeadingSmall';
import InputError from '@/components/InputError';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/AppLayout';
import MemberSettingsLayout from '@/layouts/settings/MemberLayout';
import type { BreadcrumbItem } from '@/types';

interface Member {
    id: number;
    name: string;
    role: string | null;
    profile_color: string | null;
}

interface Props {
    member: Member;
}

export default function MemberProfile({ member }: Props) {
    const breadcrumbItems: BreadcrumbItem[] = [
        { title: 'Family', href: '/family' },
        { title: `${member.name} Settings`, href: memberProfileEdit({ user: member.id }).url },
    ];

    const {
        patch: patchColor,
        data: colorData,
        setData: setColorData,
        processing: colorProcessing,
        errors: colorErrors,
        recentlySuccessful: colorRecentlySuccessful,
    } = useForm<{ profile_color: string | null }>({
        profile_color: member.profile_color ?? null,
    });

    function handleColorSubmit(e: React.FormEvent) {
        e.preventDefault();
        patchColor(colorUpdate({ user: member.id }).url, { preserveScroll: true });
    }

    return (
        <AppLayout breadcrumbs={breadcrumbItems}>
            <Head title={`${member.name} Profile`} />
            <MemberSettingsLayout member={member}>
                <div className="space-y-6">
                    <HeadingSmall
                        title={`Profile for ${member.name}`}
                        description={`Manage profile settings for ${member.name}${member.role ? ` (${member.role})` : ''}.`}
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
                                        value={colorData.profile_color ?? '#6366f1'}
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
                                            onClick={() => setColorData('profile_color', null)}
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
                </div>
            </MemberSettingsLayout>
        </AppLayout>
    );
}
