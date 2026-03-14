<script setup lang="ts">
import AiChatModal from '@/components/AiChatModal.vue';
import NavFooter from '@/components/NavFooter.vue';
import NavMain from '@/components/NavMain.vue';
import NavUser from '@/components/NavUser.vue';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { index as calendarIndex } from '@/actions/App/Http/Controllers/CalendarEventController';
import { index as choreIndex } from '@/actions/App/Http/Controllers/ChoreController';
import { index as recipeIndex } from '@/actions/App/Http/Controllers/RecipeController';
import { index as shoppingIndex } from '@/actions/App/Http/Controllers/ShoppingListController';
import { index as todoIndex } from '@/actions/App/Http/Controllers/TodoController';
import { show as familyShow } from '@/actions/App/Http/Controllers/FamilyController';
import { dashboard } from '@/routes';
import { type NavItem } from '@/types';
import { Link } from '@inertiajs/vue3';
import { CalendarDays, CheckSquare, ChefHat, LayoutGrid, RotateCcw, ShoppingCart, Sparkles, Users } from 'lucide-vue-next';
import { ref } from 'vue';
import AppLogo from './AppLogo.vue';

const aiChatModal = ref<InstanceType<typeof AiChatModal> | null>(null);

const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: dashboard(),
        icon: LayoutGrid,
    },
    {
        title: 'Todos',
        href: todoIndex(),
        icon: CheckSquare,
    },
    {
        title: 'Chores',
        href: choreIndex(),
        icon: RotateCcw,
    },
    {
        title: 'Calendar',
        href: calendarIndex(),
        icon: CalendarDays,
    },
    {
        title: 'Shopping',
        href: shoppingIndex(),
        icon: ShoppingCart,
    },
    {
        title: 'Recipes',
        href: recipeIndex(),
        icon: ChefHat,
    },
    {
        title: 'Family',
        href: familyShow(),
        icon: Users,
    },
];

const footerNavItems: NavItem[] = [];
</script>

<template>
    <Sidebar collapsible="icon" variant="inset">
        <SidebarHeader>
            <SidebarMenu>
                <SidebarMenuItem>
                    <SidebarMenuButton size="lg" as-child>
                        <Link :href="dashboard()">
                            <AppLogo />
                        </Link>
                    </SidebarMenuButton>
                </SidebarMenuItem>
            </SidebarMenu>
        </SidebarHeader>

        <SidebarContent>
            <NavMain :items="mainNavItems" />
        </SidebarContent>

        <SidebarFooter>
            <!-- AI Assistant trigger -->
            <SidebarMenu>
                <SidebarMenuItem>
                    <SidebarMenuButton
                        tooltip="AI Assistant"
                        class="text-primary hover:bg-primary/10 hover:text-primary"
                        @click="aiChatModal?.open()"
                    >
                        <Sparkles class="size-4" />
                        <span>AI Assistant</span>
                    </SidebarMenuButton>
                </SidebarMenuItem>
            </SidebarMenu>
            <NavFooter :items="footerNavItems" />
            <NavUser />
        </SidebarFooter>
    </Sidebar>

    <AiChatModal ref="aiChatModal" />

    <slot />
</template>
