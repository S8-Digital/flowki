import { update } from '@/actions/App/Http/Controllers/Settings/ProfileController';
import DeleteUser from '@/components/DeleteUser';
import HeadingSmall from '@/components/HeadingSmall';
import InputError from '@/components/InputError';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/AppLayout';
import SettingsLayout from '@/layouts/settings/Layout';
import { link, unlink } from '@/routes/social';
import { send } from '@/routes/verification';
import type { BreadcrumbItem } from '@/types';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { CalendarCheck, CalendarX, CheckCircle2, Link2, Link2Off } from 'lucide-react';

interface Props {
    mustVerifyEmail: boolean;
    status?: string;
    hasGoogleCalendarConnected: boolean;
}

const breadcrumbItems: BreadcrumbItem[] = [{ title: 'Profile settings', href: '/settings/profile' }];

const socialProviders = [
    { key: 'google', label: 'Google' },
    { key: 'apple', label: 'Apple' },
] as const;

export default function Profile({ mustVerifyEmail, status, hasGoogleCalendarConnected }: Props) {
    const page = usePage<{
        auth: {
            user: { id: number; name: string; email: string; email_verified_at: string | null };
            connectedProviders: string[];
            hasPasswordSet: boolean;
        };
    }>();
    const user = page.props.auth.user;
    const connectedProviders = page.props.auth.connectedProviders;
    const hasPasswordSet = page.props.auth.hasPasswordSet;

    const { data, setData, patch, processing, errors, recentlySuccessful } = useForm({ name: user.name, email: user.email });

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        patch(update().url, { preserveScroll: true });
    }

    function connectGoogleCalendar() {
        router.visit('/auth/google/calendar');
    }

    function disconnectGoogleCalendar() {
        if (!confirm('Disconnect Google Calendar? Future todos and chores will no longer sync.')) {
            return;
        }

        router.delete('/auth/google/calendar');
    }

    function linkProvider(providerKey: string) {
        router.visit(link(providerKey).url);
    }

    function unlinkProvider(providerKey: string) {
        const remaining = connectedProviders.length;

        if (remaining <= 1 && !hasPasswordSet) {
            alert('You cannot unlink your only sign-in method. Please set a password first.');

            return;
        }

        if (!confirm(`Unlink your ${providerKey.charAt(0).toUpperCase() + providerKey.slice(1)} account?`)) {
            return;
        }

        router.delete(unlink(providerKey).url);
    }

    return (
        <AppLayout breadcrumbs={breadcrumbItems}>
            <Head title="Profile settings" />
            <SettingsLayout>
                <div className="flex flex-col space-y-6">
                    <HeadingSmall title="Profile information" description="Update your name and email address" />
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid gap-2">
                            <Label htmlFor="name">Name</Label>
                            <Input
                                id="name"
                                className="mt-1 block w-full"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                required
                                autoComplete="name"
                                placeholder="Full name"
                            />
                            <InputError className="mt-2" message={errors.name} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="email">Email address</Label>
                            <Input
                                id="email"
                                type="email"
                                className="mt-1 block w-full"
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                                required
                                autoComplete="username"
                                placeholder="Email address"
                            />
                            <InputError className="mt-2" message={errors.email} />
                        </div>
                        {mustVerifyEmail && !user.email_verified_at && (
                            <div>
                                <p className="-mt-4 text-sm text-muted-foreground">
                                    Your email address is unverified.{' '}
                                    <Link
                                        href={send()}
                                        as="button"
                                        className="text-foreground underline decoration-neutral-300 underline-offset-4 transition-colors duration-300 ease-out hover:decoration-current! dark:decoration-neutral-500"
                                    >
                                        Click here to re-send the verification email.
                                    </Link>
                                </p>
                                {status === 'verification-link-sent' && (
                                    <p className="mt-2 text-sm font-medium text-green-600">
                                        A new verification link has been sent to your email address.
                                    </p>
                                )}
                            </div>
                        )}
                        <div className="flex items-center gap-4">
                            <Button disabled={processing}>Save</Button>
                            {recentlySuccessful && <p className="text-sm text-neutral-600">Saved.</p>}
                        </div>
                    </form>
                </div>

                {/* Social Accounts */}
                <div className="flex flex-col space-y-6">
                    <HeadingSmall title="Social accounts" description="Connect social accounts to enable social login" />
                    <div className="space-y-3">
                        {socialProviders.map((provider) => (
                            <div key={provider.key} className="flex items-center justify-between rounded-lg border p-3">
                                <div className="flex items-center gap-3">
                                    <div className="flex size-8 items-center justify-center rounded-full bg-muted">
                                        {provider.key === 'google' ? (
                                            <svg className="size-4" viewBox="0 0 24 24" aria-hidden="true">
                                                <path
                                                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                                    fill="#4285F4"
                                                />
                                                <path
                                                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                                    fill="#34A853"
                                                />
                                                <path
                                                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                                                    fill="#FBBC05"
                                                />
                                                <path
                                                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                                    fill="#EA4335"
                                                />
                                            </svg>
                                        ) : (
                                            <svg className="size-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                                                <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701" />
                                            </svg>
                                        )}
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium">{provider.label}</p>
                                        {connectedProviders.includes(provider.key) ? (
                                            <p className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
                                                <CheckCircle2 className="size-3" /> Connected
                                            </p>
                                        ) : (
                                            <p className="text-xs text-muted-foreground">Not connected</p>
                                        )}
                                    </div>
                                </div>
                                {connectedProviders.includes(provider.key) ? (
                                    <Button variant="outline" size="sm" onClick={() => unlinkProvider(provider.key)}>
                                        <Link2Off className="mr-1.5 size-4" /> Unlink
                                    </Button>
                                ) : (
                                    <Button size="sm" variant="outline" onClick={() => linkProvider(provider.key)}>
                                        <Link2 className="mr-1.5 size-4" /> Connect
                                    </Button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Google Calendar */}
                <div className="flex flex-col space-y-6">
                    <HeadingSmall title="Google Calendar" description="Sync your assigned todos and chores to your personal Google Calendar." />
                    <div className="rounded-lg border p-4">
                        {hasGoogleCalendarConnected ? (
                            <div className="flex items-center justify-between gap-4">
                                <div className="flex items-center gap-3">
                                    <div className="flex size-9 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                                        <CalendarCheck className="size-5 text-green-600 dark:text-green-400" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium">Connected</p>
                                        <p className="text-xs text-muted-foreground">Todos and chores assigned to you will sync automatically.</p>
                                    </div>
                                </div>
                                <Button variant="outline" size="sm" onClick={disconnectGoogleCalendar}>
                                    <CalendarX className="mr-1.5 size-4" /> Disconnect
                                </Button>
                            </div>
                        ) : (
                            <div className="flex items-center justify-between gap-4">
                                <div className="flex items-center gap-3">
                                    <div className="flex size-9 items-center justify-center rounded-full bg-muted">
                                        <CalendarX className="size-5 text-muted-foreground" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium">Not connected</p>
                                        <p className="text-xs text-muted-foreground">Connect to sync your assigned todos and chores.</p>
                                    </div>
                                </div>
                                <Button size="sm" onClick={connectGoogleCalendar}>
                                    <CalendarCheck className="mr-1.5 size-4" /> Connect Google Calendar
                                </Button>
                            </div>
                        )}
                        {status === 'google-calendar-connected' && (
                            <div className="mt-3 text-sm font-medium text-green-600">Google Calendar connected successfully!</div>
                        )}
                        {status === 'google-calendar-disconnected' && (
                            <div className="mt-3 text-sm text-muted-foreground">Google Calendar has been disconnected.</div>
                        )}
                    </div>
                </div>

                <DeleteUser />
            </SettingsLayout>
        </AppLayout>
    );
}
