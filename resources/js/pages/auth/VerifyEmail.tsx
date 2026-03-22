import { Head, router, useForm } from '@inertiajs/react';
import Box from '@mui/material/Box';
import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import { LoaderCircle } from 'lucide-react';
import { store } from '@/actions/App/Http/Controllers/Auth/EmailVerificationNotificationController';
import TextLink from '@/components/TextLink';
import { Button } from '@/components/ui/button';
import AuthLayout from '@/layouts/AuthLayout';
import { toUrl } from '@/lib/utils';
import { logout } from '@/routes';

const StatusMessage = styled(Typography)(({ theme }) => ({
    fontWeight: 500,
    textAlign: 'center',
    color: theme.palette.success.main,
}));

interface Props {
    status?: string;
}

export default function VerifyEmail({ status }: Props) {
    const { post, processing } = useForm({});

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        post(store().url);
    }

    return (
        <AuthLayout title="Verify email" description="Please verify your email address by clicking on the link we just emailed to you.">
            <Head title="Email verification" />

            {status === 'verification-link-sent' && (
                <StatusMessage sx={{ mb: 2 }}>
                    A new verification link has been sent to the email address you provided during registration.
                </StatusMessage>
            )}

            <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
                <Button disabled={processing} variant="secondary">
                    {processing && <LoaderCircle className="h-4 w-4 animate-spin" />}
                    Resend verification email
                </Button>

                <TextLink as="button" onClick={() => router.post(toUrl(logout()))} className="mx-auto block text-sm">
                    Log out
                </TextLink>
            </Box>
        </AuthLayout>
    );
}
