import HeadingSmall from '@/components/HeadingSmall';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import AppLayout from '@/layouts/AppLayout';
import SettingsLayout from '@/layouts/settings/Layout';
import type { BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';

interface Category {
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
            '/settings/categories',
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
            <div className="flex flex-col space-y-4">
                <HeadingSmall title={title} description={description} />
                <div className="space-y-2">
                    {categories.map((cat, i) => (
                        <div key={i} className="flex items-center gap-2">
                            <Input
                                value={cat.label}
                                onChange={(e) => onLabelInput(setter, i, e.target.value, cat.value)}
                                placeholder="Label (e.g. Household)"
                                className="flex-1"
                            />
                            <Input
                                value={cat.value}
                                onChange={(e) => onValueChange(setter, i, e.target.value)}
                                placeholder="Value (e.g. household)"
                                className="w-40 font-mono text-xs"
                            />
                            <Button variant="ghost" size="icon" onClick={() => removeCategory(setter, i)} title="Remove">
                                <Trash2 className="size-4 text-destructive" />
                            </Button>
                        </div>
                    ))}
                </div>
                <Button variant="outline" size="sm" className="w-fit" onClick={() => addCategory(setter)}>
                    <Plus className="mr-1 size-4" /> Add Category
                </Button>
            </div>
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
                <div className="flex items-center gap-4">
                    <Button onClick={save} disabled={saving}>
                        {saving ? 'Saving…' : 'Save Categories'}
                    </Button>
                    {saved && <p className="text-sm text-neutral-600">Saved.</p>}
                </div>
            </SettingsLayout>
        </AppLayout>
    );
}
