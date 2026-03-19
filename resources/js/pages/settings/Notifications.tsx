import { Head, useForm } from '@inertiajs/react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Bell, Mail } from 'lucide-react';
import HeadingSmall from '@/components/HeadingSmall';
import InputError from '@/components/InputError';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import AppLayout from '@/layouts/AppLayout';
import SettingsLayout from '@/layouts/settings/Layout';
import type { BreadcrumbItem } from '@/types';

interface Props {
    preferences: {
        email: boolean;
        push: boolean;
    };
}

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Notification settings', href: '/settings/notifications' }];

export default function NotificationSettings({ preferences }: Props) {
    const { data, setData, put, processing, recentlySuccessful, errors } = useForm({
        email: preferences.email,
        push: preferences.push,
    });

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        put('/settings/notifications', { preserveScroll: true });
    }

    return (
        <>
            <Head title="Notification Settings" />
            <AppLayout breadcrumbs={breadcrumbs}>
                <SettingsLayout>
                    <Stack component="form" onSubmit={handleSubmit} spacing={3}>
                        <HeadingSmall title="Notification preferences" description="Choose how you'd like to receive notifications." />

                        <Stack spacing={2}>
                            <Box
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    borderRadius: '12px',
                                    border: 1,
                                    borderColor: 'divider',
                                    p: 2,
                                }}
                            >
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                    <Mail className="size-5 text-muted-foreground" />
                                    <Box>
                                        <Label htmlFor="email-notifications" className="text-sm font-medium">
                                            Email notifications
                                        </Label>
                                        <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                                            Receive notifications via email when items are assigned or completed.
                                        </Typography>
                                    </Box>
                                </Box>
                                <Switch id="email-notifications" checked={data.email} onCheckedChange={(checked) => setData('email', checked)} />
                            </Box>
                            <InputError message={errors.email} />

                            <Box
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    borderRadius: '12px',
                                    border: 1,
                                    borderColor: 'divider',
                                    p: 2,
                                }}
                            >
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                    <Bell className="size-5 text-muted-foreground" />
                                    <Box>
                                        <Label htmlFor="push-notifications" className="text-sm font-medium">
                                            Push notifications
                                        </Label>
                                        <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                                            Receive push notifications on your devices when items are assigned or completed.
                                        </Typography>
                                    </Box>
                                </Box>
                                <Switch id="push-notifications" checked={data.push} onCheckedChange={(checked) => setData('push', checked)} />
                            </Box>
                            <InputError message={errors.push} />
                        </Stack>

                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Button type="submit" disabled={processing}>
                                Save preferences
                            </Button>
                            {recentlySuccessful && (
                                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                    Saved.
                                </Typography>
                            )}
                        </Box>
                    </Stack>
                </SettingsLayout>
            </AppLayout>
        </>
    );
}
