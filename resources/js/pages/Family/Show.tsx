import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Baby, Copy, GripVertical, MapPin, Pencil, Settings, UserMinus, UserPlus } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { addChild, inviteMember, removeMember, update, updateMemberRole } from '@/actions/App/Http/Controllers/FamilyController';
import { update as updateMemberOrder } from '@/actions/App/Http/Controllers/Settings/MemberOrderController';
import { edit as memberProfileEdit } from '@/actions/App/Http/Controllers/Settings/MemberProfileController';
import InputError from '@/components/InputError';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, p: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <Box>
                                <Typography variant="h5" sx={{ fontWeight: 700 }}>
                                    {family.name}
                                </Typography>
                                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                    {family.members?.length ?? 0} members
                                </Typography>
                            </Box>
                            <Dialog open={editNameOpen} onOpenChange={setEditNameOpen}>
                                <DialogTrigger asChild>
                                    <Button variant="ghost" size="sm" sx={{ gap: 0.75, color: "text.secondary", "&:hover": { color: "text.primary" } }}>
                                        <Pencil size={14} />
                                        <Typography component="span" sx={{ fontSize: '0.75rem' }}>
                                            Edit name
                                        </Typography>
                                    </Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Edit Family Name</DialogTitle>
                                    </DialogHeader>
                                    <Stack component="form" onSubmit={handleEditName} spacing={2}>
                                        <Box sx={{ display: 'grid', gap: 1 }}>
                                            <Label htmlFor="name">Family Name</Label>
                                            <Input
                                                id="name"
                                                value={editNameForm.data.name}
                                                onChange={(e) => editNameForm.setData('name', e.target.value)}
                                                required
                                                placeholder="e.g. The Smith Family"
                                            />
                                            <InputError message={editNameForm.errors.name} />
                                        </Box>
                                        <Button type="submit" sx={{ width: "100%" }} disabled={editNameForm.processing}>
                                            {editNameForm.processing ? 'Saving…' : 'Save Name'}
                                        </Button>
                                    </Stack>
                                </DialogContent>
                            </Dialog>
                        </Box>

                        <Box
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1,
                                borderRadius: '12px',
                                border: 1,
                                borderColor: 'divider',
                                px: 1.5,
                                py: 1,
                            }}
                        >
                            <Typography component="span" variant="caption" sx={{ color: 'text.secondary' }}>
                                Invite code:
                            </Typography>
                            <Box component="span" sx={{ fontFamily: 'monospace', fontSize: '0.875rem', letterSpacing: '0.2em' }}>
                                {family.invite_code}
                            </Box>
                            <Box
                                component="button"
                                onClick={copyInviteCode}
                                aria-label="Copy invite code"
                                sx={{
                                    color: 'text.secondary',
                                    background: 'none',
                                    border: 'none',
                                    cursor: 'pointer',
                                    p: 0,
                                    display: 'flex',
                                    alignItems: 'center',
                                    transition: 'color 0.2s',
                                    '&:hover': { color: 'text.primary' },
                                }}
                            >
                                <Copy size={16} />
                            </Box>
                            {copied && (
                                <Typography component="span" variant="caption" sx={{ color: 'success.main' }}>
                                    Copied!
                                </Typography>
                            )}
                        </Box>
                    </Box>

                    {/* Location section */}
                    <Box sx={{ borderRadius: 2, border: 1, borderColor: 'divider', p: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <MapPin size={16} style={{ color: "var(--mui-palette-text-secondary)" }} />
                                <Typography component="span" sx={{ fontSize: '0.875rem', fontWeight: 500 }}>
                                    Location
                                </Typography>
                            </Box>
                            {canManageFamily && (
                                <Dialog open={editLocationOpen} onOpenChange={setEditLocationOpen}>
                                    <DialogTrigger asChild>
                                        <Button variant="ghost" size="sm" sx={{ gap: 0.75, color: "text.secondary", "&:hover": { color: "text.primary" } }}>
                                            <Pencil size={14} />
                                            <Typography component="span" sx={{ fontSize: '0.75rem' }}>
                                                Edit
                                            </Typography>
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                        <DialogHeader>
                                            <DialogTitle>Set Family Location</DialogTitle>
                                        </DialogHeader>
                                        <Stack component="form" onSubmit={handleEditLocation} spacing={2}>
                                            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                                Used to show local weather on the dashboard and calendar. Enter a city name, or provide coordinates
                                                for more accuracy.
                                            </Typography>
                                            <Box sx={{ display: 'grid', gap: 1 }}>
                                                <Label htmlFor="location_name">City / Location Name</Label>
                                                <Input
                                                    id="location_name"
                                                    value={editLocationForm.data.location_name}
                                                    onChange={(e) => editLocationForm.setData('location_name', e.target.value)}
                                                    placeholder="e.g. London, Paris, New York"
                                                />
                                                <InputError message={editLocationForm.errors.location_name} />
                                            </Box>
                                            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 1.5 }}>
                                                <Box sx={{ display: 'grid', gap: 1 }}>
                                                    <Label htmlFor="latitude">
                                                        Latitude{' '}
                                                        <Typography component="span" variant="caption" sx={{ color: 'text.secondary' }}>
                                                            (optional)
                                                        </Typography>
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
                                                </Box>
                                                <Box sx={{ display: 'grid', gap: 1 }}>
                                                    <Label htmlFor="longitude">
                                                        Longitude{' '}
                                                        <Typography component="span" variant="caption" sx={{ color: 'text.secondary' }}>
                                                            (optional)
                                                        </Typography>
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
                                                </Box>
                                            </Box>
                                            <Button type="submit" sx={{ width: "100%" }} disabled={editLocationForm.processing}>
                                                {editLocationForm.processing ? 'Saving…' : 'Save Location'}
                                            </Button>
                                        </Stack>
                                    </DialogContent>
                                </Dialog>
                            )}
                        </Box>
                        {family.location_name ? (
                            <Typography variant="body2" sx={{ color: 'text.secondary', mt: 1 }}>
                                {family.location_name}
                                {family.latitude !== null && family.longitude !== null && (
                                    <Box component="span" sx={{ ml: 1, fontSize: '0.75rem', opacity: 0.6 }}>
                                        ({family.latitude}, {family.longitude})
                                    </Box>
                                )}
                            </Typography>
                        ) : (
                            <Typography variant="body2" sx={{ color: 'text.secondary', mt: 1 }}>
                                No location set.
                            </Typography>
                        )}
                    </Box>

                    <Box sx={{ borderRadius: 2, border: 1, borderColor: 'divider' }}>
                        <Box
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                borderBottom: 1,
                                borderColor: 'divider',
                                px: 2,
                                py: 1.5,
                            }}
                        >
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Typography sx={{ fontWeight: 600 }}>Members</Typography>
                                {canManageMembers && memberOrder.length > 1 && (
                                    <Typography component="span" variant="caption" sx={{ color: 'text.secondary' }} role="status" aria-live="polite">
                                        {orderSaving ? 'Saving…' : orderSaved ? 'Order saved' : ''}
                                    </Typography>
                                )}
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Dialog open={addChildOpen} onOpenChange={setAddChildOpen}>
                                    <DialogTrigger asChild>
                                        <Button size="sm" variant="outline">
                                            <Baby size={16} style={{ marginRight: 4 }} /> Add Child
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                        <DialogHeader>
                                            <DialogTitle>Add Child</DialogTitle>
                                        </DialogHeader>
                                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                            Children are added directly and don't need to log in. They can be assigned todos and chores.
                                        </Typography>
                                        <Stack component="form" onSubmit={handleAddChild} spacing={2}>
                                            <Box sx={{ display: 'grid', gap: 1 }}>
                                                <Label htmlFor="child-name">Child's Name</Label>
                                                <Input
                                                    id="child-name"
                                                    value={addChildForm.data.name}
                                                    onChange={(e) => addChildForm.setData('name', e.target.value)}
                                                    placeholder="e.g. Emma"
                                                    required
                                                />
                                                <InputError message={addChildForm.errors.name} />
                                            </Box>
                                            <Button type="submit" sx={{ width: "100%" }} disabled={addChildForm.processing}>
                                                {addChildForm.processing ? 'Adding…' : 'Add Child'}
                                            </Button>
                                        </Stack>
                                    </DialogContent>
                                </Dialog>

                                <Dialog open={inviteMemberOpen} onOpenChange={setInviteMemberOpen}>
                                    <DialogTrigger asChild>
                                        <Button size="sm" variant="outline">
                                            <UserPlus size={16} style={{ marginRight: 4 }} /> Invite Family Member
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                        <DialogHeader>
                                            <DialogTitle>Invite Family Member</DialogTitle>
                                        </DialogHeader>
                                        <Stack component="form" onSubmit={handleInvite} spacing={2}>
                                            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                                An invitation email will be sent with a link to set up their account and join your family.
                                            </Typography>
                                            <Box sx={{ display: 'grid', gap: 1 }}>
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
                                            </Box>
                                            <Box sx={{ display: 'grid', gap: 1 }}>
                                                <Label htmlFor="invite-role">Role</Label>
                                                <Select value={inviteForm.data.role} onValueChange={(v) => inviteForm.setData('role', v)}>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select role" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="member">Member</SelectItem>
                                                        <SelectItem value="guest">Guest (read-only)</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <InputError message={inviteForm.errors.role} />
                                            </Box>
                                            <Button type="submit" sx={{ width: "100%" }} disabled={inviteForm.processing}>
                                                {inviteForm.processing ? 'Sending Invite…' : 'Send Invitation'}
                                            </Button>
                                        </Stack>
                                    </DialogContent>
                                </Dialog>
                            </Box>
                        </Box>
                        <Box component="ul" sx={{ listStyle: 'none', m: 0, p: 0, '& > li + li': { borderTop: '1px solid', borderColor: 'divider' } }}>
                            {memberOrder.map((member) => (
                                <Box
                                    component="li"
                                    key={member.id}
                                    sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 1.5,
                                        px: 2,
                                        py: 1.5,
                                        transition: 'background-color 0.2s',
                                        opacity: draggingId === member.id ? 0.4 : 1,
                                        bgcolor: dragOverId === member.id && draggingId !== member.id ? 'action.hover' : 'transparent',
                                    }}
                                    draggable={canManageMembers && memberOrder.length > 1}
                                    onDragStart={() => onDragStart(member.id)}
                                    onDragOver={(e) => onDragOver(e, member.id)}
                                    onDrop={() => onDrop(member.id)}
                                    onDragEnd={onDragEnd}
                                >
                                    {canManageMembers && memberOrder.length > 1 && (
                                        <GripVertical size={16} style={{ flexShrink: 0, cursor: "grab", color: "var(--mui-palette-text-secondary)" }} aria-hidden="true" />
                                    )}
                                    <Box sx={{ flex: 1 }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <Typography sx={{ fontWeight: 500 }}>{member.name || member.email}</Typography>
                                            {member.is_pending && (
                                                <Box
                                                    component="span"
                                                    sx={{
                                                        borderRadius: '50px',
                                                        bgcolor: 'warning.light',
                                                        px: 1,
                                                        py: 0.25,
                                                        fontSize: '0.75rem',
                                                        color: 'warning.dark',
                                                    }}
                                                >
                                                    Pending
                                                </Box>
                                            )}
                                            {member.is_child && (
                                                <Box
                                                    component="span"
                                                    sx={{
                                                        borderRadius: '50px',
                                                        bgcolor: 'info.light',
                                                        px: 1,
                                                        py: 0.25,
                                                        fontSize: '0.75rem',
                                                        color: 'info.dark',
                                                    }}
                                                >
                                                    Child
                                                </Box>
                                            )}
                                        </Box>
                                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                            {member.email ?? 'No email'}
                                        </Typography>
                                    </Box>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                        {member.id !== currentUserId && !member.is_child ? (
                                            <Select value={member.role} onValueChange={(v) => changeRole(member.id, v)}>
                                                <SelectTrigger sx={{ height: 24, borderRadius: "50px", border: "1px solid", borderColor: "divider", bgcolor: "transparent", px: 1, py: 0.25, fontSize: "0.75rem", textTransform: "capitalize" }}>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="admin">Admin</SelectItem>
                                                    <SelectItem value="member">Member</SelectItem>
                                                    <SelectItem value="guest">Guest</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        ) : (
                                            <Box
                                                component="span"
                                                sx={{
                                                    borderRadius: '50px',
                                                    bgcolor: 'secondary.main',
                                                    px: 1,
                                                    py: 0.25,
                                                    fontSize: '0.75rem',
                                                    textTransform: 'capitalize',
                                                }}
                                            >
                                                {member.role}
                                            </Box>
                                        )}
                                        {canManageMembers && (
                                            <Button variant="ghost" size="icon" asChild title="Manage settings">
                                                <Link href={memberProfileEdit({ user: member.id }).url}>
                                                    <Settings size={16} style={{ color: "var(--mui-palette-text-secondary)" }} />
                                                </Link>
                                            </Button>
                                        )}
                                        {member.id !== currentUserId && (
                                            <Button variant="ghost" size="icon" onClick={() => removeUser(member.id)}>
                                                <UserMinus size={16} style={{ color: "var(--mui-palette-error-main)" }} />
                                            </Button>
                                        )}
                                    </Box>
                                </Box>
                            ))}
                        </Box>
                    </Box>
                </Box>
            </AppLayout>
        </>
    );
}
