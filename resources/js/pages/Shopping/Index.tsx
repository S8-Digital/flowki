import { Head, router, useForm } from '@inertiajs/react';
import MuiCheckbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
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
                <div className="flex flex-col gap-4 p-6">
                    <div className="flex items-center justify-between">
                        <h1 className="text-xl font-semibold">Shopping Lists</h1>
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
                                <form onSubmit={handleCreate} className="space-y-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="name">List Name</Label>
                                        <Input
                                            id="name"
                                            value={data.name}
                                            onChange={(e) => setData('name', e.target.value)}
                                            placeholder="e.g. Weekly Groceries"
                                            required
                                        />
                                        <InputError message={errors.name} />
                                    </div>
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
                                </form>
                            </DialogContent>
                        </Dialog>
                    </div>

                    {!lists ? (
                        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                            {[...Array(6)].map((_, i) => (
                                <Skeleton key={i} className="h-24 rounded-xl" />
                            ))}
                        </div>
                    ) : lists.length === 0 ? (
                        <div className="rounded-xl border border-dashed py-16 text-center text-sm text-muted-foreground">
                            No shopping lists yet. Create one!
                        </div>
                    ) : (
                        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                            {lists.map((list) => (
                                <div
                                    key={list.id}
                                    role="button"
                                    tabIndex={0}
                                    aria-label={`Open ${list.name} shopping list`}
                                    className="flex cursor-pointer flex-col justify-between rounded-xl border p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
                                    onClick={() => router.visit(show(list.id).url)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' || e.key === ' ') {
                                            e.preventDefault();
                                            router.visit(show(list.id).url);
                                        }
                                    }}
                                >
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <p className="font-medium">{list.name}</p>
                                            <p className="text-xs text-muted-foreground">
                                                {list.items_count ?? 0} items{list.is_shared && ' · Shared'}
                                            </p>
                                        </div>
                                        <ShoppingCart className="size-5 text-muted-foreground" />
                                    </div>
                                    <div className="mt-4 flex justify-end">
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
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </AppLayout>
        </>
    );
}
