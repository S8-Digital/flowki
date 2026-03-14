<script setup lang="ts">
import { addChild, inviteMember, removeMember, update, updateMemberRole } from '@/actions/App/Http/Controllers/FamilyController';
import InputError from '@/components/InputError.vue';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/AppLayout.vue';
import { type BreadcrumbItem, type Family } from '@/types';
import { Form, Head, router, usePage } from '@inertiajs/vue3';
import { Baby, Copy, Pencil, UserMinus, UserPlus } from 'lucide-vue-next';
import { ref, watch } from 'vue';

interface Props {
    family: Family;
}

const props = defineProps<Props>();
const page = usePage();
const currentUserId = page.props.auth.user.id;

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Family', href: '/family' }];

const copied = ref(false);
const editNameOpen = ref(false);
const editableName = ref(props.family.name);
const inviteMemberOpen = ref(false);
const addChildOpen = ref(false);

// Keep editableName in sync when dialog opens
watch(editNameOpen, (open) => {
    if (open) {
        editableName.value = props.family.name;
    }
});

function copyInviteCode() {
    navigator.clipboard.writeText(props.family.invite_code);
    copied.value = true;
    setTimeout(() => (copied.value = false), 2000);
}

function removeUser(userId: number) {
    if (!confirm('Remove this member from your family?')) return;
    router.delete(removeMember({ family: props.family.id, userId }).url);
}

function changeRole(memberId: number, role: string) {
    router.patch(updateMemberRole({ family: props.family.id, userId: memberId }).url, { role });
}
</script>

<template>
    <Head title="Family" />

    <AppLayout :breadcrumbs="breadcrumbs">
        <div class="flex flex-col gap-6 p-6">
            <!-- Family Header -->
            <div class="flex items-start justify-between">
                <div class="flex items-center gap-3">
                    <div>
                        <h1 class="text-2xl font-bold">{{ family.name }}</h1>
                        <p class="text-sm text-muted-foreground">{{ family.members?.length ?? 0 }} members</p>
                    </div>
                    <!-- Edit Name -->
                    <Dialog v-model:open="editNameOpen">
                        <DialogTrigger as-child>
                            <Button variant="ghost" size="sm" class="gap-1.5 text-muted-foreground hover:text-foreground" title="Edit family name">
                                <Pencil class="size-3.5" />
                                <span class="text-xs">Edit name</span>
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader><DialogTitle>Edit Family Name</DialogTitle></DialogHeader>
                            <Form :action="update()" method="patch" class="space-y-4" v-slot="{ errors, processing }" @success="editNameOpen = false">
                                <div class="grid gap-2">
                                    <Label for="name">Family Name</Label>
                                    <Input id="name" name="name" v-model="editableName" required placeholder="e.g. The Smith Family" />
                                    <InputError :message="errors.name" />
                                </div>
                                <Button type="submit" class="w-full" :disabled="processing">
                                    {{ processing ? 'Saving…' : 'Save Name' }}
                                </Button>
                            </Form>
                        </DialogContent>
                    </Dialog>
                </div>

                <!-- Invite Code -->
                <div class="flex items-center gap-2 rounded-lg border px-3 py-2">
                    <span class="text-xs text-muted-foreground">Invite code:</span>
                    <span class="font-mono text-sm tracking-widest">{{ family.invite_code }}</span>
                    <button @click="copyInviteCode" class="text-muted-foreground transition hover:text-foreground">
                        <Copy class="size-4" />
                    </button>
                    <span v-if="copied" class="text-xs text-green-500">Copied!</span>
                </div>
            </div>

            <!-- Members -->
            <div class="rounded-xl border">
                <div class="flex items-center justify-between border-b px-4 py-3">
                    <h2 class="font-semibold">Members</h2>
                    <div class="flex items-center gap-2">
                        <!-- Add Child -->
                        <Dialog v-model:open="addChildOpen">
                            <DialogTrigger as-child>
                                <Button size="sm" variant="outline"> <Baby class="mr-1 size-4" /> Add Child </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader><DialogTitle>Add Child</DialogTitle></DialogHeader>
                                <p class="text-sm text-muted-foreground">
                                    Children are added directly and don't need to log in. They can be assigned todos and chores.
                                </p>
                                <Form
                                    :action="addChild()"
                                    method="post"
                                    class="space-y-4"
                                    v-slot="{ errors, processing }"
                                    reset-on-success
                                    @success="addChildOpen = false"
                                >
                                    <div class="grid gap-2">
                                        <Label for="child-name">Child's Name</Label>
                                        <Input id="child-name" name="name" placeholder="e.g. Emma" required />
                                        <InputError :message="errors.name" />
                                    </div>
                                    <Button type="submit" class="w-full" :disabled="processing">
                                        {{ processing ? 'Adding…' : 'Add Child' }}
                                    </Button>
                                </Form>
                            </DialogContent>
                        </Dialog>

                        <!-- Invite Member -->
                        <Dialog v-model:open="inviteMemberOpen">
                            <DialogTrigger as-child>
                                <Button size="sm" variant="outline"> <UserPlus class="mr-1 size-4" /> Invite Member </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader><DialogTitle>Invite Family Member</DialogTitle></DialogHeader>
                                <Form
                                    :action="inviteMember()"
                                    method="post"
                                    class="space-y-4"
                                    v-slot="{ errors, processing }"
                                    reset-on-success
                                    @success="inviteMemberOpen = false"
                                >
                                    <p class="text-sm text-muted-foreground">
                                        An invitation email will be sent with a link to set up their account and join your family.
                                    </p>
                                    <div class="grid gap-2">
                                        <Label for="invite-email">Email Address</Label>
                                        <Input id="invite-email" name="email" type="email" placeholder="their@email.com" required />
                                        <InputError :message="errors.email" />
                                    </div>
                                    <div class="grid gap-2">
                                        <Label for="invite-role">Role</Label>
                                        <select
                                            id="invite-role"
                                            name="role"
                                            class="rounded-md border border-input bg-background px-3 py-2 text-sm"
                                            required
                                        >
                                            <option value="member">Member</option>
                                            <option value="guest">Guest (read-only)</option>
                                        </select>
                                        <InputError :message="errors.role" />
                                    </div>
                                    <Button type="submit" class="w-full" :disabled="processing">
                                        {{ processing ? 'Sending Invite…' : 'Send Invitation' }}
                                    </Button>
                                </Form>
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>
                <ul class="divide-y">
                    <li v-for="member in family.members" :key="member.id" class="flex items-center justify-between px-4 py-3">
                        <div>
                            <div class="flex items-center gap-2">
                                <p class="font-medium">{{ member.name || member.email }}</p>
                                <span
                                    v-if="member.is_pending"
                                    class="rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                                >
                                    Pending
                                </span>
                                <span
                                    v-if="member.is_child"
                                    class="rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                                >
                                    Child
                                </span>
                            </div>
                            <p class="text-sm text-muted-foreground">{{ member.email ?? 'No email' }}</p>
                        </div>
                        <div class="flex items-center gap-3">
                            <select
                                v-if="member.id !== currentUserId && !member.is_child"
                                :value="member.role"
                                @change="changeRole(member.id, ($event.target as HTMLSelectElement).value)"
                                class="rounded-full border border-input bg-transparent px-2 py-0.5 text-xs capitalize"
                            >
                                <option value="admin">Admin</option>
                                <option value="member">Member</option>
                                <option value="guest">Guest</option>
                            </select>
                            <span v-else-if="member.id === currentUserId" class="rounded-full bg-secondary px-2 py-0.5 text-xs capitalize">
                                {{ member.role }}
                            </span>
                            <span v-else class="rounded-full bg-secondary px-2 py-0.5 text-xs capitalize">
                                {{ member.role }}
                            </span>
                            <Button v-if="member.id !== currentUserId" variant="ghost" size="icon" @click="removeUser(member.id)">
                                <UserMinus class="size-4 text-destructive" />
                            </Button>
                        </div>
                    </li>
                </ul>
            </div>
        </div>
    </AppLayout>
</template>
