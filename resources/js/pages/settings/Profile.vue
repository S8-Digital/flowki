<script setup lang="ts">
import ProfileController from '@/actions/App/Http/Controllers/Settings/ProfileController';
import { edit } from '@/routes/profile';
import { send } from '@/routes/verification';
import { Form, Head, Link, router, usePage } from '@inertiajs/vue3';
import { CalendarCheck, CalendarX } from 'lucide-vue-next';

import DeleteUser from '@/components/DeleteUser.vue';
import HeadingSmall from '@/components/HeadingSmall.vue';
import InputError from '@/components/InputError.vue';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/AppLayout.vue';
import SettingsLayout from '@/layouts/settings/Layout.vue';
import { type BreadcrumbItem } from '@/types';

interface Props {
    mustVerifyEmail: boolean;
    status?: string;
    hasGoogleCalendarConnected: boolean;
}

defineProps<Props>();

const breadcrumbItems: BreadcrumbItem[] = [
    {
        title: 'Profile settings',
        href: edit().url,
    },
];

const page = usePage();
const user = page.props.auth.user;

function connectGoogleCalendar() {
    router.visit('/auth/google/calendar');
}

function disconnectGoogleCalendar() {
    if (!confirm('Disconnect Google Calendar? Future todos and chores will no longer sync.')) return;
    router.delete('/auth/google/calendar');
}
</script>

<template>
    <AppLayout :breadcrumbs="breadcrumbItems">
        <Head title="Profile settings" />

        <SettingsLayout>
            <div class="flex flex-col space-y-6">
                <HeadingSmall title="Profile information" description="Update your name and email address" />

                <Form v-bind="ProfileController.update.form()" class="space-y-6" v-slot="{ errors, processing, recentlySuccessful }">
                    <div class="grid gap-2">
                        <Label for="name">Name</Label>
                        <Input
                            id="name"
                            class="mt-1 block w-full"
                            name="name"
                            :default-value="user.name"
                            required
                            autocomplete="name"
                            placeholder="Full name"
                        />
                        <InputError class="mt-2" :message="errors.name" />
                    </div>

                    <div class="grid gap-2">
                        <Label for="email">Email address</Label>
                        <Input
                            id="email"
                            type="email"
                            class="mt-1 block w-full"
                            name="email"
                            :default-value="user.email"
                            required
                            autocomplete="username"
                            placeholder="Email address"
                        />
                        <InputError class="mt-2" :message="errors.email" />
                    </div>

                    <div v-if="mustVerifyEmail && !user.email_verified_at">
                        <p class="-mt-4 text-sm text-muted-foreground">
                            Your email address is unverified.
                            <Link
                                :href="send()"
                                as="button"
                                class="text-foreground underline decoration-neutral-300 underline-offset-4 transition-colors duration-300 ease-out hover:decoration-current! dark:decoration-neutral-500"
                            >
                                Click here to resend the verification email.
                            </Link>
                        </p>

                        <div v-if="status === 'verification-link-sent'" class="mt-2 text-sm font-medium text-green-600">
                            A new verification link has been sent to your email address.
                        </div>
                    </div>

                    <div class="flex items-center gap-4">
                        <Button :disabled="processing">Save</Button>

                        <Transition
                            enter-active-class="transition ease-in-out"
                            enter-from-class="opacity-0"
                            leave-active-class="transition ease-in-out"
                            leave-to-class="opacity-0"
                        >
                            <p v-show="recentlySuccessful" class="text-sm text-neutral-600">Saved.</p>
                        </Transition>
                    </div>
                </Form>
            </div>

            <!-- Google Calendar -->
            <div class="flex flex-col space-y-6">
                <HeadingSmall title="Google Calendar" description="Sync your assigned todos and chores to your personal Google Calendar." />

                <div class="rounded-lg border p-4">
                    <div v-if="hasGoogleCalendarConnected" class="flex items-center justify-between gap-4">
                        <div class="flex items-center gap-3">
                            <div class="flex size-9 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                                <CalendarCheck class="size-5 text-green-600 dark:text-green-400" />
                            </div>
                            <div>
                                <p class="text-sm font-medium">Connected</p>
                                <p class="text-xs text-muted-foreground">Todos and chores assigned to you will sync automatically.</p>
                            </div>
                        </div>
                        <Button variant="outline" size="sm" @click="disconnectGoogleCalendar">
                            <CalendarX class="mr-1.5 size-4" />
                            Disconnect
                        </Button>
                    </div>
                    <div v-else class="flex items-center justify-between gap-4">
                        <div class="flex items-center gap-3">
                            <div class="flex size-9 items-center justify-center rounded-full bg-muted">
                                <CalendarX class="size-5 text-muted-foreground" />
                            </div>
                            <div>
                                <p class="text-sm font-medium">Not connected</p>
                                <p class="text-xs text-muted-foreground">Connect to sync your assigned todos and chores.</p>
                            </div>
                        </div>
                        <Button size="sm" @click="connectGoogleCalendar">
                            <CalendarCheck class="mr-1.5 size-4" />
                            Connect Google Calendar
                        </Button>
                    </div>

                    <div v-if="status === 'google-calendar-connected'" class="mt-3 text-sm font-medium text-green-600">
                        Google Calendar connected successfully!
                    </div>
                    <div v-if="status === 'google-calendar-disconnected'" class="mt-3 text-sm text-muted-foreground">
                        Google Calendar has been disconnected.
                    </div>
                </div>
            </div>

            <DeleteUser />
        </SettingsLayout>
    </AppLayout>
</template>
