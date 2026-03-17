import { Link, router, usePage } from '@inertiajs/react';
import { Bell, CheckCheck, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
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

        fetch('/notifications/recent', {
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

    function markRead(id: string) {
        router.post(
            `/notifications/${id}/read`,
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
                <Button variant="ghost" size="icon" className="relative h-9 w-9" aria-label="Notifications">
                    <Bell className="size-5" />
                    {displayedUnreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-destructive p-0 text-xs font-medium text-destructive-foreground">
                            {displayedUnreadCount > 99 ? '99+' : displayedUnreadCount}
                        </span>
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 p-0">
                <div className="flex items-center justify-between border-b px-4 py-3">
                    <span className="font-semibold">Notifications</span>
                    {displayedUnreadCount > 0 && (
                        <Button variant="ghost" size="sm" className="h-7 gap-1 text-xs" onClick={markAllRead}>
                            <CheckCheck className="size-3" />
                            Mark all read
                        </Button>
                    )}
                </div>

                {loading ? (
                    <div className="py-6 text-center text-sm text-muted-foreground">Loading…</div>
                ) : loaded && notifications.length === 0 ? (
                    <div className="py-6 text-center text-sm text-muted-foreground">No notifications</div>
                ) : !loaded && unreadCount === 0 ? (
                    <div className="py-6 text-center text-sm text-muted-foreground">No notifications</div>
                ) : (
                    <ScrollArea className="max-h-72">
                        {notifications.map((n) => (
                            <div
                                key={n.id}
                                className={`flex items-start gap-3 border-b px-4 py-3 last:border-b-0 ${!n.read_at ? 'bg-primary/5' : ''}`}
                            >
                                <div className="flex-1 space-y-0.5">
                                    <p className={`text-sm leading-snug ${!n.read_at ? 'font-medium' : 'text-muted-foreground'}`}>
                                        {notificationMessage(n)}
                                    </p>
                                    <p className="text-xs text-muted-foreground">{formatRelativeTime(n.created_at)}</p>
                                </div>
                                <div className="flex shrink-0 gap-1">
                                    {!n.read_at && (
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-6 w-6"
                                            onClick={() => markRead(n.id)}
                                            aria-label="Mark as read"
                                        >
                                            <CheckCheck className="size-3" />
                                        </Button>
                                    )}
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-6 w-6 text-muted-foreground hover:text-destructive"
                                        onClick={() => deleteNotification(n.id)}
                                        aria-label="Delete notification"
                                    >
                                        <Trash2 className="size-3" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </ScrollArea>
                )}

                <div className="border-t px-4 py-2">
                    <Link href="/notifications" className="block text-center text-xs text-primary hover:underline" onClick={() => setOpen(false)}>
                        View all notifications
                    </Link>
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
