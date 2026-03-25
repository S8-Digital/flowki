import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { CalendarCheck, CalendarX, CheckCircle2, Copy, Link2, Link2Off, Mail } from 'lucide-react';
import { useState } from 'react';
import { update } from '@/actions/App/Http/Controllers/Settings/ProfileController';
import DeleteUser from '@/components/DeleteUser';
import HeadingSmall from '@/components/HeadingSmall';
import InputError from '@/components/InputError';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import AppLayout from '@/layouts/AppLayout';
import SettingsLayout from '@/layouts/settings/Layout';
import { link, unlink } from '@/routes/social';
import { send } from '@/routes/verification';
import type { BreadcrumbItem } from '@/types';

interface Props {
    mustVerifyEmail: boolean;
    status?: string;
    hasGoogleCalendarConnected: boolean;
    inboundEmailAddress?: string | null;
}

const breadcrumbItems: BreadcrumbItem[] = [{ title: 'Profile settings', href: '/settings/profile' }];

const socialProviders = [
    { key: 'google', label: 'Google' },
    { key: 'apple', label: 'Apple' },
] as const;

export default function Profile({ mustVerifyEmail, status, hasGoogleCalendarConnected, inboundEmailAddress }: Props) {
    const [copied, setCopied] = useState(false);

    function copyInboundEmail() {
        if (!inboundEmailAddress) {
            return;
        }

        navigator.clipboard.writeText(inboundEmailAddress).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    }

    const page = usePage<{
        auth: {
            user: { id: number; name: string; email: string; profile_color?: string | null; email_verified_at: string | null };
            connectedProviders: string[];
            hasPasswordSet: boolean;
        };
    }>();
    const user = page.props.auth.user;
    const connectedProviders = page.props.auth.connectedProviders;
    const hasPasswordSet = page.props.auth.hasPasswordSet;

    const { data, setData, patch, processing, errors, recentlySuccessful } = useForm({
        name: user.name,
        email: user.email,
        profile_color: user.profile_color ?? '',
    });

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
                <Stack spacing={3}>
                    <HeadingSmall title="Profile information" description="Update your name and email address" />
                    <Stack component="form" onSubmit={handleSubmit} spacing={3}>
                        <Box sx={{ display: 'grid', gap: 1 }}>
                            <Input
                                id="name"
                                label="Name"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                required
                                autoComplete="name"
                                placeholder="Full name"
                            />
                            <InputError className="mt-2" message={errors.name} />
                        </Box>
                        <Box sx={{ display: 'grid', gap: 1 }}>
                            <Input
                                id="email"
                                type="email"
                                label="Email address"
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                                required
                                autoComplete="username"
                                placeholder="Email address"
                            />
                            <InputError className="mt-2" message={errors.email} />
                        </Box>
                        <Box sx={{ display: 'grid', gap: 1 }}>
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                Profile Colour
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                <Box
                                    component="input"
                                    id="profile_color"
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
                                    value={data.profile_color || '#6366f1'}
                                    onChange={(e) => setData('profile_color', e.target.value)}
                                    aria-label="Pick your profile colour"
                                />
                                <Typography component="span" variant="body2" color="text.secondary">
                                    {data.profile_color ? data.profile_color : 'No colour set'}
                                </Typography>
                                {data.profile_color && (
                                    <Box
                                        component="button"
                                        type="button"
                                        sx={{
                                            fontSize: '0.75rem',
                                            color: 'text.secondary',
                                            textDecoration: 'underline',
                                            background: 'none',
                                            border: 'none',
                                            cursor: 'pointer',
                                            p: 0,
                                        }}
                                        onClick={() => setData('profile_color', '')}
                                    >
                                        Clear
                                    </Box>
                                )}
                            </Box>
                            <InputError className="mt-2" message={errors.profile_color} />
                        </Box>
                        {mustVerifyEmail && !user.email_verified_at && (
                            <Box>
                                <Typography variant="body2" sx={{ mt: -2, color: 'text.secondary' }}>
                                    Your email address is unverified.{' '}
                                    <Link
                                        href={send()}
                                        as="button"
                                        className="text-foreground underline decoration-neutral-300 underline-offset-4 transition-colors duration-300 ease-out hover:decoration-current! dark:decoration-neutral-500"
                                    >
                                        Click here to re-send the verification email.
                                    </Link>
                                </Typography>
                                {status === 'verification-link-sent' && (
                                    <Typography variant="body2" sx={{ mt: 1, fontWeight: 500, color: 'success.main' }}>
                                        A new verification link has been sent to your email address.
                                    </Typography>
                                )}
                            </Box>
                        )}
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Button disabled={processing}>Save</Button>
                            {recentlySuccessful && (
                                <Typography variant="body2" color="text.secondary">
                                    Saved.
                                </Typography>
                            )}
                        </Box>
                    </Stack>
                </Stack>

                {/* Social Accounts */}
                <Stack spacing={3}>
                    <HeadingSmall title="Social accounts" description="Connect social accounts to enable social login" />
                    <Stack spacing={1.5}>
                        {socialProviders.map((provider) => (
                            <Box
                                key={provider.key}
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    borderRadius: '12px',
                                    border: 1,
                                    borderColor: 'divider',
                                    p: 1.5,
                                }}
                            >
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                    <Box
                                        sx={{
                                            display: 'flex',
                                            width: 32,
                                            height: 32,
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            borderRadius: '50%',
                                            bgcolor: 'action.hover',
                                        }}
                                    >
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
                                    </Box>
                                    <Box>
                                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                            {provider.label}
                                        </Typography>
                                        {connectedProviders.includes(provider.key) ? (
                                            <Typography
                                                variant="caption"
                                                sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'success.main' }}
                                            >
                                                <CheckCircle2 className="size-3" /> Connected
                                            </Typography>
                                        ) : (
                                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                                                Not connected
                                            </Typography>
                                        )}
                                    </Box>
                                </Box>
                                {connectedProviders.includes(provider.key) ? (
                                    <Button variant="outline" size="sm" onClick={() => unlinkProvider(provider.key)}>
                                        <Link2Off className="mr-1.5 size-4" /> Unlink
                                    </Button>
                                ) : (
                                    <Button size="sm" variant="outline" onClick={() => linkProvider(provider.key)}>
                                        <Link2 className="mr-1.5 size-4" /> Connect
                                    </Button>
                                )}
                            </Box>
                        ))}
                    </Stack>
                </Stack>

                {/* Google Calendar */}
                <Stack spacing={3}>
                    <HeadingSmall title="Google Calendar" description="Sync your assigned todos and chores to your personal Google Calendar." />
                    <Box sx={{ borderRadius: '12px', border: 1, borderColor: 'divider', p: 2 }}>
                        {hasGoogleCalendarConnected ? (
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                    <Box
                                        sx={{
                                            display: 'flex',
                                            width: 36,
                                            height: 36,
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            borderRadius: '50%',
                                            bgcolor: 'success.light',
                                        }}
                                    >
                                        <CalendarCheck className="size-5 text-green-600 dark:text-green-400" />
                                    </Box>
                                    <Box>
                                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                            Connected
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                                            Todos and chores assigned to you will sync automatically.
                                        </Typography>
                                    </Box>
                                </Box>
                                <Button variant="outline" size="sm" onClick={disconnectGoogleCalendar}>
                                    <CalendarX className="mr-1.5 size-4" /> Disconnect
                                </Button>
                            </Box>
                        ) : (
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                    <Box
                                        sx={{
                                            display: 'flex',
                                            width: 36,
                                            height: 36,
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            borderRadius: '50%',
                                            bgcolor: 'action.hover',
                                        }}
                                    >
                                        <CalendarX className="size-5 text-muted-foreground" />
                                    </Box>
                                    <Box>
                                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                            Not connected
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                                            Connect to sync your assigned todos and chores.
                                        </Typography>
                                    </Box>
                                </Box>
                                <Button size="sm" onClick={connectGoogleCalendar}>
                                    <CalendarCheck className="mr-1.5 size-4" /> Connect Google Calendar
                                </Button>
                            </Box>
                        )}
                        {status === 'google-calendar-connected' && (
                            <Typography variant="body2" sx={{ mt: 1.5, fontWeight: 500, color: 'success.main' }}>
                                Google Calendar connected successfully!
                            </Typography>
                        )}
                        {status === 'google-calendar-disconnected' && (
                            <Typography variant="body2" sx={{ mt: 1.5, color: 'text.secondary' }}>
                                Google Calendar has been disconnected.
                            </Typography>
                        )}
                    </Box>
                </Stack>

                {/* Inbound Email */}
                {inboundEmailAddress && (
                    <Stack spacing={3}>
                        <HeadingSmall
                            title="Inbound email address"
                            description="Forward emails to this address to automatically create calendar events, todos, chores, and shopping list items. Attachments are limited to 1 MB."
                        />
                        <Box sx={{ borderRadius: '12px', border: 1, borderColor: 'divider', p: 2 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                <Box
                                    sx={{
                                        display: 'flex',
                                        width: 36,
                                        height: 36,
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        borderRadius: '50%',
                                        bgcolor: 'action.hover',
                                        flexShrink: 0,
                                    }}
                                >
                                    <Mail className="size-5" style={{ color: 'var(--mui-palette-text-secondary)' }} />
                                </Box>
                                <Box sx={{ flex: 1, minWidth: 0 }}>
                                    <Typography
                                        variant="body2"
                                        sx={{
                                            fontFamily: 'monospace',
                                            wordBreak: 'break-all',
                                            fontWeight: 500,
                                        }}
                                    >
                                        {inboundEmailAddress}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                                        Emails sent here are automatically parsed by AI and added to your family organiser.
                                    </Typography>
                                </Box>
                                <Button variant="outline" size="sm" onClick={copyInboundEmail} sx={{ flexShrink: 0 }}>
                                    <Copy className="mr-1.5 size-4" />
                                    {copied ? 'Copied!' : 'Copy'}
                                </Button>
                            </Box>
                        </Box>
                    </Stack>
                )}

                <DeleteUser hasPasswordSet={hasPasswordSet} />
            </SettingsLayout>
        </AppLayout>
    );
}
