import Box from '@mui/material/Box';
import { alpha, styled } from '@mui/material/styles';
import { Bell, X } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useFirebaseMessaging } from '@/hooks/useFirebaseMessaging';

const BannerContainer = styled(Box)(({ theme }) => ({
    borderRadius: theme.shape.borderRadius * 2,
    border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
    backgroundColor: alpha(theme.palette.primary.main, 0.1),
    fontSize: '0.875rem',
}));

const BannerText = styled(Box)(({ theme }) => ({
    color: theme.palette.text.primary,
}));

export default function NotificationPermissionBanner() {
    const { notificationPermission, isRegistering, requestPermissionAndRegister } = useFirebaseMessaging();
    const [dismissed, setDismissed] = useState(false);

    if (dismissed || notificationPermission !== 'default' || typeof Notification === 'undefined') {
        return null;
    }

    return (
        <BannerContainer sx={{ display: 'flex', alignItems: 'center', gap: 1.5, px: 2, py: 1.5 }}>
            <Bell style={{ width: 16, height: 16, flexShrink: 0, color: 'var(--primary)' }} />
            <BannerText component="p" sx={{ flex: 1, m: 0 }}>
                Enable push notifications to stay updated on tasks, chores, and reminders.
            </BannerText>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Button size="sm" onClick={requestPermissionAndRegister} disabled={isRegistering}>
                    {isRegistering ? 'Enabling…' : 'Enable'}
                </Button>
                <Button size="icon" variant="ghost" onClick={() => setDismissed(true)} aria-label="Dismiss">
                    <X style={{ width: 16, height: 16 }} />
                </Button>
            </Box>
        </BannerContainer>
    );
}
