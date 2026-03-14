<script setup lang="ts">
import { destroy, update } from '@/actions/App/Http/Controllers/RecipeController';
import { index as shoppingIndex } from '@/actions/App/Http/Controllers/ShoppingListController';
import InputError from '@/components/InputError.vue';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/AppLayout.vue';
import { type BreadcrumbItem, type Recipe } from '@/types';
import { Form, Head, Link, router } from '@inertiajs/vue3';
import { ChefHat, Clock, Heart, Star, Trash2, Users } from 'lucide-vue-next';
import { ref } from 'vue';

interface Props {
    recipe: Recipe;
}

const props = defineProps<Props>();

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Recipes', href: '/recipes' },
    { title: props.recipe.title, href: `/recipes/${props.recipe.id}` },
];

const editOpen = ref(false);

function deleteRecipe() {
    if (!confirm('Delete this recipe?')) return;
    router.delete(destroy(props.recipe.id).url, { onSuccess: () => router.visit('/recipes') });
}
</script>

<template>
    <Head :title="recipe.title" />

    <AppLayout :breadcrumbs="breadcrumbs">
        <div class="flex flex-col gap-6 p-6">
            <!-- Hero -->
            <div class="overflow-hidden rounded-xl border">
                <div v-if="recipe.photo_path" class="aspect-video max-h-72 w-full overflow-hidden">
                    <img :src="`/storage/${recipe.photo_path}`" :alt="recipe.title" class="h-full w-full object-cover" />
                </div>
                <div v-else class="flex aspect-video max-h-44 items-center justify-center bg-muted">
                    <ChefHat class="size-12 text-muted-foreground" />
                </div>

                <div class="p-5">
                    <div class="flex items-start justify-between gap-2">
                        <div>
                            <h1 class="text-2xl font-bold">{{ recipe.title }}</h1>
                            <p v-if="recipe.description" class="mt-1 text-sm text-muted-foreground">{{ recipe.description }}</p>
                        </div>
                        <div class="flex items-center gap-2">
                            <Heart v-if="recipe.is_favorite" class="size-5 fill-red-500 text-red-500" />
                            <Dialog v-model:open="editOpen">
                                <DialogTrigger as-child>
                                    <Button variant="outline" size="sm">Edit</Button>
                                </DialogTrigger>
                                <DialogContent class="max-h-[90vh] overflow-y-auto">
                                    <DialogHeader><DialogTitle>Edit Recipe</DialogTitle></DialogHeader>
                                    <Form :action="update(recipe.id)" method="patch" class="space-y-4" v-slot="{ errors, processing }">
                                        <div class="grid gap-2">
                                            <Label>Title</Label>
                                            <Input name="title" :default-value="recipe.title" required />
                                            <InputError :message="errors.title" />
                                        </div>
                                        <div class="grid gap-2">
                                            <Label>Description</Label>
                                            <Input name="description" :default-value="recipe.description ?? ''" />
                                        </div>
                                        <div class="grid grid-cols-2 gap-3">
                                            <div class="grid gap-2">
                                                <Label>Prep (min)</Label>
                                                <Input name="prep_time_minutes" type="number" :default-value="recipe.prep_time_minutes ?? 0" />
                                            </div>
                                            <div class="grid gap-2">
                                                <Label>Cook (min)</Label>
                                                <Input name="cook_time_minutes" type="number" :default-value="recipe.cook_time_minutes ?? 0" />
                                            </div>
                                        </div>
                                        <div class="grid gap-2">
                                            <Label>Instructions</Label>
                                            <textarea
                                                name="instructions"
                                                rows="5"
                                                :value="recipe.instructions"
                                                required
                                                class="w-full rounded-md border bg-background px-3 py-2 text-sm focus:ring-1 focus:ring-ring focus:outline-none"
                                            />
                                            <InputError :message="errors.instructions" />
                                        </div>
                                        <div class="grid grid-cols-2 gap-3">
                                            <div class="grid gap-2">
                                                <Label>Rating</Label>
                                                <Input name="rating" type="number" min="1" max="5" :default-value="recipe.rating ?? ''" />
                                            </div>
                                            <div class="flex items-center gap-2 pt-6">
                                                <input
                                                    id="is_favorite"
                                                    name="is_favorite"
                                                    type="checkbox"
                                                    value="1"
                                                    :checked="recipe.is_favorite"
                                                    class="rounded"
                                                />
                                                <Label for="is_favorite">Favourite</Label>
                                            </div>
                                        </div>
                                        <Button type="submit" class="w-full" :disabled="processing">
                                            {{ processing ? 'Saving…' : 'Save Changes' }}
                                        </Button>
                                    </Form>
                                </DialogContent>
                            </Dialog>
                            <Button variant="ghost" size="icon" @click="deleteRecipe">
                                <Trash2 class="size-4 text-destructive" />
                            </Button>
                        </div>
                    </div>

                    <!-- Stats -->
                    <div class="mt-4 flex flex-wrap gap-4 text-sm">
                        <span v-if="recipe.servings" class="flex items-center gap-1 text-muted-foreground">
                            <Users class="size-4" /> {{ recipe.servings }} servings
                        </span>
                        <span v-if="recipe.total_time_minutes > 0" class="flex items-center gap-1 text-muted-foreground">
                            <Clock class="size-4" /> {{ recipe.total_time_minutes }} min total
                        </span>
                        <span v-if="recipe.rating" class="flex items-center gap-1 text-muted-foreground">
                            <Star class="size-4 fill-yellow-400 text-yellow-400" /> {{ recipe.rating }}/5
                        </span>
                        <span v-if="recipe.category" class="rounded-full bg-secondary px-2 py-0.5 capitalize">{{ recipe.category }}</span>
                    </div>
                </div>
            </div>

            <div class="grid gap-6 lg:grid-cols-3">
                <!-- Ingredients -->
                <div class="rounded-xl border p-4">
                    <h2 class="mb-3 font-semibold">Ingredients</h2>
                    <ul v-if="recipe.ingredients?.length" class="space-y-2">
                        <li v-for="ingredient in recipe.ingredients" :key="ingredient.id" class="flex items-center gap-2 text-sm">
                            <span class="size-1.5 rounded-full bg-foreground" />
                            <span v-if="ingredient.quantity" class="font-medium">{{ ingredient.quantity }}</span>
                            <span v-if="ingredient.unit" class="text-muted-foreground">{{ ingredient.unit }}</span>
                            <span>{{ ingredient.name }}</span>
                        </li>
                    </ul>
                    <p v-else class="text-sm text-muted-foreground">No ingredients listed.</p>
                    <Link :href="shoppingIndex().url" class="mt-4 block text-xs text-muted-foreground hover:underline"> Add to shopping list → </Link>
                </div>

                <!-- Instructions -->
                <div class="rounded-xl border p-4 lg:col-span-2">
                    <h2 class="mb-3 font-semibold">Instructions</h2>
                    <div class="prose prose-sm dark:prose-invert max-w-none text-sm whitespace-pre-line">{{ recipe.instructions }}</div>
                </div>
            </div>
        </div>
    </AppLayout>
</template>
