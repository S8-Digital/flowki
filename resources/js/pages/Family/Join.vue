<script setup lang="ts">
import { joinStore } from '@/actions/App/Http/Controllers/FamilyController';
import InputError from '@/components/InputError.vue';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/AppLayout.vue';
import { type BreadcrumbItem } from '@/types';
import { Form, Head } from '@inertiajs/vue3';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Join Family', href: '/family/join' }];
</script>

<template>
    <Head title="Join Family" />

    <AppLayout :breadcrumbs="breadcrumbs">
        <div class="flex items-center justify-center p-8">
            <div class="w-full max-w-md space-y-6">
                <div>
                    <h1 class="text-2xl font-bold">Join a Family</h1>
                    <p class="mt-1 text-sm text-muted-foreground">Enter the invite code shared by your family admin.</p>
                </div>

                <Form :action="joinStore()" method="post" class="space-y-4" v-slot="{ errors, processing }">
                    <div class="grid gap-2">
                        <Label for="invite_code">Invite Code</Label>
                        <Input id="invite_code" name="invite_code" placeholder="e.g. ABCD1234" required class="uppercase" />
                        <InputError :message="errors.invite_code" />
                    </div>

                    <Button type="submit" class="w-full" :disabled="processing">
                        {{ processing ? 'Joining…' : 'Join Family' }}
                    </Button>
                </Form>
            </div>
        </div>
    </AppLayout>
</template>
