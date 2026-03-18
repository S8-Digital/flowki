import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { Baby, Copy, GripVertical, MapPin, Pencil, Settings, UserMinus, UserPlus } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { addChild, inviteMember, removeMember, update, updateMemberRole } from '@/actions/App/Http/Controllers/FamilyController';
import { update as updateMemberOrder } from '@/actions/App/Http/Controllers/Settings/MemberOrderController';
import { edit as permissionsEdit } from '@/actions/App/Http/Controllers/Settings/PermissionController';
import InputError from '@/components/InputError';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/AppLayout';
import type { AppPageProps, BreadcrumbItem, Family, User } from '@/types';

interface Props {
    family: Family;
}

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Family', href: '/family' }];

export default function FamilyShow({ family }: Props) {
    const page = usePage<AppPageProps>();
    const currentUserId = page.props.auth.user.id;
    const canManageMembers = page.props.currentUserPermissions.includes('manage-members');
    const canManageFamily = page.props.currentUserPermissions.includes('manage-family');

    const [copied, setCopied] = useState(false);
    const [editNameOpen, setEditNameOpen] = useState(false);
    const [editLocationOpen, setEditLocationOpen] = useState(false);
    const [inviteMemberOpen, setInviteMemberOpen] = useState(false);
    const [addChildOpen, setAddChildOpen] = useState(false);

    const editNameForm = useForm({ name: family.name });
    const editLocationForm = useForm({
        name: family.name,
        location_name: family.location_name ?? '',
        latitude: family.latitude !== null ? String(family.latitude) : '',
        longitude: family.longitude !== null ? String(family.longitude) : '',
    });
    const inviteForm = useForm({ email: '', role: 'member' });
    const addChildForm = useForm({ name: '' });

    useEffect(() => {
        if (editNameOpen) {
            editNameForm.setData('name', family.name);
        }
    }, [editNameForm, editNameOpen, family.name]);

    useEffect(() => {
        if (editLocationOpen) {
            editLocationForm.setData({
                name: family.name,
                location_name: family.location_name ?? '',
                latitude: family.latitude !== null ? String(family.latitude) : '',
                longitude: family.longitude !== null ? String(family.longitude) : '',
            });
        }
    }, [editLocationForm, editLocationOpen, family]);

    function copyInviteCode() {
        navigator.clipboard.writeText(family.invite_code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }

    function handleEditName(e: React.FormEvent) {
        e.preventDefault();
        editNameForm.patch(update().url, { onSuccess: () => setEditNameOpen(false) });
    }

    function handleEditLocation(e: React.FormEvent) {
        e.preventDefault();
        editLocationForm.patch(update().url, { onSuccess: () => setEditLocationOpen(false) });
    }

    function handleInvite(e: React.FormEvent) {
        e.preventDefault();
        inviteForm.post(inviteMember().url, {
            onSuccess: () => {
                setInviteMemberOpen(false);
                inviteForm.reset();
            },
        });
    }

    function handleAddChild(e: React.FormEvent) {
        e.preventDefault();
        addChildForm.post(addChild().url, {
            onSuccess: () => {
                setAddChildOpen(false);
                addChildForm.reset();
            },
        });
    }

    function removeUser(userId: number) {
        if (!confirm('Remove this member from your family?')) {
            return;
        }

        router.delete(removeMember({ family: family.id, userId }).url);
    }

    function changeRole(memberId: number, role: string) {
        router.patch(updateMemberRole({ family: family.id, userId: memberId }).url, { role });
    }

    // Member ordering (admin only)
    const initialOrder: User[] = (() => {
        const members = family.members ?? [];
        const order = family.member_order ?? [];

        if (!order.length) {
            return members;
        }

        const orderMap = new Map(order.map((id, idx) => [id, idx]));

        return [...members].sort((a, b) => (orderMap.get(a.id) ?? Infinity) - (orderMap.get(b.id) ?? Infinity));
    })();

    const [memberOrder, setMemberOrder] = useState<User[]>(initialOrder);
    const [orderSaving, setOrderSaving] = useState(false);
    const [orderSaved, setOrderSaved] = useState(false);
    const [draggingId, setDraggingId] = useState<number | null>(null);
    const [dragOverId, setDragOverId] = useState<number | null>(null);
    const isFirstRender = useRef(true);

    // Auto-save member order whenever it changes (debounced)
    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;

            return;
        }

        const timer = setTimeout(() => {
            setOrderSaving(true);
            router.patch(
                updateMemberOrder().url,
                { member_order: memberOrder.map((m) => m.id) },
                {
                    onSuccess: () => {
                        setOrderSaved(true);
                        setTimeout(() => setOrderSaved(false), 2000);
                    },
                    onFinish: () => setOrderSaving(false),
                },
            );
        }, 600);

        return () => clearTimeout(timer);
    }, [memberOrder]);

    function onDragStart(memberId: number) {
        setDraggingId(memberId);
    }

    function onDragOver(e: React.DragEvent, memberId: number) {
        e.preventDefault();
        setDragOverId(memberId);
    }

    function onDrop(targetMemberId: number) {
        if (draggingId === null || draggingId === targetMemberId) {
            setDraggingId(null);
            setDragOverId(null);

            return;
        }

        const newOrder = [...memberOrder];
        const fromIdx = newOrder.findIndex((m) => m.id === draggingId);
        const toIdx = newOrder.findIndex((m) => m.id === targetMemberId);
        const [moved] = newOrder.splice(fromIdx, 1);
        newOrder.splice(toIdx, 0, moved);
        setMemberOrder(newOrder);
        setDraggingId(null);
        setDragOverId(null);
    }

    function onDragEnd() {
        setDraggingId(null);
        setDragOverId(null);
    }

    return (
        <>
            <Head title="Family" />
            <AppLayout breadcrumbs={breadcrumbs}>
                <div className="flex flex-col gap-6 p-6">
                    <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                            <div>
                                <h1 className="text-2xl font-bold">{family.name}</h1>
                                <p className="text-sm text-muted-foreground">{family.members?.length ?? 0} members</p>
                            </div>
                            <Dialog open={editNameOpen} onOpenChange={setEditNameOpen}>
                                <DialogTrigger asChild>
                                    <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground hover:text-foreground">
                                        <Pencil className="size-3.5" />
                                        <span className="text-xs">Edit name</span>
                                    </Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Edit Family Name</DialogTitle>
                                    </DialogHeader>
                                    <form onSubmit={handleEditName} className="space-y-4">
                                        <div className="grid gap-2">
                                            <Label htmlFor="name">Family Name</Label>
                                            <Input
                                                id="name"
                                                value={editNameForm.data.name}
                                                onChange={(e) => editNameForm.setData('name', e.target.value)}
                                                required
                                                placeholder="e.g. The Smith Family"
                                            />
                                            <InputError message={editNameForm.errors.name} />
                                        </div>
                                        <Button type="submit" className="w-full" disabled={editNameForm.processing}>
                                            {editNameForm.processing ? 'Saving…' : 'Save Name'}
                                        </Button>
                                    </form>
                                </DialogContent>
                            </Dialog>
                        </div>

                        <div className="flex items-center gap-2 rounded-lg border px-3 py-2">
                            <span className="text-xs text-muted-foreground">Invite code:</span>
                            <span className="font-mono text-sm tracking-widest">{family.invite_code}</span>
                            <button onClick={copyInviteCode} className="text-muted-foreground transition hover:text-foreground">
                                <Copy className="size-4" />
                            </button>
                            {copied && <span className="text-xs text-green-500">Copied!</span>}
                        </div>
                    </div>

                    {/* Location section */}
                    <div className="rounded-xl border p-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <MapPin className="size-4 text-muted-foreground" />
                                <span className="text-sm font-medium">Location</span>
                            </div>
                            {canManageFamily && (
                                <Dialog open={editLocationOpen} onOpenChange={setEditLocationOpen}>
                                    <DialogTrigger asChild>
                                        <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground hover:text-foreground">
                                            <Pencil className="size-3.5" />
                                            <span className="text-xs">Edit</span>
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                        <DialogHeader>
                                            <DialogTitle>Set Family Location</DialogTitle>
                                        </DialogHeader>
                                        <form onSubmit={handleEditLocation} className="space-y-4">
                                            <p className="text-sm text-muted-foreground">
                                                Used to show local weather on the dashboard and calendar. Enter a city name, or provide coordinates
                                                for more accuracy.
                                            </p>
                                            <div className="grid gap-2">
                                                <Label htmlFor="location_name">City / Location Name</Label>
                                                <Input
                                                    id="location_name"
                                                    value={editLocationForm.data.location_name}
                                                    onChange={(e) => editLocationForm.setData('location_name', e.target.value)}
                                                    placeholder="e.g. London, Paris, New York"
                                                />
                                                <InputError message={editLocationForm.errors.location_name} />
                                            </div>
                                            <div className="grid grid-cols-2 gap-3">
                                                <div className="grid gap-2">
                                                    <Label htmlFor="latitude">
                                                        Latitude <span className="text-xs text-muted-foreground">(optional)</span>
                                                    </Label>
                                                    <Input
                                                        id="latitude"
                                                        type="number"
                                                        step="any"
                                                        value={editLocationForm.data.latitude}
                                                        onChange={(e) => editLocationForm.setData('latitude', e.target.value)}
                                                        placeholder="51.5074"
                                                    />
                                                    <InputError message={editLocationForm.errors.latitude} />
                                                </div>
                                                <div className="grid gap-2">
                                                    <Label htmlFor="longitude">
                                                        Longitude <span className="text-xs text-muted-foreground">(optional)</span>
                                                    </Label>
                                                    <Input
                                                        id="longitude"
                                                        type="number"
                                                        step="any"
                                                        value={editLocationForm.data.longitude}
                                                        onChange={(e) => editLocationForm.setData('longitude', e.target.value)}
                                                        placeholder="-0.1278"
                                                    />
                                                    <InputError message={editLocationForm.errors.longitude} />
                                                </div>
                                            </div>
                                            <Button type="submit" className="w-full" disabled={editLocationForm.processing}>
                                                {editLocationForm.processing ? 'Saving…' : 'Save Location'}
                                            </Button>
                                        </form>
                                    </DialogContent>
                                </Dialog>
                            )}
                        </div>
                        {family.location_name ? (
                            <p className="mt-2 text-sm text-muted-foreground">
                                {family.location_name}
                                {family.latitude !== null && family.longitude !== null && (
                                    <span className="ml-2 text-xs opacity-60">
                                        ({family.latitude}, {family.longitude})
                                    </span>
                                )}
                            </p>
                        ) : (
                            <p className="mt-2 text-sm text-muted-foreground">No location set.</p>
                        )}
                    </div>

                    <div className="rounded-xl border">
                        <div className="flex items-center justify-between border-b px-4 py-3">
                            <div className="flex items-center gap-2">
                                <h2 className="font-semibold">Members</h2>
                                {canManageMembers && memberOrder.length > 1 && (
                                    <span role="status" aria-live="polite" className="text-xs text-muted-foreground">
                                        {orderSaving ? 'Saving…' : orderSaved ? 'Order saved' : ''}
                                    </span>
                                )}
                            </div>
                            <div className="flex items-center gap-2">
                                <Dialog open={addChildOpen} onOpenChange={setAddChildOpen}>
                                    <DialogTrigger asChild>
                                        <Button size="sm" variant="outline">
                                            <Baby className="mr-1 size-4" /> Add Child
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                        <DialogHeader>
                                            <DialogTitle>Add Child</DialogTitle>
                                        </DialogHeader>
                                        <p className="text-sm text-muted-foreground">
                                            Children are added directly and don't need to log in. They can be assigned todos and chores.
                                        </p>
                                        <form onSubmit={handleAddChild} className="space-y-4">
                                            <div className="grid gap-2">
                                                <Label htmlFor="child-name">Child's Name</Label>
                                                <Input
                                                    id="child-name"
                                                    value={addChildForm.data.name}
                                                    onChange={(e) => addChildForm.setData('name', e.target.value)}
                                                    placeholder="e.g. Emma"
                                                    required
                                                />
                                                <InputError message={addChildForm.errors.name} />
                                            </div>
                                            <Button type="submit" className="w-full" disabled={addChildForm.processing}>
                                                {addChildForm.processing ? 'Adding…' : 'Add Child'}
                                            </Button>
                                        </form>
                                    </DialogContent>
                                </Dialog>

                                <Dialog open={inviteMemberOpen} onOpenChange={setInviteMemberOpen}>
                                    <DialogTrigger asChild>
                                        <Button size="sm" variant="outline">
                                            <UserPlus className="mr-1 size-4" /> Invite Family Member
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                        <DialogHeader>
                                            <DialogTitle>Invite Family Member</DialogTitle>
                                        </DialogHeader>
                                        <form onSubmit={handleInvite} className="space-y-4">
                                            <p className="text-sm text-muted-foreground">
                                                An invitation email will be sent with a link to set up their account and join your family.
                                            </p>
                                            <div className="grid gap-2">
                                                <Label htmlFor="invite-email">Email Address</Label>
                                                <Input
                                                    id="invite-email"
                                                    type="email"
                                                    value={inviteForm.data.email}
                                                    onChange={(e) => inviteForm.setData('email', e.target.value)}
                                                    placeholder="their@email.com"
                                                    required
                                                />
                                                <InputError message={inviteForm.errors.email} />
                                            </div>
                                            <div className="grid gap-2">
                                                <Label htmlFor="invite-role">Role</Label>
                                                <select
                                                    id="invite-role"
                                                    value={inviteForm.data.role}
                                                    onChange={(e) => inviteForm.setData('role', e.target.value)}
                                                    className="rounded-md border border-input bg-background px-3 py-2 text-sm"
                                                    required
                                                >
                                                    <option value="member">Member</option>
                                                    <option value="guest">Guest (read-only)</option>
                                                </select>
                                                <InputError message={inviteForm.errors.role} />
                                            </div>
                                            <Button type="submit" className="w-full" disabled={inviteForm.processing}>
                                                {inviteForm.processing ? 'Sending Invite…' : 'Send Invitation'}
                                            </Button>
                                        </form>
                                    </DialogContent>
                                </Dialog>
                            </div>
                        </div>
                        <ul className="divide-y">
                            {memberOrder.map((member) => (
                                <li
                                    key={member.id}
                                    className={`flex items-center gap-3 px-4 py-3 transition-colors ${draggingId === member.id ? 'opacity-40' : ''} ${dragOverId === member.id && draggingId !== member.id ? 'bg-muted/50' : ''}`}
                                    draggable={canManageMembers && memberOrder.length > 1}
                                    onDragStart={() => onDragStart(member.id)}
                                    onDragOver={(e) => onDragOver(e, member.id)}
                                    onDrop={() => onDrop(member.id)}
                                    onDragEnd={onDragEnd}
                                >
                                    {canManageMembers && memberOrder.length > 1 && (
                                        <GripVertical className="size-4 shrink-0 cursor-grab text-muted-foreground" aria-hidden="true" />
                                    )}
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <p className="font-medium">{member.name || member.email}</p>
                                            {member.is_pending && (
                                                <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                                                    Pending
                                                </span>
                                            )}
                                            {member.is_child && (
                                                <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                                                    Child
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-sm text-muted-foreground">{member.email ?? 'No email'}</p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        {member.id !== currentUserId && !member.is_child ? (
                                            <select
                                                value={member.role}
                                                onChange={(e) => changeRole(member.id, e.target.value)}
                                                className="rounded-full border border-input bg-transparent px-2 py-0.5 text-xs capitalize"
                                            >
                                                <option value="admin">Admin</option>
                                                <option value="member">Member</option>
                                                <option value="guest">Guest</option>
                                            </select>
                                        ) : (
                                            <span className="rounded-full bg-secondary px-2 py-0.5 text-xs capitalize">{member.role}</span>
                                        )}
                                        {canManageMembers && (
                                            <Button variant="ghost" size="icon" asChild title="Manage permissions">
                                                <Link href={permissionsEdit({ user: member.id }).url}>
                                                    <Settings className="size-4 text-muted-foreground" />
                                                </Link>
                                            </Button>
                                        )}
                                        {member.id !== currentUserId && (
                                            <Button variant="ghost" size="icon" onClick={() => removeUser(member.id)}>
                                                <UserMinus className="size-4 text-destructive" />
                                            </Button>
                                        )}
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </AppLayout>
        </>
    );
}
