import { Head, Link, router, useForm } from '@inertiajs/react';
import { ChefHat, Clock, ExternalLink, Plus, Star, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { destroy, show, store } from '@/actions/App/Http/Controllers/RecipeController';
import InputError from '@/components/InputError';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import AppLayout from '@/layouts/AppLayout';
import type { BreadcrumbItem, PaginatedResource, Recipe } from '@/types';

interface Props {
    recipes: PaginatedResource<Recipe> | null;
    filters: Record<string, string>;
}

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Recipes', href: '/recipes' }];

export default function RecipesIndex({ recipes }: Props) {
    const [createOpen, setCreateOpen] = useState(false);
    const { data, setData, post, processing, errors, reset } = useForm({
        title: '',
        description: '',
        category: '',
        servings: '',
        prep_time_minutes: '',
        cook_time_minutes: '',
        instructions: '',
        photo: null as File | null,
    });

    function handleCreate(e: React.FormEvent) {
        e.preventDefault();
        post(store().url, {
            forceFormData: true,
            onSuccess: () => {
                setCreateOpen(false);
                reset();
            },
        });
    }

    function deleteRecipe(recipe: Recipe) {
        if (!confirm('Delete this recipe?')) {
            return;
        }

        router.delete(destroy(recipe.id).url);
    }

    return (
        <>
            <Head title="Recipes" />
            <AppLayout breadcrumbs={breadcrumbs}>
                <div className="flex flex-col gap-4 p-6">
                    <div className="flex items-center justify-between">
                        <h1 className="text-xl font-semibold">Recipes</h1>
                        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
                            <DialogTrigger asChild>
                                <Button size="sm">
                                    <Plus className="mr-1 size-4" /> New Recipe
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="max-h-[90vh] overflow-y-auto">
                                <DialogHeader>
                                    <DialogTitle>Create Recipe</DialogTitle>
                                </DialogHeader>
                                <form onSubmit={handleCreate} className="space-y-4">
                                    <div className="grid gap-2">
                                        <Label>Title</Label>
                                        <Input
                                            value={data.title}
                                            onChange={(e) => setData('title', e.target.value)}
                                            placeholder="Recipe name"
                                            required
                                        />
                                        <InputError message={errors.title} />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label>Description</Label>
                                        <Input
                                            value={data.description}
                                            onChange={(e) => setData('description', e.target.value)}
                                            placeholder="Brief description"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="grid gap-2">
                                            <Label>Category</Label>
                                            <Select value={data.category} onValueChange={(v) => setData('category', v)}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="None" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="">None</SelectItem>
                                                    <SelectItem value="breakfast">Breakfast</SelectItem>
                                                    <SelectItem value="lunch">Lunch</SelectItem>
                                                    <SelectItem value="dinner">Dinner</SelectItem>
                                                    <SelectItem value="snack">Snack</SelectItem>
                                                    <SelectItem value="dessert">Dessert</SelectItem>
                                                    <SelectItem value="drink">Drink</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="grid gap-2">
                                            <Label>Servings</Label>
                                            <Input
                                                type="number"
                                                min="1"
                                                value={data.servings}
                                                onChange={(e) => setData('servings', e.target.value)}
                                                placeholder="4"
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="grid gap-2">
                                            <Label>Prep (min)</Label>
                                            <Input
                                                type="number"
                                                min="0"
                                                value={data.prep_time_minutes}
                                                onChange={(e) => setData('prep_time_minutes', e.target.value)}
                                                placeholder="15"
                                            />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label>Cook (min)</Label>
                                            <Input
                                                type="number"
                                                min="0"
                                                value={data.cook_time_minutes}
                                                onChange={(e) => setData('cook_time_minutes', e.target.value)}
                                                placeholder="30"
                                            />
                                        </div>
                                    </div>
                                    <div className="grid gap-2">
                                        <Label>Instructions</Label>
                                        <textarea
                                            value={data.instructions}
                                            onChange={(e) => setData('instructions', e.target.value)}
                                            rows={4}
                                            required
                                            placeholder="Step by step instructions…"
                                            className="w-full rounded-md border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:ring-1 focus:ring-ring focus:outline-none"
                                        />
                                        <InputError message={errors.instructions} />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label>Photo</Label>
                                        <Input type="file" accept="image/*" onChange={(e) => setData('photo', e.target.files?.[0] ?? null)} />
                                        <InputError message={errors.photo} />
                                    </div>
                                    <Button type="submit" className="w-full" disabled={processing}>
                                        {processing ? 'Creating…' : 'Create Recipe'}
                                    </Button>
                                </form>
                            </DialogContent>
                        </Dialog>
                    </div>

                    {!recipes ? (
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {[...Array(6)].map((_, i) => (
                                <Skeleton key={i} className="h-40 rounded-xl" />
                            ))}
                        </div>
                    ) : recipes.data.length === 0 ? (
                        <div className="rounded-xl border border-dashed py-16 text-center text-sm text-muted-foreground">
                            No recipes yet. Add your first one!
                        </div>
                    ) : (
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {recipes.data.map((recipe) => (
                                <div
                                    key={recipe.id}
                                    className="group relative flex flex-col overflow-hidden rounded-xl border transition hover:shadow-md"
                                >
                                    {recipe.photo_path ? (
                                        <div className="aspect-video w-full overflow-hidden">
                                            <img src={`/storage/${recipe.photo_path}`} alt={recipe.title} className="h-full w-full object-cover" />
                                        </div>
                                    ) : (
                                        <div className="flex aspect-video items-center justify-center bg-muted">
                                            <ChefHat className="size-8 text-muted-foreground" />
                                        </div>
                                    )}
                                    <div className="flex flex-1 flex-col p-4">
                                        <p className="font-semibold">{recipe.title}</p>
                                        {recipe.description && (
                                            <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{recipe.description}</p>
                                        )}
                                        <div className="mt-auto flex items-center justify-between pt-3 text-xs text-muted-foreground">
                                            {recipe.total_time_minutes > 0 && (
                                                <span className="flex items-center gap-1">
                                                    <Clock className="size-3" /> {recipe.total_time_minutes}m
                                                </span>
                                            )}
                                            {recipe.rating && (
                                                <span className="flex items-center gap-1">
                                                    <Star className="size-3 fill-yellow-400 text-yellow-400" /> {recipe.rating}/5
                                                </span>
                                            )}
                                        </div>
                                        <div className="mt-3 flex items-center justify-between">
                                            <Link href={show(recipe.id).url} className="text-sm font-medium hover:underline">
                                                View <ExternalLink className="ml-1 inline size-3" />
                                            </Link>
                                            <Button variant="ghost" size="icon" onClick={() => deleteRecipe(recipe)}>
                                                <Trash2 className="size-4 text-destructive" />
                                            </Button>
                                        </div>
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
