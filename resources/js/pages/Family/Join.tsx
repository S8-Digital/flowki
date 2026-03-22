import { Head, Link, useForm } from '@inertiajs/react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import { create, joinStore } from '@/actions/App/Http/Controllers/FamilyController';
import InputError from '@/components/InputError';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import AppLayout from '@/layouts/AppLayout';
import type { BreadcrumbItem } from '@/types';

const FamilyHeading = styled(Typography)({ fontWeight: 700 });

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Join Family', href: '/family/join' }];

export default function FamilyJoin() {
    const { data, setData, post, processing, errors } = useForm({ invite_code: '' });

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        post(joinStore().url);
    }

    return (
        <>
            <Head title="Join Family" />
            <AppLayout breadcrumbs={breadcrumbs}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', p: 4 }}>
                    <Stack spacing={3} sx={{ width: '100%', maxWidth: 444 }}>
                        <Box>
                            <FamilyHeading variant="h5">Join a Family</FamilyHeading>
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                                Enter the invite code shared by your family admin.
                            </Typography>
                        </Box>
                        <Stack component="form" onSubmit={handleSubmit} spacing={2}>
                            <Box sx={{ display: 'grid', gap: 1 }}>
                                <Input
                                    id="invite_code"
                                    label="Invite Code"
                                    value={data.invite_code}
                                    onChange={(e) => setData('invite_code', e.target.value.toUpperCase())}
                                    placeholder="e.g. ABCD1234"
                                    required
                                    className="uppercase"
                                />
                                <InputError message={errors.invite_code} />
                            </Box>
                            <Button type="submit" className="w-full" disabled={processing}>
                                {processing ? 'Joining…' : 'Join Family'}
                            </Button>
                        </Stack>
                        <Typography variant="body2" align="center" color="text.secondary">
                            Don't have an invite code?{' '}
                            <Link href={create().url} className="underline underline-offset-4 hover:text-foreground">
                                Create a new family
                            </Link>
                        </Typography>
                    </Stack>
                </Box>
            </AppLayout>
        </>
    );
}
