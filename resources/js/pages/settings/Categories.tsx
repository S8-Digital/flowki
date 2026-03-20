import { Head, router } from '@inertiajs/react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { update } from '@/actions/App/Http/Controllers/Settings/CategoriesController';
import HeadingSmall from '@/components/HeadingSmall';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import AppLayout from '@/layouts/AppLayout';
import SettingsLayout from '@/layouts/settings/Layout';
import type { BreadcrumbItem } from '@/types';

interface Category {
    [key: string]: string;
    value: string;
    label: string;
}

interface Props {
    todoCategories: Category[];
    recipeCategories: Category[];
    shoppingCategories: Category[];
}

const breadcrumbItems: BreadcrumbItem[] = [{ title: 'Categories', href: '/settings/categories' }];

function slugify(label: string): string {
    return label
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '_')
        .replace(/^_|_$/g, '');
}

export default function Categories({ todoCategories: initialTodo, recipeCategories: initialRecipe, shoppingCategories: initialShopping }: Props) {
    const [todoCategories, setTodoCategories] = useState<Category[]>(initialTodo.map((c) => ({ ...c })));
    const [recipeCategories, setRecipeCategories] = useState<Category[]>(initialRecipe.map((c) => ({ ...c })));
    const [shoppingCategories, setShoppingCategories] = useState<Category[]>(initialShopping.map((c) => ({ ...c })));
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    function addCategory(setter: React.Dispatch<React.SetStateAction<Category[]>>) {
        setter((prev) => [...prev, { value: '', label: '' }]);
    }

    function removeCategory(setter: React.Dispatch<React.SetStateAction<Category[]>>, index: number) {
        setter((prev) => prev.filter((_, i) => i !== index));
    }

    function onLabelInput(setter: React.Dispatch<React.SetStateAction<Category[]>>, index: number, label: string, currentValue: string) {
        const autoValue = !currentValue || currentValue === slugify(label.slice(0, -1));
        setter((prev) => prev.map((c, i) => (i === index ? { label, value: autoValue ? slugify(label) : c.value } : c)));
    }

    function onValueChange(setter: React.Dispatch<React.SetStateAction<Category[]>>, index: number, value: string) {
        setter((prev) => prev.map((c, i) => (i === index ? { ...c, value } : c)));
    }

    function save() {
        setSaving(true);
        router.post(
            update().url,
            { todo_categories: todoCategories, recipe_categories: recipeCategories, shopping_categories: shoppingCategories },
            {
                onSuccess: () => {
                    setSaved(true);
                    setTimeout(() => setSaved(false), 2000);
                },
                onFinish: () => setSaving(false),
            },
        );
    }

    function CategorySection({
        title,
        description,
        categories,
        setter,
    }: {
        title: string;
        description: string;
        categories: Category[];
        setter: React.Dispatch<React.SetStateAction<Category[]>>;
    }) {
        return (
            <Stack spacing={2}>
                <HeadingSmall title={title} description={description} />
                <Stack spacing={1}>
                    {categories.map((cat, i) => (
                        <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Box sx={{ flex: 1, minWidth: 0 }}>
                                <Input
                                    value={cat.label}
                                    onChange={(e) => onLabelInput(setter, i, e.target.value, cat.value)}
                                    placeholder="Label (e.g. Household)"
                                />
                            </Box>
                            <Box sx={{ width: 144, flexShrink: 0 }}>
                                <Input
                                    value={cat.value}
                                    onChange={(e) => onValueChange(setter, i, e.target.value)}
                                    placeholder="Value (slug)"
                                    className="font-mono text-xs"
                                />
                            </Box>
                            <Box sx={{ flexShrink: 0 }}>
                                <Button variant="ghost" size="icon" onClick={() => removeCategory(setter, i)} title="Remove">
                                    <Trash2 className="size-4 text-destructive" />
                                </Button>
                            </Box>
                        </Box>
                    ))}
                </Stack>
                <Button variant="outline" size="sm" className="w-fit" onClick={() => addCategory(setter)}>
                    <Plus className="mr-1 size-4" /> Add Category
                </Button>
            </Stack>
        );
    }

    return (
        <AppLayout breadcrumbs={breadcrumbItems}>
            <Head title="Categories" />
            <SettingsLayout>
                <CategorySection
                    title="Todo Categories"
                    description="Customize the categories available for todos."
                    categories={todoCategories}
                    setter={setTodoCategories}
                />
                <CategorySection
                    title="Recipe Categories"
                    description="Customize the categories available for recipes."
                    categories={recipeCategories}
                    setter={setRecipeCategories}
                />
                <CategorySection
                    title="Shopping Categories"
                    description="Customize the categories available for shopping items."
                    categories={shoppingCategories}
                    setter={setShoppingCategories}
                />
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Button onClick={save} disabled={saving}>
                        {saving ? 'Saving…' : 'Save Categories'}
                    </Button>
                    {saved && (
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                            Saved.
                        </Typography>
                    )}
                </Box>
            </SettingsLayout>
        </AppLayout>
    );
}
