import { Head, useForm } from '@inertiajs/react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
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
                <Stack spacing={3}>
                    <HeadingSmall
                        title={`Profile for ${member.name}`}
                        description={`Manage profile settings for ${member.name}${member.role ? ` (${member.role})` : ''}.`}
                    />

                    {/* Profile Colour */}
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, borderRadius: '12px', border: 1, borderColor: 'divider', p: 2 }}>
                        <HeadingSmall
                            title="Profile Colour"
                            description={`Set a personal colour for ${member.name} that identifies their items across the app.`}
                        />
                        <Stack component="form" onSubmit={handleColorSubmit} spacing={2}>
                            <Box sx={{ display: 'grid', gap: 1 }}>
                                <Label htmlFor={`color-${member.id}`}>Colour</Label>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                    <Box
                                        component="input"
                                        id={`color-${member.id}`}
                                        type="color"
                                        sx={{
                                            height: 36,
                                            width: 56,
                                            cursor: 'pointer',
                                            borderRadius: 1,
                                            border: 1,
                                            borderColor: 'divider',
                                            bgcolor: 'background.default',
                                            p: 0.5,
                                        }}
                                        value={colorData.profile_color ?? '#6366f1'}
                                        onChange={(e) => setColorData('profile_color', e.target.value)}
                                        aria-label={`Pick colour for ${member.name}`}
                                    />
                                    <Typography component="span" variant="body2" sx={{ color: 'text.secondary' }}>
                                        {colorData.profile_color ? colorData.profile_color : 'No colour set'}
                                    </Typography>
                                    {colorData.profile_color && (
                                        <Box
                                            component="button"
                                            type="button"
                                            onClick={() => setColorData('profile_color', null)}
                                            sx={{
                                                fontSize: '0.75rem',
                                                color: 'text.secondary',
                                                textDecoration: 'underline',
                                                background: 'none',
                                                border: 'none',
                                                cursor: 'pointer',
                                                p: 0,
                                            }}
                                        >
                                            Clear
                                        </Box>
                                    )}
                                </Box>
                                <InputError message={colorErrors.profile_color} />
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Button type="submit" disabled={colorProcessing}>
                                    {colorProcessing ? 'Saving…' : 'Save colour'}
                                </Button>
                                {colorRecentlySuccessful && (
                                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                        Colour saved.
                                    </Typography>
                                )}
                            </Box>
                        </Stack>
                    </Box>
                </Stack>
            </MemberSettingsLayout>
        </AppLayout>
    );
}
