import { Head, useForm } from '@inertiajs/react';
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
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <HeadingSmall title="Notification preferences" description="Choose how you'd like to receive notifications." />

                        <div className="space-y-4">
                            <div className="flex items-center justify-between rounded-lg border p-4">
                                <div className="flex items-center gap-3">
                                    <Mail className="size-5 text-muted-foreground" />
                                    <div>
                                        <Label htmlFor="email-notifications" className="text-sm font-medium">
                                            Email notifications
                                        </Label>
                                        <p className="text-xs text-muted-foreground">
                                            Receive notifications via email when items are assigned or completed.
                                        </p>
                                    </div>
                                </div>
                                <Switch id="email-notifications" checked={data.email} onCheckedChange={(checked) => setData('email', checked)} />
                            </div>
                            <InputError message={errors.email} />

                            <div className="flex items-center justify-between rounded-lg border p-4">
                                <div className="flex items-center gap-3">
                                    <Bell className="size-5 text-muted-foreground" />
                                    <div>
                                        <Label htmlFor="push-notifications" className="text-sm font-medium">
                                            Push notifications
                                        </Label>
                                        <p className="text-xs text-muted-foreground">
                                            Receive push notifications on your devices when items are assigned or completed.
                                        </p>
                                    </div>
                                </div>
                                <Switch id="push-notifications" checked={data.push} onCheckedChange={(checked) => setData('push', checked)} />
                            </div>
                            <InputError message={errors.push} />
                        </div>

                        <div className="flex items-center gap-4">
                            <Button type="submit" disabled={processing}>
                                Save preferences
                            </Button>
                            {recentlySuccessful && <p className="text-sm text-muted-foreground">Saved.</p>}
                        </div>
                    </form>
                </SettingsLayout>
            </AppLayout>
        </>
    );
}
