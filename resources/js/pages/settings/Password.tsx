import { Head, useForm } from '@inertiajs/react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { update } from '@/actions/App/Http/Controllers/Settings/PasswordController';
import HeadingSmall from '@/components/HeadingSmall';
import InputError from '@/components/InputError';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/AppLayout';
import SettingsLayout from '@/layouts/settings/Layout';
import type { BreadcrumbItem } from '@/types';

const breadcrumbItems: BreadcrumbItem[] = [{ title: 'Password settings', href: '/settings/password' }];

export default function Password() {
    const { data, setData, put, processing, errors, reset, recentlySuccessful } = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        put(update().url, {
            preserveScroll: true,
            onSuccess: () => reset(),
            onError: () => reset('password', 'password_confirmation'),
        });
    }

    return (
        <AppLayout breadcrumbs={breadcrumbItems}>
            <Head title="Password settings" />
            <SettingsLayout>
                <Stack spacing={3}>
                    <HeadingSmall title="Update password" description="Ensure your account is using a long, random password to stay secure" />
                    <Stack component="form" onSubmit={handleSubmit} spacing={3}>
                        <Box sx={{ display: 'grid', gap: 1 }}>
                            <Label htmlFor="current_password">Current password</Label>
                            <Input
                                id="current_password"
                                type="password"
                                value={data.current_password}
                                onChange={(e) => setData('current_password', e.target.value)}
                                autoComplete="current-password"
                                placeholder="Current password"
                            />
                            <InputError message={errors.current_password} />
                        </Box>
                        <Box sx={{ display: 'grid', gap: 1 }}>
                            <Label htmlFor="password">New password</Label>
                            <Input
                                id="password"
                                type="password"
                                value={data.password}
                                onChange={(e) => setData('password', e.target.value)}
                                autoComplete="new-password"
                                placeholder="New password"
                            />
                            <InputError message={errors.password} />
                        </Box>
                        <Box sx={{ display: 'grid', gap: 1 }}>
                            <Label htmlFor="password_confirmation">Confirm password</Label>
                            <Input
                                id="password_confirmation"
                                type="password"
                                value={data.password_confirmation}
                                onChange={(e) => setData('password_confirmation', e.target.value)}
                                autoComplete="new-password"
                                placeholder="Confirm password"
                            />
                            <InputError message={errors.password_confirmation} />
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Button type="submit" disabled={processing}>
                                Save password
                            </Button>
                            {recentlySuccessful && (
                                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                    Saved.
                                </Typography>
                            )}
                        </Box>
                    </Stack>
                </Stack>
            </SettingsLayout>
        </AppLayout>
    );
}
