import { Head, router, useForm } from '@inertiajs/react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { ChefHat, Clock, Plus, Star, Trash2 } from 'lucide-react';
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
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, p: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                            Recipes
                        </Typography>
                        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
                            <DialogTrigger asChild>
                                <Button size="sm">
                                    <Plus size={16} style={{ marginRight: 4 }} /> New Recipe
                                </Button>
                            </DialogTrigger>
                            <DialogContent sx={{ maxHeight: '90vh', overflowY: 'auto' }}>
                                <DialogHeader>
                                    <DialogTitle>Create Recipe</DialogTitle>
                                </DialogHeader>
                                <Stack component="form" onSubmit={handleCreate} spacing={2}>
                                    <Box sx={{ display: 'grid', gap: 1 }}>
                                        <Label>Title</Label>
                                        <Input
                                            value={data.title}
                                            onChange={(e) => setData('title', e.target.value)}
                                            placeholder="Recipe name"
                                            required
                                        />
                                        <InputError message={errors.title} />
                                    </Box>
                                    <Box sx={{ display: 'grid', gap: 1 }}>
                                        <Label>Description</Label>
                                        <Input
                                            value={data.description}
                                            onChange={(e) => setData('description', e.target.value)}
                                            placeholder="Brief description"
                                        />
                                    </Box>
                                    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 1.5 }}>
                                        <Box sx={{ display: 'grid', gap: 1 }}>
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
                                        </Box>
                                        <Box sx={{ display: 'grid', gap: 1 }}>
                                            <Label>Servings</Label>
                                            <Input
                                                type="number"
                                                min="1"
                                                value={data.servings}
                                                onChange={(e) => setData('servings', e.target.value)}
                                                placeholder="4"
                                            />
                                        </Box>
                                    </Box>
                                    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 1.5 }}>
                                        <Box sx={{ display: 'grid', gap: 1 }}>
                                            <Label>Prep (min)</Label>
                                            <Input
                                                type="number"
                                                min="0"
                                                value={data.prep_time_minutes}
                                                onChange={(e) => setData('prep_time_minutes', e.target.value)}
                                                placeholder="15"
                                            />
                                        </Box>
                                        <Box sx={{ display: 'grid', gap: 1 }}>
                                            <Label>Cook (min)</Label>
                                            <Input
                                                type="number"
                                                min="0"
                                                value={data.cook_time_minutes}
                                                onChange={(e) => setData('cook_time_minutes', e.target.value)}
                                                placeholder="30"
                                            />
                                        </Box>
                                    </Box>
                                    <Box sx={{ display: 'grid', gap: 1 }}>
                                        <Label>Instructions</Label>
                                        <TextField
                                            value={data.instructions}
                                            onChange={(e) => setData('instructions', e.target.value)}
                                            multiline
                                            rows={4}
                                            required
                                            placeholder="Step by step instructions…"
                                            size="small"
                                            fullWidth
                                        />
                                        <InputError message={errors.instructions} />
                                    </Box>
                                    <Box sx={{ display: 'grid', gap: 1 }}>
                                        <Label>Photo</Label>
                                        <Input type="file" accept="image/*" onChange={(e) => setData('photo', e.target.files?.[0] ?? null)} />
                                        <InputError message={errors.photo} />
                                    </Box>
                                    <Button type="submit" sx={{ width: '100%' }} disabled={processing}>
                                        {processing ? 'Creating…' : 'Create Recipe'}
                                    </Button>
                                </Stack>
                            </DialogContent>
                        </Dialog>
                    </Box>

                    {!recipes ? (
                        <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' } }}>
                            {[...Array(6)].map((_, i) => (
                                <Skeleton key={i} className="h-40 rounded-xl" />
                            ))}
                        </Box>
                    ) : recipes.data.length === 0 ? (
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
                            No recipes yet. Add your first one!
                        </Box>
                    ) : (
                        <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' } }}>
                            {recipes.data.map((recipe) => (
                                <Box
                                    key={recipe.id}
                                    role="button"
                                    tabIndex={0}
                                    aria-label={`View ${recipe.title} recipe`}
                                    sx={{
                                        position: 'relative',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        overflow: 'hidden',
                                        borderRadius: 2,
                                        border: 1,
                                        borderColor: 'divider',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s',
                                        '&:hover': { transform: 'translateY(-2px)', boxShadow: 3 },
                                    }}
                                    onClick={() => router.visit(show(recipe.id).url)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' || e.key === ' ') {
                                            e.preventDefault();
                                            router.visit(show(recipe.id).url);
                                        }
                                    }}
                                >
                                    {recipe.photo_path ? (
                                        <Box sx={{ aspectRatio: '16/9', width: '100%', overflow: 'hidden' }}>
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
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                bgcolor: 'action.hover',
                                            }}
                                        >
                                            <ChefHat size={32} style={{ color: 'var(--mui-palette-text-secondary)' }} />
                                        </Box>
                                    )}
                                    <Box sx={{ display: 'flex', flex: 1, flexDirection: 'column', p: 2 }}>
                                        <Typography sx={{ fontWeight: 600 }}>{recipe.title}</Typography>
                                        {recipe.description && (
                                            <Typography
                                                variant="caption"
                                                sx={{
                                                    mt: 0.5,
                                                    color: 'text.secondary',
                                                    display: '-webkit-box',
                                                    WebkitLineClamp: 2,
                                                    WebkitBoxOrient: 'vertical',
                                                    overflow: 'hidden',
                                                }}
                                            >
                                                {recipe.description}
                                            </Typography>
                                        )}
                                        <Box
                                            sx={{
                                                mt: 'auto',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'space-between',
                                                pt: 1.5,
                                                fontSize: '0.75rem',
                                                color: 'text.secondary',
                                            }}
                                        >
                                            {recipe.total_time_minutes > 0 && (
                                                <Box component="span" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                    <Clock size={12} /> {recipe.total_time_minutes}m
                                                </Box>
                                            )}
                                            {recipe.rating && (
                                                <Box component="span" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                    <Star
                                                        size={12}
                                                        style={{
                                                            fill: 'var(--mui-palette-warning-light)',
                                                            color: 'var(--mui-palette-warning-light)',
                                                        }}
                                                    />{' '}
                                                    {recipe.rating}/5
                                                </Box>
                                            )}
                                        </Box>
                                        <Box sx={{ mt: 1.5, display: 'flex', justifyContent: 'flex-end' }}>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    deleteRecipe(recipe);
                                                }}
                                            >
                                                <Trash2 size={16} style={{ color: 'var(--mui-palette-error-main)' }} />
                                            </Button>
                                        </Box>
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
