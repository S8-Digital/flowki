import { Head, router } from '@inertiajs/react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { CheckCheck, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import AppLayout from '@/layouts/AppLayout';
import type { AppNotification, BreadcrumbItem, PaginatedResource } from '@/types';

interface Props {
    notifications: PaginatedResource<AppNotification>;
}

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Notifications', href: '/notifications' }];

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

function formatDateTime(dateStr: string): string {
    return new Date(dateStr).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
}

export default function NotificationsIndex({ notifications }: Props) {
    function markRead(id: string) {
        router.post(`/notifications/${id}/read`, {}, { preserveScroll: true });
    }

    function markAllRead() {
        router.post('/notifications/read-all', {}, { preserveScroll: true });
    }

    function deleteNotification(id: string) {
        router.delete(`/notifications/${id}`, { preserveScroll: true });
    }

    const hasUnread = notifications.data.some((n) => !n.read_at);

    return (
        <>
            <Head title="Notifications" />
            <AppLayout breadcrumbs={breadcrumbs}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, p: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                            Notifications
                        </Typography>
                        {hasUnread && (
                            <Button variant="outline" size="sm" className="gap-2" onClick={markAllRead}>
                                <CheckCheck className="size-4" />
                                Mark all read
                            </Button>
                        )}
                    </Box>

                    {notifications.data.length === 0 ? (
                        <Card>
                            <CardContent className="py-12 text-center text-muted-foreground">You have no notifications.</CardContent>
                        </Card>
                    ) : (
                        <Stack spacing={1}>
                            {notifications.data.map((notification) => (
                                <Card key={notification.id} className={!notification.read_at ? 'border-primary/30 bg-primary/5' : ''}>
                                    <CardContent className="flex items-start justify-between gap-4 py-4">
                                        <Stack spacing={0.25}>
                                            <Typography
                                                variant="body2"
                                                sx={{
                                                    fontWeight: !notification.read_at ? 500 : 400,
                                                    color: !notification.read_at ? 'text.primary' : 'text.secondary',
                                                }}
                                            >
                                                {notificationMessage(notification)}
                                            </Typography>
                                            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                                {formatDateTime(notification.created_at)}
                                            </Typography>
                                        </Stack>
                                        <Box sx={{ display: 'flex', flexShrink: 0, gap: 0.5 }}>
                                            {!notification.read_at && (
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8"
                                                    onClick={() => markRead(notification.id)}
                                                    aria-label="Mark as read"
                                                >
                                                    <CheckCheck className="size-4" />
                                                </Button>
                                            )}
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                                onClick={() => deleteNotification(notification.id)}
                                                aria-label="Delete notification"
                                            >
                                                <Trash2 className="size-4" />
                                            </Button>
                                        </Box>
                                    </CardContent>
                                </Card>
                            ))}
                        </Stack>
                    )}

                    {/* Pagination */}
                    {notifications.last_page > 1 && (
                        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                            {notifications.links.map((link, i) => (
                                <Button
                                    key={i}
                                    variant={link.active ? 'default' : 'outline'}
                                    size="sm"
                                    disabled={!link.url}
                                    onClick={() => link.url && router.visit(link.url)}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                />
                            ))}
                        </Box>
                    )}
                </Box>
            </AppLayout>
        </>
    );
}
