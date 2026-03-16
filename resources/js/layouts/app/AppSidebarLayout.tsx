import type { PropsWithChildren } from 'react';
import AppContent from '@/components/AppContent';
import AppShell from '@/components/AppShell';
import AppSidebar from '@/components/AppSidebar';
import AppSidebarHeader from '@/components/AppSidebarHeader';
import type { BreadcrumbItem } from '@/types';

interface Props extends PropsWithChildren {
    breadcrumbs?: BreadcrumbItem[];
}

export default function AppSidebarLayout({ children, breadcrumbs = [] }: Props) {
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
