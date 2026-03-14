<script setup lang="ts">
import { store } from '@/actions/App/Http/Controllers/FamilyController';
import InputError from '@/components/InputError.vue';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/AppLayout.vue';
import { type BreadcrumbItem } from '@/types';
import { Form, Head } from '@inertiajs/vue3';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Create Family', href: '/family/create' }];
</script>

<template>
    <Head title="Create Family" />

    <AppLayout :breadcrumbs="breadcrumbs">
        <div class="flex items-center justify-center p-8">
            <div class="w-full max-w-md space-y-6">
                <div>
                    <h1 class="text-2xl font-bold">Create a Family</h1>
                    <p class="mt-1 text-sm text-muted-foreground">Start organizing together. You'll be the family admin.</p>
                </div>

                <Form :action="store()" method="post" class="space-y-4" v-slot="{ errors, processing }">
                    <div class="grid gap-2">
                        <Label for="name">Family Name</Label>
                        <Input id="name" name="name" placeholder="e.g. The Smith Family" required />
                        <InputError :message="errors.name" />
                    </div>

                    <Button type="submit" class="w-full" :disabled="processing">
                        {{ processing ? 'Creating…' : 'Create Family' }}
                    </Button>
                </Form>
            </div>
        </div>
    </AppLayout>
</template>

