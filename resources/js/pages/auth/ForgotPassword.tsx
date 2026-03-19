import { Head, useForm } from '@inertiajs/react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { LoaderCircle } from 'lucide-react';
import { store } from '@/actions/App/Http/Controllers/Auth/PasswordResetLinkController';
import InputError from '@/components/InputError';
import TextLink from '@/components/TextLink';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AuthLayout from '@/layouts/AuthLayout';
import { login } from '@/routes';

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

            {status && <Typography sx={{ mb: 2, textAlign: 'center', fontWeight: 500, color: 'success.main' }}>{status}</Typography>}

            <Stack spacing={3}>
                <form onSubmit={handleSubmit}>
                    <Box sx={{ display: 'grid', gap: 1 }}>
                        <Label htmlFor="email">Email address</Label>
                        <Input
                            id="email"
                            type="email"
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

                <Typography variant="body2" sx={{ textAlign: 'center', color: 'text.secondary' }}>
                    Or, return to <TextLink href={login()}>log in</TextLink>
                </Typography>
            </Stack>
        </AuthLayout>
    );
}
