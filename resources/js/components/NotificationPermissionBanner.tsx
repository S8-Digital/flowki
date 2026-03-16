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
        <div className="flex items-center gap-3 rounded-lg border border-primary/20 bg-primary/10 px-4 py-3 text-sm">
            <Bell className="h-4 w-4 shrink-0 text-primary" />
            <p className="flex-1 text-foreground">Enable push notifications to stay updated on tasks, chores, and reminders.</p>
            <div className="flex items-center gap-2">
                <Button size="sm" onClick={requestPermissionAndRegister} disabled={isRegistering}>
                    {isRegistering ? 'Enabling…' : 'Enable'}
                </Button>
                <Button size="icon" variant="ghost" onClick={() => setDismissed(true)} aria-label="Dismiss">
                    <X className="h-4 w-4" />
                </Button>
            </div>
        </div>
    );
}
