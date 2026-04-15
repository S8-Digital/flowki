import { Head, useForm } from '@inertiajs/react';
import Box from '@mui/material/Box';
import { LoaderCircle } from 'lucide-react';
import InputError from '@/components/InputError';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import AuthLayout from '@/layouts/AuthLayout';
import { store } from '@/actions/App/Http/Controllers/Auth/NewPasswordController';

interface Props {
    token: string;
    email: string;
}

export default function ResetPassword({ token, email }: Props) {
    const { data, setData, post, processing, errors, reset } = useForm({
        token,
        email,
        password: '',
        password_confirmation: '',
    });

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        post(store().url, { onFinish: () => reset('password', 'password_confirmation') });
    }

    return (
        <AuthLayout title="Reset password" description="Please enter your new password below">
            <Head title="Reset password" />

            <form onSubmit={handleSubmit}>
                <Box sx={{ display: 'grid', gap: 3 }}>
                    <Box sx={{ display: 'grid', gap: 1 }}>
                        <Input
                            id="email"
                            type="email"
                            label="Email"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            autoComplete="email"
                            readOnly
                        />
                        <InputError message={errors.email} className="mt-2" />
                    </Box>

                    <Box sx={{ display: 'grid', gap: 1 }}>
                        <Input
                            id="password"
                            type="password"
                            label="Password"
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            autoComplete="new-password"
                            autoFocus
                            placeholder="Password"
                        />
                        <InputError message={errors.password} />
                    </Box>

                    <Box sx={{ display: 'grid', gap: 1 }}>
                        <Input
                            id="password_confirmation"
                            type="password"
                            label="Confirm Password"
                            value={data.password_confirmation}
                            onChange={(e) => setData('password_confirmation', e.target.value)}
                            autoComplete="new-password"
                            placeholder="Confirm password"
                        />
                        <InputError message={errors.password_confirmation} />
                    </Box>

                    <Button type="submit" className="mt-4 w-full" disabled={processing}>
                        {processing && <LoaderCircle className="h-4 w-4 animate-spin" />}
                        Reset password
                    </Button>
                </Box>
            </form>
        </AuthLayout>
    );
}
