import { Head, useForm } from '@inertiajs/react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import { LoaderCircle } from 'lucide-react';
import { store } from '@/actions/App/Http/Controllers/Auth/ConfirmablePasswordController';
import InputError from '@/components/InputError';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import AuthLayout from '@/layouts/AuthLayout';

export default function ConfirmPassword() {
    const { data, setData, post, processing, errors, reset } = useForm({ password: '' });

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        post(store().url, { onFinish: () => reset('password') });
    }

    return (
        <AuthLayout
            title="Confirm your password"
            description="This is a secure area of the application. Please confirm your password before continuing."
        >
            <Head title="Confirm password" />

            <form onSubmit={handleSubmit}>
                <Stack spacing={3}>
                    <Box sx={{ display: 'grid', gap: 1 }}>
                        <Input
                            id="password"
                            type="password"
                            label="Password"
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            required
                            autoComplete="current-password"
                            autoFocus
                        />
                        <InputError message={errors.password} />
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Button className="w-full" disabled={processing}>
                            {processing && <LoaderCircle className="h-4 w-4 animate-spin" />}
                            Confirm Password
                        </Button>
                    </Box>
                </Stack>
            </form>
        </AuthLayout>
    );
}
