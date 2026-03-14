import AppSidebarLayout from '@/layouts/app/AppSidebarLayout';
import type { BreadcrumbItem } from '@/types';
import type { PropsWithChildren } from 'react';

interface Props extends PropsWithChildren {
    breadcrumbs?: BreadcrumbItem[];
}

export default function AppLayout({ children, breadcrumbs = [] }: Props) {
    return <AppSidebarLayout breadcrumbs={breadcrumbs}>{children}</AppSidebarLayout>;
}
