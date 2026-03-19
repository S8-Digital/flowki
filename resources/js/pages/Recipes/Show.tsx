import { Head, Link, router, useForm } from '@inertiajs/react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
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
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, p: 3 }}>
                    <Box sx={{ overflow: 'hidden', borderRadius: 2, border: 1, borderColor: 'divider' }}>
                        {recipe.photo_path ? (
                            <Box sx={{ aspectRatio: '16/9', maxHeight: 288, width: '100%', overflow: 'hidden' }}>
                                <Box
                                    component="img"
                                    src={`/storage/${recipe.photo_path}`}
                                    alt={recipe.title}
                                    sx={{ height: '100%', width: '100%', objectFit: 'cover' }}
                                />
                            </Box>
                        ) : (
                            <Box
                                sx={{
                                    display: 'flex',
                                    aspectRatio: '16/9',
                                    maxHeight: 176,
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    bgcolor: 'action.hover',
                                }}
                            >
                                <ChefHat className="size-12 text-muted-foreground" />
                            </Box>
                        )}
                        <Box sx={{ p: 2.5 }}>
                            <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1 }}>
                                <Box>
                                    <Typography variant="h5" sx={{ fontWeight: 700 }}>
                                        {recipe.title}
                                    </Typography>
                                    {recipe.description && (
                                        <Typography variant="body2" sx={{ mt: 0.5, color: 'text.secondary' }}>
                                            {recipe.description}
                                        </Typography>
                                    )}
                                </Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
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
                                            <Stack component="form" onSubmit={handleEdit} spacing={2}>
                                                <Box sx={{ display: 'grid', gap: 1 }}>
                                                    <Label>Title</Label>
                                                    <Input value={data.title} onChange={(e) => setData('title', e.target.value)} required />
                                                    <InputError message={errors.title} />
                                                </Box>
                                                <Box sx={{ display: 'grid', gap: 1 }}>
                                                    <Label>Description</Label>
                                                    <Input value={data.description} onChange={(e) => setData('description', e.target.value)} />
                                                </Box>
                                                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 1.5 }}>
                                                    <Box sx={{ display: 'grid', gap: 1 }}>
                                                        <Label>Prep (min)</Label>
                                                        <Input
                                                            type="number"
                                                            value={data.prep_time_minutes}
                                                            onChange={(e) => setData('prep_time_minutes', e.target.value)}
                                                        />
                                                    </Box>
                                                    <Box sx={{ display: 'grid', gap: 1 }}>
                                                        <Label>Cook (min)</Label>
                                                        <Input
                                                            type="number"
                                                            value={data.cook_time_minutes}
                                                            onChange={(e) => setData('cook_time_minutes', e.target.value)}
                                                        />
                                                    </Box>
                                                </Box>
                                                <Box sx={{ display: 'grid', gap: 1 }}>
                                                    <Label>Instructions</Label>
                                                    <textarea
                                                        value={data.instructions}
                                                        onChange={(e) => setData('instructions', e.target.value)}
                                                        rows={5}
                                                        required
                                                        className="w-full rounded-md border border-surface bg-transparent px-2.5 py-2 text-sm text-black shadow-sm ring ring-transparent transition-all duration-300 ease-in outline-none select-none placeholder:text-foreground/60 hover:border-primary hover:ring-primary/10 focus:border-primary focus:ring-primary/10 focus:outline-none disabled:pointer-events-none disabled:opacity-50 dark:text-white"
                                                    />
                                                    <InputError message={errors.instructions} />
                                                </Box>
                                                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 1.5 }}>
                                                    <Box sx={{ display: 'grid', gap: 1 }}>
                                                        <Label>Rating</Label>
                                                        <Input
                                                            type="number"
                                                            min="1"
                                                            max="5"
                                                            value={data.rating}
                                                            onChange={(e) => setData('rating', e.target.value)}
                                                        />
                                                    </Box>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, pt: 3 }}>
                                                        <input
                                                            id="is_favorite"
                                                            type="checkbox"
                                                            checked={data.is_favorite === '1'}
                                                            onChange={(e) => setData('is_favorite', e.target.checked ? '1' : '')}
                                                            className="rounded"
                                                        />
                                                        <Label htmlFor="is_favorite">Favourite</Label>
                                                    </Box>
                                                </Box>
                                                <Button type="submit" className="w-full" disabled={processing}>
                                                    {processing ? 'Saving…' : 'Save Changes'}
                                                </Button>
                                            </Stack>
                                        </DialogContent>
                                    </Dialog>
                                    <Button variant="ghost" size="icon" onClick={deleteRecipe}>
                                        <Trash2 className="size-4 text-destructive" />
                                    </Button>
                                </Box>
                            </Box>
                            <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 2, fontSize: '0.875rem' }}>
                                {recipe.servings && (
                                    <Box component="span" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'text.secondary' }}>
                                        <Users className="size-4" /> {recipe.servings} servings
                                    </Box>
                                )}
                                {recipe.total_time_minutes > 0 && (
                                    <Box component="span" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'text.secondary' }}>
                                        <Clock className="size-4" /> {recipe.total_time_minutes} min total
                                    </Box>
                                )}
                                {recipe.rating && (
                                    <Box component="span" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'text.secondary' }}>
                                        <Star className="size-4 fill-yellow-400 text-yellow-400" /> {recipe.rating}/5
                                    </Box>
                                )}
                                {recipe.category && (
                                    <Box
                                        component="span"
                                        sx={{ borderRadius: '50px', bgcolor: 'secondary.main', px: 1, py: 0.25, textTransform: 'capitalize' }}
                                    >
                                        {recipe.category}
                                    </Box>
                                )}
                            </Box>
                        </Box>
                    </Box>

                    <Box sx={{ display: 'grid', gap: 3, gridTemplateColumns: { xs: '1fr', lg: 'repeat(3, 1fr)' } }}>
                        <Box sx={{ borderRadius: 2, border: 1, borderColor: 'divider', p: 2 }}>
                            <Typography sx={{ mb: 1.5, fontWeight: 600 }}>Ingredients</Typography>
                            {recipe.ingredients?.length ? (
                                <Stack component="ul" spacing={1} sx={{ pl: 0, listStyle: 'none', m: 0 }}>
                                    {recipe.ingredients.map((ingredient) => (
                                        <Box
                                            component="li"
                                            key={ingredient.id}
                                            sx={{ display: 'flex', alignItems: 'center', gap: 1, fontSize: '0.875rem' }}
                                        >
                                            <Box
                                                component="span"
                                                sx={{
                                                    width: 6,
                                                    height: 6,
                                                    borderRadius: '50%',
                                                    bgcolor: 'text.primary',
                                                    display: 'inline-block',
                                                    flexShrink: 0,
                                                }}
                                            />
                                            {ingredient.quantity && (
                                                <Typography component="span" sx={{ fontWeight: 500 }}>
                                                    {ingredient.quantity}
                                                </Typography>
                                            )}
                                            {ingredient.unit && (
                                                <Typography component="span" sx={{ color: 'text.secondary' }}>
                                                    {ingredient.unit}
                                                </Typography>
                                            )}
                                            <span>{ingredient.name}</span>
                                        </Box>
                                    ))}
                                </Stack>
                            ) : (
                                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                    No ingredients listed.
                                </Typography>
                            )}
                            <Link href={shoppingIndex().url} className="mt-4 block text-xs text-muted-foreground hover:underline">
                                Add to shopping list →
                            </Link>
                        </Box>
                        <Box sx={{ borderRadius: 2, border: 1, borderColor: 'divider', p: 2, gridColumn: { lg: 'span 2' } }}>
                            <Typography sx={{ mb: 1.5, fontWeight: 600 }}>Instructions</Typography>
                            <Box sx={{ fontSize: '0.875rem', whiteSpace: 'pre-line' }}>{recipe.instructions}</Box>
                        </Box>
                    </Box>
                </Box>
            </AppLayout>
        </>
    );
}
