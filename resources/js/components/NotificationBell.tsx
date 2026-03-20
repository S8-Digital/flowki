import { Link, router, usePage } from '@inertiajs/react';
import Box from '@mui/material/Box';
import { Bell, CheckCheck, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { recent, markRead } from '@/actions/App/Http/Controllers/NotificationController';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import { onForegroundMessage } from '@/lib/firebase-messaging';
import type { AppNotification, AppPageProps } from '@/types';

function notificationMessage(notification: AppNotification): string {
    const d = notification.data;

    switch (d.type) {
        case 'todo_assigned':
            return `You were assigned a task: ${d.todo_title as string}`;
        case 'todo_completed':
            return `${d.completed_by_name as string} completed: ${d.todo_title as string}`;
        case 'todo_reminder':
            return `Reminder: ${d.todo_title as string} is due soon`;
        case 'chore_assigned':
            return `You were assigned a chore: ${d.chore_title as string}`;
        case 'chore_completed':
            return `${d.completed_by_name as string} completed: ${d.chore_title as string}`;
        case 'chore_reminder':
            return `Reminder: ${d.chore_title as string} is due soon`;
        default:
            return 'You have a new notification';
    }
}

function formatRelativeTime(dateStr: string): string {
    const date = new Date(dateStr);
    const diffMs = Date.now() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) {
        return 'just now';
    }

    if (diffMins < 60) {
        return `${diffMins}m ago`;
    }

    const diffHours = Math.floor(diffMins / 60);

    if (diffHours < 24) {
        return `${diffHours}h ago`;
    }

    const diffDays = Math.floor(diffHours / 24);

    return `${diffDays}d ago`;
}

export default function NotificationBell() {
    const page = usePage<AppPageProps>();
    const serverUnreadCount = page.props.unreadNotificationsCount ?? 0;
    const [realtimeUnreadCount, setRealtimeUnreadCount] = useState<number | null>(null);
    const [notifications, setNotifications] = useState<AppNotification[]>([]);
    const [loading, setLoading] = useState(false);
    const [loaded, setLoaded] = useState(false);
    const [open, setOpen] = useState(false);

    // Listen for foreground FCM messages and bump the unread badge
    useEffect(() => {
        const unsubscribe = onForegroundMessage((payload) => {
            const notifType = (payload.data?.type as string | undefined) ?? '';

            if (notifType) {
                // Increment count and force re-fetch on next bell open
                setRealtimeUnreadCount((prev) => (prev !== null ? prev + 1 : serverUnreadCount + 1));
                setLoaded(false);
            }
        });

        return () => {
            unsubscribe?.();
        };
    }, [serverUnreadCount]);

    const unreadCount = realtimeUnreadCount !== null ? realtimeUnreadCount : serverUnreadCount;

    function fetchNotifications() {
        if (loaded) {
            return;
        }

        setLoading(true);

        fetch(recent().url, {
            headers: { Accept: 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
        })
            .then((res) => res.json())
            .then((data: { notifications: AppNotification[] }) => {
                setNotifications(data.notifications ?? []);
                setLoaded(true);
            })
            .catch(() => {})
            .finally(() => setLoading(false));
    }

    function handleOpen(isOpen: boolean) {
        setOpen(isOpen);

        if (isOpen) {
            fetchNotifications();
        }
    }

    function markAsRead(id: string) {
        router.post(
            markRead(id).url,
            {},
            {
                preserveScroll: true,
                onSuccess: () => {
                    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read_at: new Date().toISOString() } : n)));
                    setRealtimeUnreadCount((prev) => (prev !== null ? Math.max(0, prev - 1) : null));
                },
            },
        );
    }

    function markAllRead() {
        router.post(
            '/notifications/read-all',
            {},
            {
                preserveScroll: true,
                onSuccess: () => {
                    setNotifications((prev) => prev.map((n) => ({ ...n, read_at: n.read_at ?? new Date().toISOString() })));
                    setRealtimeUnreadCount(0);
                },
            },
        );
    }

    function deleteNotification(id: string) {
        router.delete(`/notifications/${id}`, {
            preserveScroll: true,
            onSuccess: () => {
                setNotifications((prev) => prev.filter((n) => n.id !== id));
            },
        });
    }

    const displayedUnreadCount = notifications.length > 0 ? notifications.filter((n) => !n.read_at).length : unreadCount;

    return (
        <DropdownMenu open={open} onOpenChange={handleOpen}>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" style={{ position: 'relative', width: 36, height: 36 }} aria-label="Notifications">
                    <Bell style={{ width: 20, height: 20 }} />
                    {displayedUnreadCount > 0 && (
                        <Box
                            component="span"
                            sx={{
                                position: 'absolute',
                                top: -4,
                                right: -4,
                                display: 'flex',
                                width: 20,
                                minWidth: 20,
                                height: 20,
                                alignItems: 'center',
                                justifyContent: 'center',
                                borderRadius: '50%',
                                bgcolor: 'var(--destructive)',
                                color: 'var(--destructive-foreground)',
                                fontSize: '0.75rem',
                                fontWeight: 500,
                                p: 0,
                            }}
                        >
                            {displayedUnreadCount > 99 ? '99+' : displayedUnreadCount}
                        </Box>
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" style={{ width: 320, padding: 0 }}>
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        borderBottom: '1px solid',
                        borderColor: 'divider',
                        px: 2,
                        py: 1.5,
                    }}
                >
                    <Box component="span" sx={{ fontWeight: 600 }}>
                        Notifications
                    </Box>
                    {displayedUnreadCount > 0 && (
                        <Button variant="ghost" size="sm" style={{ height: 28, gap: 4, fontSize: '0.75rem' }} onClick={markAllRead}>
                            <CheckCheck style={{ width: 12, height: 12 }} />
                            Mark all read
                        </Button>
                    )}
                </Box>

                {loading ? (
                    <Box sx={{ py: 3, textAlign: 'center', fontSize: '0.875rem', color: 'text.secondary' }}>Loading…</Box>
                ) : loaded && notifications.length === 0 ? (
                    <Box sx={{ py: 3, textAlign: 'center', fontSize: '0.875rem', color: 'text.secondary' }}>No notifications</Box>
                ) : !loaded && unreadCount === 0 ? (
                    <Box sx={{ py: 3, textAlign: 'center', fontSize: '0.875rem', color: 'text.secondary' }}>No notifications</Box>
                ) : (
                    <ScrollArea style={{ maxHeight: 288 }}>
                        {notifications.map((n) => (
                            <Box
                                key={n.id}
                                sx={{
                                    display: 'flex',
                                    alignItems: 'flex-start',
                                    gap: 1.5,
                                    '&:not(:last-child)': { borderBottom: '1px solid', borderColor: 'divider' },
                                    px: 2,
                                    py: 1.5,
                                    bgcolor: !n.read_at ? 'color-mix(in srgb, var(--primary) 5%, transparent)' : 'transparent',
                                }}
                            >
                                <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 0.25 }}>
                                    <Box
                                        component="p"
                                        sx={{
                                            m: 0,
                                            fontSize: '0.875rem',
                                            lineHeight: 1.4,
                                            fontWeight: !n.read_at ? 500 : 400,
                                            color: !n.read_at ? 'text.primary' : 'text.secondary',
                                        }}
                                    >
                                        {notificationMessage(n)}
                                    </Box>
                                    <Box component="p" sx={{ m: 0, fontSize: '0.75rem', color: 'text.secondary' }}>
                                        {formatRelativeTime(n.created_at)}
                                    </Box>
                                </Box>
                                <Box sx={{ display: 'flex', flexShrink: 0, gap: 0.5 }}>
                                    {!n.read_at && (
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            style={{ width: 24, height: 24 }}
                                            onClick={() => markAsRead(n.id)}
                                            aria-label="Mark as read"
                                        >
                                            <CheckCheck style={{ width: 12, height: 12 }} />
                                        </Button>
                                    )}
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        sx={{ width: 24, height: 24, color: 'text.secondary' }}
                                        onClick={() => deleteNotification(n.id)}
                                        aria-label="Delete notification"
                                    >
                                        <Trash2 style={{ width: 12, height: 12 }} />
                                    </Button>
                                </Box>
                            </Box>
                        ))}
                    </ScrollArea>
                )}

                <Box sx={{ borderTop: '1px solid', borderColor: 'divider', px: 2, py: 1 }}>
                    <Link
                        href="/notifications"
                        style={{ display: 'block', textAlign: 'center', fontSize: '0.75rem', color: 'var(--primary)', textDecoration: 'none' }}
                        onClick={() => setOpen(false)}
                    >
                        View all notifications
                    </Link>
                </Box>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
