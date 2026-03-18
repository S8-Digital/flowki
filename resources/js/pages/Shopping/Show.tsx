import { Head, router, useForm } from '@inertiajs/react';
import { Plus, Trash2 } from 'lucide-react';
import { useMemo } from 'react';
import { destroy as destroyItem, store as storeItem, toggle } from '@/actions/App/Http/Controllers/ShoppingItemController';
import InputError from '@/components/InputError';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/AppLayout';
import type { BreadcrumbItem, ShoppingItem, ShoppingList } from '@/types';

interface Props {
    list: ShoppingList;
}

export default function ShoppingShow({ list }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Shopping', href: '/shopping' },
        { title: list.name, href: `/shopping/${list.id}` },
    ];

    const { data, setData, post, processing, errors, reset } = useForm({ name: '', quantity: '', category: 'groceries' });

    const unchecked = useMemo(() => list.items?.data.filter((i) => !i.is_checked) ?? [], [list.items]);
    const checked = useMemo(() => list.items?.data.filter((i) => i.is_checked) ?? [], [list.items]);

    function handleAddItem(e: React.FormEvent) {
        e.preventDefault();
        post(storeItem(list.id).url, { onSuccess: () => reset() });
    }

    function toggleItem(item: ShoppingItem) {
        router.patch(toggle({ shoppingList: list.id, shoppingItem: item.id }).url);
    }

    function deleteItem(item: ShoppingItem) {
        router.delete(destroyItem({ shoppingList: list.id, shoppingItem: item.id }).url);
    }

    return (
        <>
            <Head title={list.name} />
            <AppLayout breadcrumbs={breadcrumbs}>
                <div className="flex flex-col gap-6 p-6">
                    <div className="flex items-center justify-between">
                        <h1 className="text-xl font-semibold">{list.name}</h1>
                        {list.is_shared && <span className="rounded-full bg-secondary px-2 py-0.5 text-xs">Shared</span>}
                    </div>

                    <form onSubmit={handleAddItem} className="flex gap-2">
                        <div className="w-80 flex-1">
                            <Input value={data.name} onChange={(e) => setData('name', e.target.value)} placeholder="Add item…" required />
                            <InputError message={errors.name} />
                        </div>
                        <Input value={data.quantity} onChange={(e) => setData('quantity', e.target.value)} placeholder="Qty" className="w-20" />
                        <Select value={data.category} onValueChange={(v) => setData('category', v)}>
                            <SelectTrigger>
                                <SelectValue placeholder="Category" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="groceries">Groceries</SelectItem>
                                <SelectItem value="household">Household</SelectItem>
                                <SelectItem value="personal_care">Personal Care</SelectItem>
                                <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                        </Select>
                        <Button type="submit" size="sm" disabled={processing}>
                            <Plus className="size-4" />
                        </Button>
                    </form>

                    {unchecked.length > 0 && (
                        <ul className="divide-y rounded-xl border">
                            {unchecked.map((item) => (
                                <li key={item.id} className="flex items-center gap-3 px-4 py-2">
                                    <input
                                        type="checkbox"
                                        checked={item.is_checked}
                                        onChange={() => toggleItem(item)}
                                        className="size-4 cursor-pointer rounded"
                                    />
                                    <div className="flex-1">
                                        <span className="font-medium">{item.name}</span>
                                        {item.quantity && <span className="ml-2 text-sm text-muted-foreground">{item.quantity}</span>}
                                    </div>
                                    <span className="rounded-full bg-secondary px-2 py-0.5 text-xs capitalize">{item.category}</span>
                                    <Button variant="ghost" size="icon" onClick={() => deleteItem(item)}>
                                        <Trash2 className="size-3.5 text-destructive" />
                                    </Button>
                                </li>
                            ))}
                        </ul>
                    )}

                    {checked.length > 0 && (
                        <div>
                            <p className="mb-2 text-sm font-medium text-muted-foreground">Checked off ({checked.length})</p>
                            <ul className="divide-y rounded-xl border opacity-60">
                                {checked.map((item) => (
                                    <li key={item.id} className="flex items-center gap-3 px-4 py-2">
                                        <input
                                            type="checkbox"
                                            checked={item.is_checked}
                                            onChange={() => toggleItem(item)}
                                            className="size-4 cursor-pointer rounded"
                                        />
                                        <span className="flex-1 text-muted-foreground line-through">{item.name}</span>
                                        <Button variant="ghost" size="icon" onClick={() => deleteItem(item)}>
                                            <Trash2 className="size-3.5 text-destructive" />
                                        </Button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {!unchecked.length && !checked.length && (
                        <div className="rounded-xl border border-dashed py-16 text-center text-sm text-muted-foreground">
                            List is empty. Add your first item above!
                        </div>
                    )}
                </div>
            </AppLayout>
        </>
    );
}
