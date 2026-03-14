<script setup lang="ts">
import HeadingSmall from '@/components/HeadingSmall.vue';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import AppLayout from '@/layouts/AppLayout.vue';
import SettingsLayout from '@/layouts/settings/Layout.vue';
import { type BreadcrumbItem } from '@/types';
import { router } from '@inertiajs/vue3';
import { Head } from '@inertiajs/vue3';
import { Plus, Trash2 } from 'lucide-vue-next';
import { ref } from 'vue';

interface Category {
    value: string;
    label: string;
}

interface Props {
    todoCategories: Category[];
    recipeCategories: Category[];
    shoppingCategories: Category[];
}

const props = defineProps<Props>();

const breadcrumbItems: BreadcrumbItem[] = [{ title: 'Categories', href: '/settings/categories' }];

const todoCategories = ref<Category[]>(props.todoCategories.map((c) => ({ ...c })));
const recipeCategories = ref<Category[]>(props.recipeCategories.map((c) => ({ ...c })));
const shoppingCategories = ref<Category[]>(props.shoppingCategories.map((c) => ({ ...c })));

const saving = ref(false);
const saved = ref(false);

function addCategory(list: Category[]) {
    list.push({ value: '', label: '' });
}

function removeCategory(list: Category[], index: number) {
    list.splice(index, 1);
}

function slugify(label: string): string {
    return label
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '_')
        .replace(/^_|_$/g, '');
}

function onLabelInput(category: Category) {
    if (!category.value || category.value === slugify(category.label.slice(0, -1))) {
        category.value = slugify(category.label);
    }
}

function save() {
    saving.value = true;

    router.post(
        '/settings/categories',
        {
            todo_categories: todoCategories.value,
            recipe_categories: recipeCategories.value,
            shopping_categories: shoppingCategories.value,
        },
        {
            onSuccess: () => {
                saved.value = true;
                setTimeout(() => (saved.value = false), 2000);
            },
            onFinish: () => {
                saving.value = false;
            },
        },
    );
}
</script>

<template>
    <AppLayout :breadcrumbs="breadcrumbItems">
        <Head title="Categories" />

        <SettingsLayout>
            <!-- Todo Categories -->
            <div class="flex flex-col space-y-4">
                <HeadingSmall title="Todo Categories" description="Customize the categories available for todos." />

                <div class="space-y-2">
                    <div
                        v-for="(cat, i) in todoCategories"
                        :key="i"
                        class="flex items-center gap-2"
                    >
                        <Input
                            v-model="cat.label"
                            placeholder="Label (e.g. Household)"
                            class="flex-1"
                            @input="onLabelInput(cat)"
                        />
                        <Input
                            v-model="cat.value"
                            placeholder="Value (e.g. household)"
                            class="w-40 font-mono text-xs"
                        />
                        <Button variant="ghost" size="icon" @click="removeCategory(todoCategories, i)" title="Remove">
                            <Trash2 class="size-4 text-destructive" />
                        </Button>
                    </div>
                </div>

                <Button variant="outline" size="sm" class="w-fit" @click="addCategory(todoCategories)">
                    <Plus class="mr-1 size-4" /> Add Category
                </Button>
            </div>

            <!-- Recipe Categories -->
            <div class="flex flex-col space-y-4">
                <HeadingSmall title="Recipe Categories" description="Customize the categories available for recipes." />

                <div class="space-y-2">
                    <div
                        v-for="(cat, i) in recipeCategories"
                        :key="i"
                        class="flex items-center gap-2"
                    >
                        <Input
                            v-model="cat.label"
                            placeholder="Label (e.g. Dessert)"
                            class="flex-1"
                            @input="onLabelInput(cat)"
                        />
                        <Input
                            v-model="cat.value"
                            placeholder="Value (e.g. dessert)"
                            class="w-40 font-mono text-xs"
                        />
                        <Button variant="ghost" size="icon" @click="removeCategory(recipeCategories, i)" title="Remove">
                            <Trash2 class="size-4 text-destructive" />
                        </Button>
                    </div>
                </div>

                <Button variant="outline" size="sm" class="w-fit" @click="addCategory(recipeCategories)">
                    <Plus class="mr-1 size-4" /> Add Category
                </Button>
            </div>

            <!-- Shopping Categories -->
            <div class="flex flex-col space-y-4">
                <HeadingSmall title="Shopping Categories" description="Customize the categories available for shopping items." />

                <div class="space-y-2">
                    <div
                        v-for="(cat, i) in shoppingCategories"
                        :key="i"
                        class="flex items-center gap-2"
                    >
                        <Input
                            v-model="cat.label"
                            placeholder="Label (e.g. Snacks)"
                            class="flex-1"
                            @input="onLabelInput(cat)"
                        />
                        <Input
                            v-model="cat.value"
                            placeholder="Value (e.g. snacks)"
                            class="w-40 font-mono text-xs"
                        />
                        <Button variant="ghost" size="icon" @click="removeCategory(shoppingCategories, i)" title="Remove">
                            <Trash2 class="size-4 text-destructive" />
                        </Button>
                    </div>
                </div>

                <Button variant="outline" size="sm" class="w-fit" @click="addCategory(shoppingCategories)">
                    <Plus class="mr-1 size-4" /> Add Category
                </Button>
            </div>

            <!-- Save -->
            <div class="flex items-center gap-4">
                <Button @click="save" :disabled="saving">
                    {{ saving ? 'Saving…' : 'Save Categories' }}
                </Button>
                <Transition
                    enter-active-class="transition ease-in-out"
                    enter-from-class="opacity-0"
                    leave-active-class="transition ease-in-out"
                    leave-to-class="opacity-0"
                >
                    <p v-show="saved" class="text-sm text-neutral-600">Saved.</p>
                </Transition>
            </div>
        </SettingsLayout>
    </AppLayout>
</template>

