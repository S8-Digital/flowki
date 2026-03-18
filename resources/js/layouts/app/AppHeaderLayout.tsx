import AppContent from '@/components/AppContent';
import AppHeader from '@/components/AppHeader';
import AppShell from '@/components/AppShell';
import type { BreadcrumbItem } from '@/types';
import type { PropsWithChildren } from 'react';

interface Props extends PropsWithChildren {
    breadcrumbs?: BreadcrumbItem[];
}

export default function AppHeaderLayout({ children, breadcrumbs = [] }: Props) {
    return (
        <AppShell variant="header">
            <AppHeader breadcrumbs={breadcrumbs} />
            <AppContent>{children}</AppContent>
        </AppShell>
    );
}
