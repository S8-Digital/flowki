import { useEffect } from 'react';
import type { PropsWithChildren } from 'react';
import AppContent from '@/components/AppContent';
import AppShell from '@/components/AppShell';
import AppSidebar from '@/components/AppSidebar';
import AppSidebarHeader from '@/components/AppSidebarHeader';
import { useFirebaseMessaging } from '@/hooks/useFirebaseMessaging';
import type { BreadcrumbItem } from '@/types';

interface Props extends PropsWithChildren {
    breadcrumbs?: BreadcrumbItem[];
}

export default function AppSidebarLayout({ children, breadcrumbs = [] }: Props) {
    const { requestPermissionAndRegister } = useFirebaseMessaging();

    useEffect(() => {
        if (typeof Notification !== 'undefined' && Notification.permission === 'default') {
            requestPermissionAndRegister();
        }
    }, [requestPermissionAndRegister]);

    return (
        <AppShell variant="sidebar">
            <AppSidebar />
            <AppContent variant="sidebar" className="overflow-x-hidden">
                <AppSidebarHeader breadcrumbs={breadcrumbs} />
                {children}
            </AppContent>
        </AppShell>
    );
}
