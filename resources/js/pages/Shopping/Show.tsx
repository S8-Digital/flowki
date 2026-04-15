import { Head, router, useForm } from '@inertiajs/react';
import { Fab } from '@mui/material';
import Box from '@mui/material/Box';
import MuiCheckbox from '@mui/material/Checkbox';
import Typography from '@mui/material/Typography';
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
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, p: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                            {list.name}
                        </Typography>
                        {list.is_shared && (
                            <Box component="span" sx={{ borderRadius: '50px', bgcolor: 'secondary.main', px: 1, py: 0.25, fontSize: '0.75rem' }}>
                                Shared
                            </Box>
                        )}
                    </Box>

                    <Box component="form" onSubmit={handleAddItem} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Input value={data.name} onChange={(e) => setData('name', e.target.value)} placeholder="Add item…" required />
                            <InputError message={errors.name} />
                        </Box>
                        <Box sx={{ width: 56, flexShrink: 0 }}>
                            <Input value={data.quantity} onChange={(e) => setData('quantity', e.target.value)} placeholder="Qty" />
                        </Box>
                        <Box sx={{ width: 140, flexShrink: 0 }}>
                            <Select value={data.category} onValueChange={(v) => setData('category', v)}>
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Category" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="groceries">Groceries</SelectItem>
                                    <SelectItem value="household">Household</SelectItem>
                                    <SelectItem value="personal_care">Personal Care</SelectItem>
                                    <SelectItem value="other">Other</SelectItem>
                                </SelectContent>
                            </Select>
                        </Box>
                        <Box>
                            <Fab type="submit" color="primary" size="small" disabled={processing}>
                                <Plus className="size-4" />
                            </Fab>
                        </Box>
                    </Box>

                    {unchecked.length > 0 && (
                        <Box component="ul" sx={{ borderRadius: 2, border: 1, borderColor: 'divider', listStyle: 'none', m: 0, p: 0 }}>
                            {unchecked.map((item) => (
                                <Box
                                    component="li"
                                    key={item.id}
                                    sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 1.5,
                                        px: 2,
                                        py: 1,
                                        borderBottom: 1,
                                        borderColor: 'divider',
                                        '&:last-child': { borderBottom: 0 },
                                    }}
                                >
                                    <MuiCheckbox checked={item.is_checked} onChange={() => toggleItem(item)} size="small" />
                                    <Box sx={{ flex: 1 }}>
                                        <Typography component="span" sx={{ fontWeight: 500 }}>
                                            {item.name}
                                        </Typography>
                                        {item.quantity && (
                                            <Typography component="span" variant="body2" sx={{ ml: 1, color: 'text.secondary' }}>
                                                {item.quantity}
                                            </Typography>
                                        )}
                                    </Box>
                                    <Box
                                        component="span"
                                        sx={{
                                            borderRadius: '50px',
                                            bgcolor: 'secondary.main',
                                            px: 1,
                                            py: 0.25,
                                            fontSize: '0.75rem',
                                            textTransform: 'capitalize',
                                        }}
                                    >
                                        {item.category}
                                    </Box>
                                    <Button variant="ghost" size="icon" onClick={() => deleteItem(item)}>
                                        <Trash2 className="size-3.5 text-destructive" />
                                    </Button>
                                </Box>
                            ))}
                        </Box>
                    )}

                    {checked.length > 0 && (
                        <Box>
                            <Typography variant="body2" sx={{ mb: 1, fontWeight: 500, color: 'text.secondary' }}>
                                Checked off ({checked.length})
                            </Typography>
                            <Box
                                component="ul"
                                sx={{ borderRadius: 2, border: 1, borderColor: 'divider', opacity: 0.6, listStyle: 'none', m: 0, p: 0 }}
                            >
                                {checked.map((item) => (
                                    <Box
                                        component="li"
                                        key={item.id}
                                        sx={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 1.5,
                                            px: 2,
                                            py: 1,
                                            borderBottom: 1,
                                            borderColor: 'divider',
                                            '&:last-child': { borderBottom: 0 },
                                        }}
                                    >
                                        <MuiCheckbox checked={item.is_checked} onChange={() => toggleItem(item)} size="small" />
                                        <Typography component="span" sx={{ flex: 1, color: 'text.secondary', textDecoration: 'line-through' }}>
                                            {item.name}
                                        </Typography>
                                        <Button variant="ghost" size="icon" onClick={() => deleteItem(item)}>
                                            <Trash2 className="size-3.5 text-destructive" />
                                        </Button>
                                    </Box>
                                ))}
                            </Box>
                        </Box>
                    )}

                    {!unchecked.length && !checked.length && (
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
                            List is empty. Add your first item above!
                        </Box>
                    )}
                </Box>
            </AppLayout>
        </>
    );
}
