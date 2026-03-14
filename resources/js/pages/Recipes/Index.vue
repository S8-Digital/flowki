<script setup lang="ts">
import { destroy, show, store } from '@/actions/App/Http/Controllers/RecipeController';
import InputError from '@/components/InputError.vue';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import AppLayout from '@/layouts/AppLayout.vue';
import { type BreadcrumbItem, type PaginatedResource, type Recipe } from '@/types';
import { Form, Head, Link, router, WhenVisible } from '@inertiajs/vue3';
import { ChefHat, Clock, ExternalLink, Plus, Star, Trash2 } from 'lucide-vue-next';
import { ref } from 'vue';

interface Props {
    recipes: PaginatedResource<Recipe> | null;
    filters: Record<string, string>;
}

const props = defineProps<Props>();

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Recipes', href: '/recipes' }];
const createOpen = ref(false);

function deleteRecipe(recipe: Recipe) {
    if (!confirm('Delete this recipe?')) return;
    router.delete(destroy(recipe.id).url);
}
</script>

<template>
    <Head title="Recipes" />

    <AppLayout :breadcrumbs="breadcrumbs">
        <div class="flex flex-col gap-4 p-6">
            <div class="flex items-center justify-between">
                <h1 class="text-xl font-semibold">Recipes</h1>

                <Dialog v-model:open="createOpen">
                    <DialogTrigger as-child>
                        <Button size="sm"><Plus class="mr-1 size-4" /> New Recipe</Button>
                    </DialogTrigger>
                    <DialogContent class="max-h-[90vh] overflow-y-auto">
                        <DialogHeader><DialogTitle>Create Recipe</DialogTitle></DialogHeader>
                        <Form :action="store()" method="post" enctype="multipart/form-data" class="space-y-4" v-slot="{ errors, processing }" reset-on-success>
                            <div class="grid gap-2">
                                <Label for="title">Title</Label>
                                <Input id="title" name="title" placeholder="Recipe name" required />
                                <InputError :message="errors.title" />
                            </div>
                            <div class="grid gap-2">
                                <Label for="description">Description</Label>
                                <Input id="description" name="description" placeholder="Brief description" />
                            </div>
                            <div class="grid grid-cols-2 gap-3">
                                <div class="grid gap-2">
                                    <Label for="category">Category</Label>
                                    <select id="category" name="category" class="h-9 w-full rounded-md border bg-background px-3 text-sm">
                                        <option value="">None</option>
                                        <option value="breakfast">Breakfast</option>
                                        <option value="lunch">Lunch</option>
                                        <option value="dinner">Dinner</option>
                                        <option value="snack">Snack</option>
                                        <option value="dessert">Dessert</option>
                                        <option value="drink">Drink</option>
                                    </select>
                                </div>
                                <div class="grid gap-2">
                                    <Label for="servings">Servings</Label>
                                    <Input id="servings" name="servings" type="number" min="1" placeholder="4" />
                                </div>
                            </div>
                            <div class="grid grid-cols-2 gap-3">
                                <div class="grid gap-2">
                                    <Label for="prep_time_minutes">Prep (min)</Label>
                                    <Input id="prep_time_minutes" name="prep_time_minutes" type="number" min="0" placeholder="15" />
                                </div>
                                <div class="grid gap-2">
                                    <Label for="cook_time_minutes">Cook (min)</Label>
                                    <Input id="cook_time_minutes" name="cook_time_minutes" type="number" min="0" placeholder="30" />
                                </div>
                            </div>
                            <div class="grid gap-2">
                                <Label for="instructions">Instructions</Label>
                                <textarea id="instructions" name="instructions" rows="4" required placeholder="Step by step instructions…"
                                    class="w-full rounded-md border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring" />
                                <InputError :message="errors.instructions" />
                            </div>
                            <div class="grid gap-2">
                                <Label for="photo">Photo</Label>
                                <Input id="photo" name="photo" type="file" accept="image/*" />
                                <InputError :message="errors.photo" />
                            </div>
                            <Button type="submit" class="w-full" :disabled="processing">
                                {{ processing ? 'Creating…' : 'Create Recipe' }}
                            </Button>
                        </Form>
                    </DialogContent>
                </Dialog>
            </div>

            <WhenVisible :data="['recipes']" key="recipes-list">
                <template #fallback>
                    <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        <Skeleton v-for="i in 6" :key="i" class="h-40 rounded-xl" />
                    </div>
                </template>

                <div v-if="recipes && recipes.data.length === 0" class="rounded-xl border border-dashed py-16 text-center text-sm text-muted-foreground">
                    No recipes yet. Add your first one!
                </div>

                <div v-else-if="recipes" class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <div v-for="recipe in recipes.data" :key="recipe.id"
                        class="group relative flex flex-col overflow-hidden rounded-xl border transition hover:shadow-md">
                        <div v-if="recipe.photo_path" class="aspect-video w-full overflow-hidden">
                            <img :src="`/storage/${recipe.photo_path}`" :alt="recipe.title" class="h-full w-full object-cover" />
                        </div>
                        <div v-else class="flex aspect-video items-center justify-center bg-muted">
                            <ChefHat class="size-8 text-muted-foreground" />
                        </div>

                        <div class="flex flex-1 flex-col p-4">
                            <p class="font-semibold">{{ recipe.title }}</p>
                            <p v-if="recipe.description" class="mt-1 line-clamp-2 text-xs text-muted-foreground">{{ recipe.description }}</p>

                            <div class="mt-auto flex items-center justify-between pt-3 text-xs text-muted-foreground">
                                <span v-if="recipe.total_time_minutes > 0" class="flex items-center gap-1">
                                    <Clock class="size-3" /> {{ recipe.total_time_minutes }}m
                                </span>
                                <span v-if="recipe.rating" class="flex items-center gap-1">
                                    <Star class="size-3 fill-yellow-400 text-yellow-400" /> {{ recipe.rating }}/5
                                </span>
                            </div>

                            <div class="mt-3 flex items-center justify-between">
                                <Link :href="show(recipe.id).url" class="text-sm font-medium hover:underline">
                                    View <ExternalLink class="ml-1 inline size-3" />
                                </Link>
                                <Button variant="ghost" size="icon" @click="deleteRecipe(recipe)">
                                    <Trash2 class="size-4 text-destructive" />
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </WhenVisible>
        </div>
    </AppLayout>
</template>

