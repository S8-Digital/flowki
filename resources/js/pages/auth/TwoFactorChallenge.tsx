import { Head, useForm } from '@inertiajs/react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { useState } from 'react';
import InputError from '@/components/InputError';
import TextLink from '@/components/TextLink';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import AuthLayout from '@/layouts/AuthLayout';

export default function TwoFactorChallenge() {
    const [useRecoveryCode, setUseRecoveryCode] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        code: '',
        recovery_code: '',
    });

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        post('/two-factor-challenge', {
            onFinish: () => reset('code', 'recovery_code'),
        });
    }

    return (
        <AuthLayout
            title="Two-factor authentication"
            description={
                useRecoveryCode
                    ? 'Enter one of your emergency recovery codes to access your account.'
                    : 'Please confirm access to your account by entering the authentication code from your authenticator app.'
            }
        >
            <Head title="Two-factor authentication" />

            <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <Box sx={{ display: 'grid', gap: 1 }}>
                    {useRecoveryCode ? (
                        <>
                            <Input
                                id="recovery_code"
                                label="Recovery code"
                                value={data.recovery_code}
                                onChange={(e) => setData('recovery_code', e.target.value)}
                                required
                                autoFocus
                                autoComplete="one-time-code"
                                placeholder="xxxx-xxxx"
                            />
                            <InputError message={errors.recovery_code} />
                        </>
                    ) : (
                        <>
                            <Input
                                id="code"
                                label="Authentication code"
                                value={data.code}
                                onChange={(e) => setData('code', e.target.value)}
                                required
                                autoFocus
                                inputMode="numeric"
                                autoComplete="one-time-code"
                                placeholder="000000"
                            />
                            <InputError message={errors.code} />
                        </>
                    )}
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
                    <Typography
                        component="button"
                        type="button"
                        variant="body2"
                        onClick={() => {
                            setUseRecoveryCode(!useRecoveryCode);
                            reset('code', 'recovery_code');
                        }}
                        sx={{
                            color: 'text.secondary',
                            textDecoration: 'underline',
                            cursor: 'pointer',
                            background: 'none',
                            border: 'none',
                            p: 0,
                        }}
                    >
                        {useRecoveryCode ? 'Use an authentication code instead' : 'Use a recovery code instead'}
                    </Typography>

                    <Button type="submit" disabled={processing}>
                        Log in
                    </Button>
                </Box>

                <Typography variant="body2" sx={{ textAlign: 'center', color: 'text.secondary' }}>
                    <TextLink href="/login">Back to login</TextLink>
                </Typography>
            </Box>
        </AuthLayout>
    );
}
