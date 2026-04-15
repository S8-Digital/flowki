import { Head, useForm } from '@inertiajs/react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import { LoaderCircle } from 'lucide-react';
import { store } from '@/actions/App/Http/Controllers/Auth/PasswordResetLinkController';
import InputError from '@/components/InputError';
import TextLink from '@/components/TextLink';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import AuthLayout from '@/layouts/AuthLayout';
import { login } from '@/routes';

const StatusMessage = styled(Typography)(({ theme }) => ({
    fontWeight: 500,
    textAlign: 'center',
    color: theme.palette.success.main,
}));

interface Props {
    status?: string;
}

export default function ForgotPassword({ status }: Props) {
    const { data, setData, post, processing, errors } = useForm({ email: '' });

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        post(store().url);
    }

    return (
        <AuthLayout title="Forgot password" description="Enter your email to receive a password reset link">
            <Head title="Forgot password" />

            {status && <StatusMessage sx={{ mb: 2 }}>{status}</StatusMessage>}

            <Stack spacing={3}>
                <form onSubmit={handleSubmit}>
                    <Box sx={{ display: 'grid', gap: 1 }}>
                        <Input
                            id="email"
                            type="email"
                            label="Email address"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            autoComplete="off"
                            autoFocus
                            placeholder="email@example.com"
                        />
                        <InputError message={errors.email} />
                    </Box>

                    <Box sx={{ my: 3, display: 'flex', alignItems: 'center' }}>
                        <Button className="w-full" disabled={processing}>
                            {processing && <LoaderCircle className="h-4 w-4 animate-spin" />}
                            Email password reset link
                        </Button>
                    </Box>
                </form>

                <Typography variant="body2" align="center" color="text.secondary">
                    Or, return to <TextLink href={login()}>log in</TextLink>
                </Typography>
            </Stack>
        </AuthLayout>
    );
}
