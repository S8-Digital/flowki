import Box from '@mui/material/Box';
import { Bell, X } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useFirebaseMessaging } from '@/hooks/useFirebaseMessaging';

export default function NotificationPermissionBanner() {
    const { notificationPermission, isRegistering, requestPermissionAndRegister } = useFirebaseMessaging();
    const [dismissed, setDismissed] = useState(false);

    if (dismissed || notificationPermission !== 'default' || typeof Notification === 'undefined') {
        return null;
    }

    return (
        <Box
            sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                borderRadius: 2,
                border: '1px solid',
                borderColor: 'color-mix(in srgb, var(--primary) 20%, transparent)',
                bgcolor: 'color-mix(in srgb, var(--primary) 10%, transparent)',
                px: 2,
                py: 1.5,
                fontSize: '0.875rem',
            }}
        >
            <Bell style={{ width: 16, height: 16, flexShrink: 0, color: 'var(--primary)' }} />
            <Box component="p" sx={{ flex: 1, color: 'var(--foreground)', m: 0 }}>
                Enable push notifications to stay updated on tasks, chores, and reminders.
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Button size="sm" onClick={requestPermissionAndRegister} disabled={isRegistering}>
                    {isRegistering ? 'Enabling…' : 'Enable'}
                </Button>
                <Button size="icon" variant="ghost" onClick={() => setDismissed(true)} aria-label="Dismiss">
                    <X style={{ width: 16, height: 16 }} />
                </Button>
            </Box>
        </Box>
    );
}
