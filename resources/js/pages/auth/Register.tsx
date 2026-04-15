import { Head, useForm } from '@inertiajs/react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { LoaderCircle } from 'lucide-react';
import InputError from '@/components/InputError';
import SocialAuthButtons from '@/components/SocialAuthButtons';
import TextLink from '@/components/TextLink';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import AuthLayout from '@/layouts/AuthLayout';
import { store } from '@/actions/App/Http/Controllers/Auth/RegisteredUserController';
import { login } from '@/routes';

export default function Register() {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        post(store().url, { onFinish: () => reset('password', 'password_confirmation') });
    }

    return (
        <AuthLayout title="Create an account" description="Enter your details below to create your account">
            <Head title="Register" />

            <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <Box sx={{ display: 'grid', gap: 3 }}>
                    <Box sx={{ display: 'grid', gap: 1 }}>
                        <Input
                            id="name"
                            type="text"
                            label="Name"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            required
                            autoFocus
                            tabIndex={1}
                            autoComplete="name"
                            placeholder="Full name"
                        />
                        <InputError message={errors.name} />
                    </Box>

                    <Box sx={{ display: 'grid', gap: 1 }}>
                        <Input
                            id="email"
                            type="email"
                            label="Email address"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            required
                            tabIndex={2}
                            autoComplete="email"
                            placeholder="email@example.com"
                        />
                        <InputError message={errors.email} />
                    </Box>

                    <Box sx={{ display: 'grid', gap: 1 }}>
                        <Input
                            id="password"
                            type="password"
                            label="Password"
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            required
                            tabIndex={3}
                            autoComplete="new-password"
                            placeholder="Password"
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
                            required
                            tabIndex={4}
                            autoComplete="new-password"
                            placeholder="Confirm password"
                        />
                        <InputError message={errors.password_confirmation} />
                    </Box>

                    <Button type="submit" className="mt-2 w-full" tabIndex={5} disabled={processing}>
                        {processing && <LoaderCircle className="h-4 w-4 animate-spin" />}
                        Create account
                    </Button>
                </Box>

                <SocialAuthButtons label="Or sign up with" />

                <Typography variant="body2" align="center" color="text.secondary">
                    Already have an account?{' '}
                    <TextLink href={login()} className="underline underline-offset-4" tabIndex={6}>
                        Log in
                    </TextLink>
                </Typography>
            </Box>
        </AuthLayout>
    );
}
