import { Head, useForm } from '@inertiajs/react';
import Box from '@mui/material/Box';
import { LoaderCircle } from 'lucide-react';
import InputError from '@/components/InputError';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import AuthLayout from '@/layouts/AuthLayout';
import { store } from '@/actions/App/Http/Controllers/AcceptInviteController';

interface Props {
    token: string;
    email: string;
    familyName: string;
    role: string;
}

export default function AcceptInvite({ token, email, familyName, role }: Props) {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        password: '',
        password_confirmation: '',
    });

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        post(store({ token }).url, { onFinish: () => reset('password', 'password_confirmation') });
    }

    return (
        <AuthLayout title={`Join ${familyName}`} description={`You've been invited as a ${role}. Set up your account to get started.`}>
            <Head title="Accept Invitation" />

            <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <Box sx={{ display: 'grid', gap: 3 }}>
                    <Box sx={{ display: 'grid', gap: 1 }}>
                        <Input id="email" type="email" label="Email address" value={email} disabled />
                    </Box>

                    <Box sx={{ display: 'grid', gap: 1 }}>
                        <Input
                            id="name"
                            label="Your name"
                            type="text"
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
                            id="password"
                            label="Password"
                            type="password"
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            required
                            tabIndex={2}
                            autoComplete="new-password"
                            placeholder="Choose a password"
                        />
                        <InputError message={errors.password} />
                    </Box>

                    <Box sx={{ display: 'grid', gap: 1 }}>
                        <Input
                            id="password_confirmation"
                            label="Confirm password"
                            type="password"
                            value={data.password_confirmation}
                            onChange={(e) => setData('password_confirmation', e.target.value)}
                            required
                            tabIndex={3}
                            autoComplete="new-password"
                            placeholder="Confirm password"
                        />
                        <InputError message={errors.password_confirmation} />
                    </Box>

                    <Button type="submit" className="mt-2 w-full" tabIndex={4} disabled={processing}>
                        {processing && <LoaderCircle className="h-4 w-4 animate-spin" />}
                        Accept & Join {familyName}
                    </Button>
                </Box>
            </Box>
        </AuthLayout>
    );
}
