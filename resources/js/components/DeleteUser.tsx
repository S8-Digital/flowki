import { useForm } from '@inertiajs/react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useRef, useState } from 'react';
import { destroy } from '@/actions/App/Http/Controllers/Settings/ProfileController';
import HeadingSmall from '@/components/HeadingSmall';
import InputError from '@/components/InputError';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function DeleteUser() {
    const passwordInputRef = useRef<HTMLInputElement>(null);
    const [open, setOpen] = useState(false);

    const form = useForm({ password: '' });

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        form.submit(destroy(), {
            preserveScroll: true,
            onError: () => passwordInputRef.current?.focus(),
            onSuccess: () => setOpen(false),
        });
    }

    function handleCancel() {
        form.reset();
        form.clearErrors();
        setOpen(false);
    }

    return (
        <Stack spacing={3}>
            <HeadingSmall title="Delete account" description="Delete your account and all of its resources" />
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 2,
                    borderRadius: 2,
                    border: '1px solid',
                    borderColor: 'color-mix(in srgb, var(--destructive) 30%, transparent)',
                    bgcolor: 'color-mix(in srgb, var(--destructive) 10%, transparent)',
                    p: 2,
                }}
            >
                <Box sx={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: '2px', color: 'var(--destructive)' }}>
                    <Typography sx={{ fontWeight: 500, color: 'inherit' }}>Warning</Typography>
                    <Typography sx={{ fontSize: '0.875rem', color: 'inherit' }}>Please proceed with caution, this cannot be undone.</Typography>
                </Box>
                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild>
                        <Button variant="destructive">Delete account</Button>
                    </DialogTrigger>
                    <DialogContent>
                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                            <DialogHeader style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                <DialogTitle>Are you sure you want to delete your account?</DialogTitle>
                                <DialogDescription>
                                    Once your account is deleted, all of its resources and data will also be permanently deleted. Please enter your
                                    password to confirm you would like to permanently delete your account.
                                </DialogDescription>
                            </DialogHeader>

                            <Box sx={{ display: 'grid', gap: 1 }}>
                                <Label
                                    htmlFor="password"
                                    style={{
                                        position: 'absolute',
                                        width: 1,
                                        height: 1,
                                        overflow: 'hidden',
                                        clip: 'rect(0,0,0,0)',
                                        whiteSpace: 'nowrap',
                                    }}
                                >
                                    Password
                                </Label>
                                <Input
                                    id="password"
                                    ref={passwordInputRef}
                                    type="password"
                                    value={form.data.password}
                                    onChange={(e) => form.setData('password', e.target.value)}
                                    placeholder="Password"
                                />
                                <InputError message={form.errors.password} />
                            </Box>

                            <DialogFooter style={{ gap: 8 }}>
                                <DialogClose asChild>
                                    <Button variant="secondary" type="button" onClick={handleCancel}>
                                        Cancel
                                    </Button>
                                </DialogClose>
                                <Button type="submit" variant="destructive" disabled={form.processing}>
                                    Delete account
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </Box>
        </Stack>
    );
}
