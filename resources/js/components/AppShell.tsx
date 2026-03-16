import { usePage } from '@inertiajs/react';
import { SidebarProvider } from '@/components/ui/sidebar';
import type { AppPageProps } from '@/types';

interface AppShellProps {
    variant?: 'header' | 'sidebar';
    children: React.ReactNode;
}

export default function AppShell({ variant = 'sidebar', children }: AppShellProps) {
    const page = usePage<AppPageProps>();

    if (variant === 'header') {
        return <div className="flex min-h-screen w-full flex-col">{children}</div>;
    }

    return <SidebarProvider defaultOpen={page.props.sidebarOpen}>{children}</SidebarProvider>;
}
