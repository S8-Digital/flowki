import { Head, router, useForm } from '@inertiajs/react';
import Box from '@mui/material/Box';
import MuiCheckbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Plus, ShoppingCart, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { destroy, show, store } from '@/actions/App/Http/Controllers/ShoppingListController';
import InputError from '@/components/InputError';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import AppLayout from '@/layouts/AppLayout';
import type { BreadcrumbItem, ShoppingList } from '@/types';

interface Props {
    lists: ShoppingList[] | null;
}

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Shopping', href: '/shopping' }];

export default function ShoppingIndex({ lists }: Props) {
    const [createOpen, setCreateOpen] = useState(false);
    const { data, setData, post, processing, errors, reset } = useForm({ name: '', is_shared: false as boolean });

    function handleCreate(e: React.FormEvent) {
        e.preventDefault();
        post(store().url, {
            onSuccess: () => {
                setCreateOpen(false);
                reset();
            },
        });
    }

    function deleteList(list: ShoppingList) {
        if (!confirm('Delete this shopping list?')) {
            return;
        }

        router.delete(destroy(list.id).url);
    }

    return (
        <>
            <Head title="Shopping Lists" />
            <AppLayout breadcrumbs={breadcrumbs}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, p: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                            Shopping Lists
                        </Typography>
                        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
                            <DialogTrigger asChild>
                                <Button size="sm">
                                    <Plus className="mr-1 size-4" /> New List
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Create Shopping List</DialogTitle>
                                </DialogHeader>
                                <Stack component="form" onSubmit={handleCreate} spacing={2}>
                                    <Box sx={{ display: 'grid', gap: 1 }}>
                                        <Label htmlFor="name">List Name</Label>
                                        <Input
                                            id="name"
                                            value={data.name}
                                            onChange={(e) => setData('name', e.target.value)}
                                            placeholder="e.g. Weekly Groceries"
                                            required
                                        />
                                        <InputError message={errors.name} />
                                    </Box>
                                    <FormControlLabel
                                        control={
                                            <MuiCheckbox
                                                id="is_shared"
                                                checked={data.is_shared}
                                                onChange={(e) => setData('is_shared', e.target.checked)}
                                                size="small"
                                            />
                                        }
                                        label="Shared with family"
                                    />
                                    <Button type="submit" className="w-full" disabled={processing}>
                                        {processing ? 'Creating…' : 'Create List'}
                                    </Button>
                                </Stack>
                            </DialogContent>
                        </Dialog>
                    </Box>

                    {!lists ? (
                        <Box sx={{ display: 'grid', gap: 1.5, gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' } }}>
                            {[...Array(6)].map((_, i) => (
                                <Skeleton key={i} className="h-24 rounded-xl" />
                            ))}
                        </Box>
                    ) : lists.length === 0 ? (
                        <Box
                            sx={{
                                borderRadius: 2,
                                border: 1,
                                borderColor: 'divider',
                                borderStyle: 'dashed',
                                py: 8,
                                textAlign: 'center',
                                fontSize: '0.875rem',
                                color: 'text.secondary',
                            }}
                        >
                            No shopping lists yet. Create one!
                        </Box>
                    ) : (
                        <Box sx={{ display: 'grid', gap: 1.5, gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' } }}>
                            {lists.map((list) => (
                                <Box
                                    key={list.id}
                                    role="button"
                                    tabIndex={0}
                                    aria-label={`Open ${list.name} shopping list`}
                                    sx={{
                                        display: 'flex',
                                        cursor: 'pointer',
                                        flexDirection: 'column',
                                        justifyContent: 'space-between',
                                        borderRadius: 2,
                                        border: 1,
                                        borderColor: 'divider',
                                        p: 2,
                                        transition: 'all 0.2s',
                                        '&:hover': { transform: 'translateY(-2px)', boxShadow: 2 },
                                        '&:focus-visible': {
                                            outline: '2px solid',
                                            outlineColor: 'primary.main',
                                            outlineOffset: 2,
                                            transform: 'translateY(-2px)',
                                            boxShadow: 2,
                                        },
                                    }}
                                    onClick={() => router.visit(show(list.id).url)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' || e.key === ' ') {
                                            e.preventDefault();
                                            router.visit(show(list.id).url);
                                        }
                                    }}
                                >
                                    <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                                        <Box>
                                            <Typography sx={{ fontWeight: 500 }}>{list.name}</Typography>
                                            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                                                {list.items_count ?? 0} items{list.is_shared && ' · Shared'}
                                            </Typography>
                                        </Box>
                                        <ShoppingCart className="size-5 text-muted-foreground" />
                                    </Box>
                                    <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                deleteList(list);
                                            }}
                                        >
                                            <Trash2 className="size-4 text-destructive" />
                                        </Button>
                                    </Box>
                                </Box>
                            ))}
                        </Box>
                    )}
                </Box>
            </AppLayout>
        </>
    );
}
