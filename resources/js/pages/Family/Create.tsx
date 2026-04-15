import { Head, Link, useForm } from '@inertiajs/react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import { join, store } from '@/actions/App/Http/Controllers/FamilyController';
import InputError from '@/components/InputError';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import AppLayout from '@/layouts/AppLayout';
import type { BreadcrumbItem } from '@/types';

const FamilyHeading = styled(Typography)({ fontWeight: 700 });

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Create Family', href: '/family/create' }];

export default function FamilyCreate() {
    const { data, setData, post, processing, errors } = useForm({ name: '' });

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        post(store().url);
    }

    return (
        <>
            <Head title="Create Family" />
            <AppLayout breadcrumbs={breadcrumbs}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', p: 4 }}>
                    <Stack spacing={3} sx={{ width: '100%', maxWidth: 444 }}>
                        <Box>
                            <FamilyHeading variant="h5">Create a Family</FamilyHeading>
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                                Start organizing together. You'll be the family admin.
                            </Typography>
                        </Box>
                        <Stack component="form" onSubmit={handleSubmit} spacing={2}>
                            <Box sx={{ display: 'grid', gap: 1 }}>
                                <Input
                                    id="name"
                                    label="Family Name"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    placeholder="e.g. The Smith Family"
                                    required
                                />
                                <InputError message={errors.name} />
                            </Box>
                            <Button type="submit" className="w-full" disabled={processing}>
                                {processing ? 'Creating…' : 'Create Family'}
                            </Button>
                        </Stack>
                        <Typography variant="body2" align="center" color="text.secondary">
                            Already have an invite code?{' '}
                            <Link href={join().url} className="underline underline-offset-4 hover:text-foreground">
                                Join a family instead
                            </Link>
                        </Typography>
                    </Stack>
                </Box>
            </AppLayout>
        </>
    );
}
