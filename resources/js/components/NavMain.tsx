import { SidebarGroup, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { urlIsActive } from '@/lib/utils';
import type { NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';

interface NavMainProps {
    items: NavItem[];
}

export default function NavMain({ items }: NavMainProps) {
    const page = usePage();

    return (
        <SidebarGroup style={{ padding: '0 8px' }}>
            <SidebarGroupLabel>Platform</SidebarGroupLabel>
            <SidebarMenu>
                {items.map((item) => (
                    <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton asChild isActive={urlIsActive(item.href, page.url)} tooltip={item.title}>
                            <Link href={item.href}>
                                {item.icon && <item.icon style={item.iconColor ? { color: item.iconColor } : undefined} />}
                                <span>{item.title}</span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                ))}
            </SidebarMenu>
        </SidebarGroup>
    );
}
