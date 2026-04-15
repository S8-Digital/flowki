import { Head, useForm } from '@inertiajs/react';
import Box from '@mui/material/Box';
import FormControlLabel from '@mui/material/FormControlLabel';
import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import { LoaderCircle } from 'lucide-react';
import { store } from '@/actions/App/Http/Controllers/Auth/AuthenticatedSessionController';
import InputError from '@/components/InputError';
import SocialAuthButtons from '@/components/SocialAuthButtons';
import TextLink from '@/components/TextLink';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import AuthLayout from '@/layouts/AuthLayout';
import { register } from '@/routes';
import { request } from '@/routes/password';

const StatusMessage = styled(Typography)(({ theme }) => ({
    fontWeight: 500,
    textAlign: 'center',
    color: theme.palette.success.main,
}));

interface Props {
    status?: string;
    canResetPassword: boolean;
}

export default function Login({ status, canResetPassword }: Props) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false as boolean,
    });

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        post(store().url, { onFinish: () => reset('password') });
    }

    return (
        <AuthLayout title="Log in to your account" description="Enter your email and password below to log in">
            <Head title="Log in" />

            {status && <StatusMessage sx={{ mb: 2 }}>{status}</StatusMessage>}

            <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <Box sx={{ display: 'grid', gap: 3 }}>
                    <Box sx={{ display: 'grid', gap: 1 }}>
                        <Input
                            id="email"
                            type="email"
                            label="Email address"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            required
                            autoFocus
                            tabIndex={1}
                            autoComplete="email"
                            placeholder="email@example.com"
                        />
                        <InputError message={errors.email} />
                    </Box>

                    <Box sx={{ display: 'grid', gap: 1 }}>
                        {canResetPassword && (
                            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                                <TextLink href={request()} className="text-sm" tabIndex={5}>
                                    Forgot password?
                                </TextLink>
                            </Box>
                        )}
                        <Input
                            id="password"
                            type="password"
                            label="Password"
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            required
                            tabIndex={2}
                            autoComplete="current-password"
                            placeholder="Password"
                        />
                        <InputError message={errors.password} />
                    </Box>

                    <FormControlLabel
                        control={
                            <Checkbox
                                id="remember"
                                name="remember"
                                checked={data.remember}
                                onCheckedChange={(checked) => setData('remember', checked as boolean)}
                                tabIndex={3}
                            />
                        }
                        label="Remember me"
                    />

                    <Button type="submit" className="mt-4 w-full" tabIndex={4} disabled={processing}>
                        {processing && <LoaderCircle className="h-4 w-4 animate-spin" />}
                        Log in
                    </Button>
                </Box>

                <SocialAuthButtons />

                <Typography variant="body2" align="center" color="text.secondary">
                    Don't have an account?{' '}
                    <TextLink href={register()} tabIndex={5}>
                        Sign up
                    </TextLink>
                </Typography>
            </Box>
        </AuthLayout>
    );
}
