import { Link } from '@inertiajs/react';
import { CalendarDays, CheckSquare, ChefHat, LayoutGrid, RotateCcw, ShoppingCart, Sparkles, Users } from 'lucide-react';
import { useRef } from 'react';
import { index as calendarIndex } from '@/actions/App/Http/Controllers/CalendarEventController';
import { index as choreIndex } from '@/actions/App/Http/Controllers/ChoreController';
import { show as familyShow } from '@/actions/App/Http/Controllers/FamilyController';
import { index as recipeIndex } from '@/actions/App/Http/Controllers/RecipeController';
import { index as shoppingIndex } from '@/actions/App/Http/Controllers/ShoppingListController';
import { index as todoIndex } from '@/actions/App/Http/Controllers/TodoController';
import type { AiChatModalHandle } from '@/components/AiChatModal';
import AiChatModal from '@/components/AiChatModal';
import AppLogo from '@/components/AppLogo';
import NavFooter from '@/components/NavFooter';
import NavMain from '@/components/NavMain';
import NavUser from '@/components/NavUser';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import type { NavItem } from '@/types';

const footerNavItems: NavItem[] = [];

export default function AppSidebar({ children }: { children?: React.ReactNode }) {
    const aiChatModalRef = useRef<AiChatModalHandle>(null);

    const mainNavItems: NavItem[] = [
        { title: 'Dashboard', href: dashboard(), icon: LayoutGrid },
        { title: 'Todos', href: todoIndex(), icon: CheckSquare },
        { title: 'Chores', href: choreIndex(), icon: RotateCcw },
        { title: 'Calendar', href: calendarIndex(), icon: CalendarDays },
        { title: 'Shopping', href: shoppingIndex(), icon: ShoppingCart },
        { title: 'Recipes', href: recipeIndex(), icon: ChefHat },
        { title: 'Family', href: familyShow(), icon: Users },
    ];

    return (
        <>
            <Sidebar collapsible="icon" variant="inset">
                <SidebarHeader>
                    <SidebarMenu>
                        <SidebarMenuItem>
                            <SidebarMenuButton size="lg" asChild>
                                <Link href={dashboard()}>
                                    <AppLogo />
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    </SidebarMenu>
                </SidebarHeader>

                <SidebarContent>
                    <NavMain items={mainNavItems} />
                </SidebarContent>

                <SidebarFooter>
                    <SidebarMenu>
                        <SidebarMenuItem>
                            <SidebarMenuButton
                                tooltip="AI Assistant"
                                className="text-primary hover:bg-primary/10 hover:text-primary"
                                onClick={() => aiChatModalRef.current?.open()}
                            >
                                <Sparkles className="size-4" />
                                <span>AI Assistant</span>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    </SidebarMenu>
                    <NavFooter items={footerNavItems} />
                    <NavUser />
                </SidebarFooter>
            </Sidebar>

            <AiChatModal ref={aiChatModalRef} />

            {children}
        </>
    );
}
