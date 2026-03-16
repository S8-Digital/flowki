import { SidebarInset } from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';

interface AppContentProps {
    variant?: 'header' | 'sidebar';
    className?: string;
    children: React.ReactNode;
}

export default function AppContent({ variant = 'sidebar', className, children }: AppContentProps) {
    if (variant === 'sidebar') {
        return <SidebarInset className={className}>{children}</SidebarInset>;
    }

    return <main className={cn('mx-auto flex h-full w-full max-w-7xl flex-1 flex-col gap-4 rounded-xl', className)}>{children}</main>;
}
