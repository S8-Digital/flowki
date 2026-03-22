import { Head, Link, router, useForm } from '@inertiajs/react';
import Box from '@mui/material/Box';
import MuiCheckbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { ChefHat, Clock, Heart, Star, Trash2, Users } from 'lucide-react';
import { useState } from 'react';
import { destroy, update } from '@/actions/App/Http/Controllers/RecipeController';
import { index as shoppingIndex } from '@/actions/App/Http/Controllers/ShoppingListController';
import InputError from '@/components/InputError';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
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
                                <ChefHat size={48} style={{ color: 'var(--mui-palette-text-secondary)' }} />
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
                                    {recipe.is_favorite && (
                                        <Heart size={20} style={{ fill: 'var(--mui-palette-error-main)', color: 'var(--mui-palette-error-main)' }} />
                                    )}
                                    <Dialog open={editOpen} onOpenChange={setEditOpen}>
                                        <DialogTrigger asChild>
                                            <Button variant="outline" size="sm">
                                                Edit
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent sx={{ maxHeight: '90vh', overflowY: 'auto' }}>
                                            <DialogHeader>
                                                <DialogTitle>Edit Recipe</DialogTitle>
                                            </DialogHeader>
                                            <Stack component="form" onSubmit={handleEdit} spacing={2}>
                                                <Box sx={{ display: 'grid', gap: 1 }}>
                                                    <Input
                                                        label="Title"
                                                        value={data.title}
                                                        onChange={(e) => setData('title', e.target.value)}
                                                        required
                                                    />
                                                    <InputError message={errors.title} />
                                                </Box>
                                                <Box sx={{ display: 'grid', gap: 1 }}>
                                                    <Input
                                                        label="Description"
                                                        value={data.description}
                                                        onChange={(e) => setData('description', e.target.value)}
                                                    />
                                                </Box>
                                                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 1.5 }}>
                                                    <Box sx={{ display: 'grid', gap: 1 }}>
                                                        <Input
                                                            label="Prep (min)"
                                                            type="number"
                                                            value={data.prep_time_minutes}
                                                            onChange={(e) => setData('prep_time_minutes', e.target.value)}
                                                        />
                                                    </Box>
                                                    <Box sx={{ display: 'grid', gap: 1 }}>
                                                        <Input
                                                            label="Cook (min)"
                                                            type="number"
                                                            value={data.cook_time_minutes}
                                                            onChange={(e) => setData('cook_time_minutes', e.target.value)}
                                                        />
                                                    </Box>
                                                </Box>
                                                <Box sx={{ display: 'grid', gap: 1 }}>
                                                    <TextField
                                                        label="Instructions"
                                                        value={data.instructions}
                                                        onChange={(e) => setData('instructions', e.target.value)}
                                                        multiline
                                                        rows={5}
                                                        required
                                                        size="small"
                                                        fullWidth
                                                    />
                                                    <InputError message={errors.instructions} />
                                                </Box>
                                                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 1.5 }}>
                                                    <Box sx={{ display: 'grid', gap: 1 }}>
                                                        <Input
                                                            label="Rating"
                                                            type="number"
                                                            min="1"
                                                            max="5"
                                                            value={data.rating}
                                                            onChange={(e) => setData('rating', e.target.value)}
                                                        />
                                                    </Box>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', pt: 3 }}>
                                                        <FormControlLabel
                                                            control={
                                                                <MuiCheckbox
                                                                    checked={data.is_favorite === '1'}
                                                                    onChange={(e) => setData('is_favorite', e.target.checked ? '1' : '')}
                                                                    size="small"
                                                                />
                                                            }
                                                            label="Favourite"
                                                        />
                                                    </Box>
                                                </Box>
                                                <Button type="submit" sx={{ width: '100%' }} disabled={processing}>
                                                    {processing ? 'Saving…' : 'Save Changes'}
                                                </Button>
                                            </Stack>
                                        </DialogContent>
                                    </Dialog>
                                    <Button variant="ghost" size="icon" onClick={deleteRecipe}>
                                        <Trash2 size={16} style={{ color: 'var(--mui-palette-error-main)' }} />
                                    </Button>
                                </Box>
                            </Box>
                            <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 2, fontSize: '0.875rem' }}>
                                {recipe.servings && (
                                    <Box component="span" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'text.secondary' }}>
                                        <Users size={16} /> {recipe.servings} servings
                                    </Box>
                                )}
                                {recipe.total_time_minutes > 0 && (
                                    <Box component="span" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'text.secondary' }}>
                                        <Clock size={16} /> {recipe.total_time_minutes} min total
                                    </Box>
                                )}
                                {recipe.rating && (
                                    <Box component="span" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'text.secondary' }}>
                                        <Star
                                            size={16}
                                            style={{ fill: 'var(--mui-palette-warning-light)', color: 'var(--mui-palette-warning-light)' }}
                                        />{' '}
                                        {recipe.rating}/5
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
                                                <Typography component="span" color="text.secondary">
                                                    {ingredient.unit}
                                                </Typography>
                                            )}
                                            <span>{ingredient.name}</span>
                                        </Box>
                                    ))}
                                </Stack>
                            ) : (
                                <Typography variant="body2" color="text.secondary">
                                    No ingredients listed.
                                </Typography>
                            )}
                            <Link
                                href={shoppingIndex().url}
                                style={{ display: 'block', marginTop: 16, fontSize: '0.75rem', color: 'var(--mui-palette-text-secondary)' }}
                            >
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
