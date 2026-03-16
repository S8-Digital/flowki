import { Head, Link, router, useForm } from '@inertiajs/react';
import { ChefHat, Clock, Heart, Star, Trash2, Users } from 'lucide-react';
import { useState } from 'react';
import { destroy, update } from '@/actions/App/Http/Controllers/RecipeController';
import { index as shoppingIndex } from '@/actions/App/Http/Controllers/ShoppingListController';
import InputError from '@/components/InputError';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/AppLayout';
import type { BreadcrumbItem, Recipe } from '@/types';

interface Props {
    recipe: Recipe;
}

export default function RecipesShow({ recipe }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Recipes', href: '/recipes' },
        { title: recipe.title, href: `/recipes/${recipe.id}` },
    ];

    const [editOpen, setEditOpen] = useState(false);

    const { data, setData, patch, processing, errors } = useForm({
        title: recipe.title,
        description: recipe.description ?? '',
        prep_time_minutes: String(recipe.prep_time_minutes ?? ''),
        cook_time_minutes: String(recipe.cook_time_minutes ?? ''),
        instructions: recipe.instructions,
        rating: String(recipe.rating ?? ''),
        is_favorite: recipe.is_favorite ? '1' : '',
    });

    function handleEdit(e: React.FormEvent) {
        e.preventDefault();
        patch(update(recipe.id).url, { onSuccess: () => setEditOpen(false) });
    }

    function deleteRecipe() {
        if (!confirm('Delete this recipe?')) {
            return;
        }

        router.delete(destroy(recipe.id).url, { onSuccess: () => router.visit('/recipes') });
    }

    return (
        <>
            <Head title={recipe.title} />
            <AppLayout breadcrumbs={breadcrumbs}>
                <div className="flex flex-col gap-6 p-6">
                    <div className="overflow-hidden rounded-xl border">
                        {recipe.photo_path ? (
                            <div className="aspect-video max-h-72 w-full overflow-hidden">
                                <img src={`/storage/${recipe.photo_path}`} alt={recipe.title} className="h-full w-full object-cover" />
                            </div>
                        ) : (
                            <div className="flex aspect-video max-h-44 items-center justify-center bg-muted">
                                <ChefHat className="size-12 text-muted-foreground" />
                            </div>
                        )}
                        <div className="p-5">
                            <div className="flex items-start justify-between gap-2">
                                <div>
                                    <h1 className="text-2xl font-bold">{recipe.title}</h1>
                                    {recipe.description && <p className="mt-1 text-sm text-muted-foreground">{recipe.description}</p>}
                                </div>
                                <div className="flex items-center gap-2">
                                    {recipe.is_favorite && <Heart className="size-5 fill-red-500 text-red-500" />}
                                    <Dialog open={editOpen} onOpenChange={setEditOpen}>
                                        <DialogTrigger asChild>
                                            <Button variant="outline" size="sm">
                                                Edit
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent className="max-h-[90vh] overflow-y-auto">
                                            <DialogHeader>
                                                <DialogTitle>Edit Recipe</DialogTitle>
                                            </DialogHeader>
                                            <form onSubmit={handleEdit} className="space-y-4">
                                                <div className="grid gap-2">
                                                    <Label>Title</Label>
                                                    <Input value={data.title} onChange={(e) => setData('title', e.target.value)} required />
                                                    <InputError message={errors.title} />
                                                </div>
                                                <div className="grid gap-2">
                                                    <Label>Description</Label>
                                                    <Input value={data.description} onChange={(e) => setData('description', e.target.value)} />
                                                </div>
                                                <div className="grid grid-cols-2 gap-3">
                                                    <div className="grid gap-2">
                                                        <Label>Prep (min)</Label>
                                                        <Input
                                                            type="number"
                                                            value={data.prep_time_minutes}
                                                            onChange={(e) => setData('prep_time_minutes', e.target.value)}
                                                        />
                                                    </div>
                                                    <div className="grid gap-2">
                                                        <Label>Cook (min)</Label>
                                                        <Input
                                                            type="number"
                                                            value={data.cook_time_minutes}
                                                            onChange={(e) => setData('cook_time_minutes', e.target.value)}
                                                        />
                                                    </div>
                                                </div>
                                                <div className="grid gap-2">
                                                    <Label>Instructions</Label>
                                                    <textarea
                                                        value={data.instructions}
                                                        onChange={(e) => setData('instructions', e.target.value)}
                                                        rows={5}
                                                        required
                                                        className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:ring-1 focus:ring-ring focus:outline-none"
                                                    />
                                                    <InputError message={errors.instructions} />
                                                </div>
                                                <div className="grid grid-cols-2 gap-3">
                                                    <div className="grid gap-2">
                                                        <Label>Rating</Label>
                                                        <Input
                                                            type="number"
                                                            min="1"
                                                            max="5"
                                                            value={data.rating}
                                                            onChange={(e) => setData('rating', e.target.value)}
                                                        />
                                                    </div>
                                                    <div className="flex items-center gap-2 pt-6">
                                                        <input
                                                            id="is_favorite"
                                                            type="checkbox"
                                                            checked={data.is_favorite === '1'}
                                                            onChange={(e) => setData('is_favorite', e.target.checked ? '1' : '')}
                                                            className="rounded"
                                                        />
                                                        <Label htmlFor="is_favorite">Favourite</Label>
                                                    </div>
                                                </div>
                                                <Button type="submit" className="w-full" disabled={processing}>
                                                    {processing ? 'Saving…' : 'Save Changes'}
                                                </Button>
                                            </form>
                                        </DialogContent>
                                    </Dialog>
                                    <Button variant="ghost" size="icon" onClick={deleteRecipe}>
                                        <Trash2 className="size-4 text-destructive" />
                                    </Button>
                                </div>
                            </div>
                            <div className="mt-4 flex flex-wrap gap-4 text-sm">
                                {recipe.servings && (
                                    <span className="flex items-center gap-1 text-muted-foreground">
                                        <Users className="size-4" /> {recipe.servings} servings
                                    </span>
                                )}
                                {recipe.total_time_minutes > 0 && (
                                    <span className="flex items-center gap-1 text-muted-foreground">
                                        <Clock className="size-4" /> {recipe.total_time_minutes} min total
                                    </span>
                                )}
                                {recipe.rating && (
                                    <span className="flex items-center gap-1 text-muted-foreground">
                                        <Star className="size-4 fill-yellow-400 text-yellow-400" /> {recipe.rating}/5
                                    </span>
                                )}
                                {recipe.category && <span className="rounded-full bg-secondary px-2 py-0.5 capitalize">{recipe.category}</span>}
                            </div>
                        </div>
                    </div>

                    <div className="grid gap-6 lg:grid-cols-3">
                        <div className="rounded-xl border p-4">
                            <h2 className="mb-3 font-semibold">Ingredients</h2>
                            {recipe.ingredients?.length ? (
                                <ul className="space-y-2">
                                    {recipe.ingredients.map((ingredient) => (
                                        <li key={ingredient.id} className="flex items-center gap-2 text-sm">
                                            <span className="size-1.5 rounded-full bg-foreground" />
                                            {ingredient.quantity && <span className="font-medium">{ingredient.quantity}</span>}
                                            {ingredient.unit && <span className="text-muted-foreground">{ingredient.unit}</span>}
                                            <span>{ingredient.name}</span>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-sm text-muted-foreground">No ingredients listed.</p>
                            )}
                            <Link href={shoppingIndex().url} className="mt-4 block text-xs text-muted-foreground hover:underline">
                                Add to shopping list →
                            </Link>
                        </div>
                        <div className="rounded-xl border p-4 lg:col-span-2">
                            <h2 className="mb-3 font-semibold">Instructions</h2>
                            <div className="prose prose-sm dark:prose-invert max-w-none text-sm whitespace-pre-line">{recipe.instructions}</div>
                        </div>
                    </div>
                </div>
            </AppLayout>
        </>
    );
}
