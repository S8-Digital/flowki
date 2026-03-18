import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from '@/components/ui/sidebar';
import UserInfo from '@/components/UserInfo';
import UserMenuContent from '@/components/UserMenuContent';
import type { AppPageProps } from '@/types';
import { usePage } from '@inertiajs/react';
import { ChevronUp } from 'lucide-react';

export default function NavUser() {
    const page = usePage<AppPageProps>();
    const user = page.props.auth.user;
    const { isMobile, state } = useSidebar();

    return (
        <SidebarMenu>
            <SidebarMenuItem>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <SidebarMenuButton size="lg" className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground">
                            <UserInfo user={user} />
                            <ChevronUp style={{ marginLeft: 'auto', width: 16, height: 16 }} />
                        </SidebarMenuButton>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        style={{ width: 'var(--radix-dropdown-menu-trigger-width)', minWidth: '14rem', borderRadius: 8 }}
                        side={isMobile ? 'bottom' : state === 'collapsed' ? 'left' : 'bottom'}
                        align="end"
                        sideOffset={4}
                    >
                        <UserMenuContent user={user} />
                    </DropdownMenuContent>
                </DropdownMenu>
            </SidebarMenuItem>
        </SidebarMenu>
    );
}
