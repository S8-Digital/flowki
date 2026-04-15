import { useForm } from '@inertiajs/react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import { alpha, styled } from '@mui/material/styles';
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

interface Props {
    /** True when the authenticated user has a password set. False for OAuth-only accounts. */
    hasPasswordSet?: boolean;
}

const DeleteWarningBox = styled(Box)(({ theme }) => ({
    borderRadius: theme.shape.borderRadius * 2,
    border: `1px solid ${alpha(theme.palette.error.main, 0.3)}`,
    backgroundColor: alpha(theme.palette.error.main, 0.1),
}));

const DeleteWarningContent = styled(Box)(({ theme }) => ({
    color: theme.palette.error.main,
}));

const WarningTitle = styled(Typography)({
    fontWeight: 500,
});

const WarningBody = styled(Typography)({
    fontSize: '0.875rem',
});

function PasswordDeleteForm({ onSuccess }: { onSuccess: () => void }) {
    const inputRef = useRef<HTMLInputElement>(null);
    const form = useForm({ password: '' });

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        form.submit(destroy(), {
            preserveScroll: true,
            onError: () => inputRef.current?.focus(),
            onSuccess: () => {
                form.reset();
                form.clearErrors();
                onSuccess();
            },
        });
    }

    return (
        <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <DialogHeader style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <DialogTitle>Are you sure you want to delete your account?</DialogTitle>
                <DialogDescription>
                    Once your account is deleted, all of its resources and data will be permanently deleted. Please enter your password to confirm.
                </DialogDescription>
            </DialogHeader>
            <Box sx={{ display: 'grid', gap: 1 }}>
                <Input
                    id="delete-password"
                    ref={inputRef}
                    type="password"
                    label="Password"
                    value={form.data.password}
                    onChange={(e) => form.setData('password', e.target.value)}
                />
                <InputError message={form.errors.password} />
            </Box>
            <DialogFooter style={{ gap: 8 }}>
                <DialogClose asChild>
                    <Button
                        variant="secondary"
                        type="button"
                        onClick={() => {
                            form.reset();
                            form.clearErrors();
                        }}
                    >
                        Cancel
                    </Button>
                </DialogClose>
                <Button type="submit" variant="destructive" disabled={form.processing}>
                    Delete account
                </Button>
            </DialogFooter>
        </Box>
    );
}

function EmailDeleteForm({ onSuccess }: { onSuccess: () => void }) {
    const inputRef = useRef<HTMLInputElement>(null);
    const form = useForm({ email: '' });

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        form.submit(destroy(), {
            preserveScroll: true,
            onError: () => inputRef.current?.focus(),
            onSuccess: () => {
                form.reset();
                form.clearErrors();
                onSuccess();
            },
        });
    }

    return (
        <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <DialogHeader style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <DialogTitle>Are you sure you want to delete your account?</DialogTitle>
                <DialogDescription>
                    Once your account is deleted, all of its resources and data will be permanently deleted. Please enter your email address to
                    confirm.
                </DialogDescription>
            </DialogHeader>
            <Box sx={{ display: 'grid', gap: 1 }}>
                <Input
                    id="delete-email"
                    ref={inputRef}
                    type="email"
                    label="Your email address"
                    value={form.data.email}
                    onChange={(e) => form.setData('email', e.target.value)}
                />
                <InputError message={form.errors.email} />
            </Box>
            <DialogFooter style={{ gap: 8 }}>
                <DialogClose asChild>
                    <Button
                        variant="secondary"
                        type="button"
                        onClick={() => {
                            form.reset();
                            form.clearErrors();
                        }}
                    >
                        Cancel
                    </Button>
                </DialogClose>
                <Button type="submit" variant="destructive" disabled={form.processing}>
                    Delete account
                </Button>
            </DialogFooter>
        </Box>
    );
}

export default function DeleteUser({ hasPasswordSet = true }: Props) {
    const [open, setOpen] = useState(false);

    return (
        <Stack spacing={3}>
            <HeadingSmall title="Delete account" description="Delete your account and all of its resources" />
            <DeleteWarningBox sx={{ display: 'flex', flexDirection: 'column', gap: 2, p: 2 }}>
                <DeleteWarningContent sx={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: 0.25 }}>
                    <WarningTitle color="inherit">Warning</WarningTitle>
                    <WarningBody color="inherit">Please proceed with caution, this cannot be undone.</WarningBody>
                </DeleteWarningContent>
                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild>
                        <Button variant="destructive">Delete account</Button>
                    </DialogTrigger>
                    <DialogContent>
                        {hasPasswordSet ? (
                            <PasswordDeleteForm onSuccess={() => setOpen(false)} />
                        ) : (
                            <EmailDeleteForm onSuccess={() => setOpen(false)} />
                        )}
                    </DialogContent>
                </Dialog>
            </DeleteWarningBox>
        </Stack>
    );
}
