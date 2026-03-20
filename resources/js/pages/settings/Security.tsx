import { Head, router, useForm } from '@inertiajs/react';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { RefreshCw, Shield, ShieldCheck, ShieldOff } from 'lucide-react';
import { useEffect, useState } from 'react';
import { update } from '@/actions/App/Http/Controllers/Settings/PasswordController';
import HeadingSmall from '@/components/HeadingSmall';
import InputError from '@/components/InputError';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import AppLayout from '@/layouts/AppLayout';
import SettingsLayout from '@/layouts/settings/Layout';
import type { BreadcrumbItem } from '@/types';

interface Props {
    twoFactorEnabled: boolean;
    twoFactorConfirmed: boolean;
    status?: string;
}

const breadcrumbItems: BreadcrumbItem[] = [{ title: 'Security settings', href: '/settings/password' }];

export default function Security({ twoFactorEnabled, twoFactorConfirmed, status }: Props) {
    const { data, setData, put, processing, errors, reset, recentlySuccessful } = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const [qrCode, setQrCode] = useState<string | null>(null);
    const [secretKey, setSecretKey] = useState<string | null>(null);
    const [recoveryCodes, setRecoveryCodes] = useState<string[]>([]);
    const [confirmCode, setConfirmCode] = useState('');
    const [confirmError, setConfirmError] = useState('');
    const [showRecoveryCodes, setShowRecoveryCodes] = useState(false);

    useEffect(() => {
        if (twoFactorEnabled && !twoFactorConfirmed && qrCode === null) {
            fetchQrCode();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [twoFactorEnabled, twoFactorConfirmed]);

    function fetchQrCode() {
        fetch('/user/two-factor-qr-code')
            .then((r) => r.json())
            .then((data: { svg: string; secretKey: string }) => {
                setQrCode(data.svg);
                setSecretKey(data.secretKey);
            })
            .catch(() => {
                setConfirmError('Could not load QR code. Please refresh the page.');
            });
    }

    function enableTwoFactor() {
        router.post('/user/two-factor-authentication', {}, { preserveScroll: true });
    }

    function confirmTwoFactor() {
        setConfirmError('');
        router.put(
            '/user/confirmed-two-factor-authentication',
            { code: confirmCode },
            {
                preserveScroll: true,
                onError: (errors) => setConfirmError(errors.code ?? 'Invalid code.'),
                onSuccess: () => {
                    setConfirmCode('');
                    setQrCode(null);
                    setSecretKey(null);
                },
            },
        );
    }

    function disableTwoFactor() {
        if (!confirm('Disable two-factor authentication? Your account will be less secure.')) {
            return;
        }

        router.delete('/user/two-factor-authentication', { preserveScroll: true });
    }

    function loadRecoveryCodes() {
        fetch('/user/two-factor-recovery-codes')
            .then((r) => r.json())
            .then((codes: string[]) => {
                setRecoveryCodes(codes);
                setShowRecoveryCodes(true);
            })
            .catch(() => {
                setShowRecoveryCodes(false);
            });
    }

    function regenerateRecoveryCodes() {
        router.post(
            '/user/two-factor-recovery-codes',
            {},
            {
                preserveScroll: true,
                onSuccess: () => {
                    setShowRecoveryCodes(false);
                    setRecoveryCodes([]);
                },
            },
        );
    }

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
            <Head title="Security settings" />
            <SettingsLayout>
                <Stack spacing={3}>
                    <HeadingSmall title="Update password" description="Ensure your account is using a long, random password to stay secure" />
                    <Stack component="form" onSubmit={handleSubmit} spacing={3}>
                        <Box sx={{ display: 'grid', gap: 1 }}>
                            <Input
                                id="current_password"
                                type="password"
                                label="Current password"
                                value={data.current_password}
                                onChange={(e) => setData('current_password', e.target.value)}
                                autoComplete="current-password"
                                placeholder="Current password"
                            />
                            <InputError message={errors.current_password} />
                        </Box>
                        <Box sx={{ display: 'grid', gap: 1 }}>
                            <Input
                                id="password"
                                type="password"
                                label="New password"
                                value={data.password}
                                onChange={(e) => setData('password', e.target.value)}
                                autoComplete="new-password"
                                placeholder="New password"
                            />
                            <InputError message={errors.password} />
                        </Box>
                        <Box sx={{ display: 'grid', gap: 1 }}>
                            <Input
                                id="password_confirmation"
                                type="password"
                                label="Confirm password"
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

                {/* Two-Factor Authentication */}
                <Stack spacing={3}>
                    <HeadingSmall
                        title="Two-factor authentication"
                        description="Add an extra layer of security to your account using an authenticator app."
                    />

                    <Box sx={{ borderRadius: '12px', border: 1, borderColor: 'divider', p: 2 }}>
                        {twoFactorEnabled && twoFactorConfirmed ? (
                            <Stack spacing={2}>
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
                                            <ShieldCheck className="size-5 text-green-600 dark:text-green-400" />
                                        </Box>
                                        <Box>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                                    Two-factor authentication is enabled
                                                </Typography>
                                                <Chip label="Active" color="success" size="small" />
                                            </Box>
                                            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                                                Your account is secured with an authenticator app.
                                            </Typography>
                                        </Box>
                                    </Box>
                                    <Button variant="outline" size="sm" onClick={disableTwoFactor}>
                                        <ShieldOff className="mr-1.5 size-4" /> Disable
                                    </Button>
                                </Box>

                                {/* Recovery codes section */}
                                {showRecoveryCodes && recoveryCodes.length > 0 && (
                                    <Box
                                        sx={{
                                            bgcolor: 'action.hover',
                                            borderRadius: 1,
                                            p: 2,
                                        }}
                                    >
                                        <Typography variant="body2" sx={{ fontWeight: 500, mb: 1 }}>
                                            Recovery codes
                                        </Typography>
                                        <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 1.5 }}>
                                            Store these recovery codes somewhere safe. They can be used to access your account if you lose your
                                            authenticator device.
                                        </Typography>
                                        <Box
                                            component="ul"
                                            sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0.5, listStyle: 'none', p: 0, m: 0 }}
                                        >
                                            {recoveryCodes.map((code) => (
                                                <Box component="li" key={code}>
                                                    <Typography variant="caption" sx={{ fontFamily: 'monospace', fontWeight: 500 }}>
                                                        {code}
                                                    </Typography>
                                                </Box>
                                            ))}
                                        </Box>
                                    </Box>
                                )}

                                <Box sx={{ display: 'flex', gap: 1 }}>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {
                                            if (showRecoveryCodes) {
                                                setShowRecoveryCodes(false);

                                                return;
                                            }

                                            loadRecoveryCodes();
                                        }}
                                    >
                                        {showRecoveryCodes ? 'Hide recovery codes' : 'Show recovery codes'}
                                    </Button>
                                    {showRecoveryCodes && (
                                        <Button variant="outline" size="sm" onClick={regenerateRecoveryCodes}>
                                            <RefreshCw className="mr-1.5 size-4" /> Regenerate
                                        </Button>
                                    )}
                                </Box>

                                {status === 'recovery-codes-regenerated' && (
                                    <Typography variant="body2" sx={{ fontWeight: 500, color: 'success.main' }}>
                                        Recovery codes regenerated. Make sure to save the new codes.
                                    </Typography>
                                )}
                            </Stack>
                        ) : twoFactorEnabled && !twoFactorConfirmed ? (
                            <Stack spacing={2}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                    <Box
                                        sx={{
                                            display: 'flex',
                                            width: 36,
                                            height: 36,
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            borderRadius: '50%',
                                            bgcolor: 'warning.light',
                                        }}
                                    >
                                        <Shield className="size-5 text-amber-600 dark:text-amber-400" />
                                    </Box>
                                    <Box>
                                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                            Finish setting up two-factor authentication
                                        </Typography>
                                        <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                                            Scan the QR code below with your authenticator app, then enter the code to confirm.
                                        </Typography>
                                    </Box>
                                </Box>

                                {qrCode && (
                                    <Box>
                                        <Box
                                            dangerouslySetInnerHTML={{ __html: qrCode }}
                                            sx={{ display: 'inline-block', border: 1, borderColor: 'divider', borderRadius: 1, p: 1 }}
                                        />
                                        {secretKey && (
                                            <Typography variant="caption" sx={{ display: 'block', mt: 1, color: 'text.secondary' }}>
                                                Or enter the setup key manually:{' '}
                                                <Box component="span" sx={{ fontFamily: 'monospace', fontWeight: 500 }}>
                                                    {secretKey}
                                                </Box>
                                            </Typography>
                                        )}
                                    </Box>
                                )}

                                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                                    <Input
                                        id="2fa_code"
                                        label="Authentication code"
                                        value={confirmCode}
                                        onChange={(e) => setConfirmCode(e.target.value)}
                                        inputMode="numeric"
                                        autoComplete="one-time-code"
                                        placeholder="000000"
                                        sx={{ maxWidth: 160 }}
                                    />
                                    <Box sx={{ pt: 3.5 }}>
                                        <Button onClick={confirmTwoFactor} disabled={!confirmCode}>
                                            Confirm
                                        </Button>
                                    </Box>
                                </Box>
                                {confirmError && (
                                    <Typography variant="caption" sx={{ color: 'error.main' }}>
                                        {confirmError}
                                    </Typography>
                                )}

                                <Button variant="outline" size="sm" onClick={disableTwoFactor} sx={{ alignSelf: 'flex-start' }}>
                                    Cancel setup
                                </Button>
                            </Stack>
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
                                        <ShieldOff className="size-5 text-muted-foreground" />
                                    </Box>
                                    <Box>
                                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                            Two-factor authentication is not enabled
                                        </Typography>
                                        <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                                            Enable 2FA to protect your account with an authenticator app.
                                        </Typography>
                                    </Box>
                                </Box>
                                <Button size="sm" onClick={enableTwoFactor}>
                                    <Shield className="mr-1.5 size-4" /> Enable
                                </Button>
                            </Box>
                        )}
                    </Box>
                </Stack>
            </SettingsLayout>
        </AppLayout>
    );
}
