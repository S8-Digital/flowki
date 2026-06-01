import { Link, router, usePage } from '@inertiajs/react';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { styled } from '@mui/material/styles';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import useMediaQuery from '@mui/material/useMediaQuery';
import {
    CalendarDays,
    CheckSquare,
    ChefHat,
    ChevronUp,
    LayoutGrid,
    LogOut,
    RotateCcw,
    Settings,
    ShoppingCart,
    Sparkles,
    UtensilsCrossed,
    Users,
} from 'lucide-react';
import * as React from 'react';
import { index as calendarIndex } from '@/actions/App/Http/Controllers/CalendarEventController';
import { index as choreIndex } from '@/actions/App/Http/Controllers/ChoreController';
import { show as familyShow } from '@/actions/App/Http/Controllers/FamilyController';
import { index as mealIndex } from '@/actions/App/Http/Controllers/MealController';
import { index as recipeIndex } from '@/actions/App/Http/Controllers/RecipeController';
import { index as shoppingIndex } from '@/actions/App/Http/Controllers/ShoppingListController';
import { index as todoIndex } from '@/actions/App/Http/Controllers/TodoController';
import AiChatModal from '@/components/AiChatModal';
import type { AiChatModalHandle } from '@/components/AiChatModal';
import AppearanceToggle from '@/components/AppearanceToggle';
import AppLogo from '@/components/AppLogo';
import { SIDEBAR_COLLAPSED_WIDTH, SIDEBAR_WIDTH, useAppSidebar } from '@/components/AppSidebarContext';
import { getInitials } from '@/hooks/useInitials';
import { toUrl, urlIsActive } from '@/lib/utils';
import { dashboard, logout } from '@/routes';
import { edit } from '@/routes/profile';
import type { AppPageProps, NavItem } from '@/types';
import type { PolymorphicProps } from '@/types/globals';

const SidebarContainer = styled(Box)(({ theme }) => ({
    backgroundColor: 'var(--sidebar)',
    color: 'var(--sidebar-foreground)',
    boxShadow: theme.shadows[2],
}));

const SidebarNavButton = styled(ListItemButton)<PolymorphicProps>(({ theme }) => ({
    borderRadius: theme.shape.borderRadius,
    color: 'var(--sidebar-foreground)',
    '&.Mui-selected': {
        backgroundColor: 'var(--sidebar-accent)',
        color: 'var(--sidebar-accent-foreground)',
        '&:hover': {
            backgroundColor: 'var(--sidebar-accent)',
        },
    },
    '&:hover': {
        backgroundColor: 'var(--sidebar-accent)',
        color: 'var(--sidebar-accent-foreground)',
    },
}));

const SidebarNavIcon = styled(ListItemIcon)({
    color: 'inherit',
});

const AiNavButton = styled(ListItemButton)(({ theme }) => ({
    borderRadius: theme.shape.borderRadius,
    color: 'var(--sidebar-foreground)',
    '&:hover': {
        backgroundColor: 'var(--sidebar-accent)',
        color: 'var(--sidebar-accent-foreground)',
    },
}));

const SidebarUserIconButton = styled(IconButton)(({ theme }) => ({
    borderRadius: theme.shape.borderRadius,
    color: 'var(--sidebar-foreground)',
    '&:hover': {
        backgroundColor: 'var(--sidebar-accent)',
    },
}));

const SidebarUserButton = styled(ListItemButton)(({ theme }) => ({
    borderRadius: theme.shape.borderRadius,
    color: 'var(--sidebar-foreground)',
    '&:hover': {
        backgroundColor: 'var(--sidebar-accent)',
        color: 'var(--sidebar-accent-foreground)',
    },
}));

const SidebarAvatar = styled(Avatar)(({ theme }) => ({
    fontSize: '0.75rem',
    backgroundColor: 'var(--sidebar-primary)',
    color: 'var(--sidebar-primary-foreground)',
    borderRadius: theme.shape.borderRadius,
}));

const SidebarDivider = styled(Divider)(({ theme }) => ({
    borderColor: theme.palette.divider,
}));

const UserNameText = styled(Typography)({
    fontSize: '0.875rem',
    color: 'inherit',
});

const UserEmailText = styled(Typography)(({ theme }) => ({
    color: theme.palette.text.secondary,
}));

const SidebarMenuItem = styled(MenuItem)({
    fontSize: '0.875rem',
});

const LogoutMenuItem = styled(MenuItem)(({ theme }) => ({
    fontSize: '0.875rem',
    color: theme.palette.error.main,
}));

const SidebarDesktopDrawer = styled(Drawer)(({ theme }) => ({
    transition: 'width 0.2s ease',
    '& .MuiDrawer-paper': {
        transition: 'width 0.2s ease',
        boxSizing: 'border-box',
        border: 'none',
        overflow: 'visible',
        borderRight: `1px solid ${theme.palette.divider}`,
    },
}));

const SidebarMobileDrawer = styled(Drawer)({
    '& .MuiDrawer-paper': {
        boxSizing: 'border-box',
        border: 'none',
    },
});

export default function AppSidebar() {
    const { open, mobileOpen, setMobileOpen } = useAppSidebar();
    const page = usePage<AppPageProps>();
    const user = page.props.auth?.user;
    const isMobile = useMediaQuery('(max-width:899px)');
    const aiChatModalRef = React.useRef<AiChatModalHandle>(null);
    const [userMenuAnchor, setUserMenuAnchor] = React.useState<null | HTMLElement>(null);

    if (!user) {
        return null;
    }

    const mainNavItems: NavItem[] = [
        { title: 'Dashboard', href: dashboard(), icon: LayoutGrid, iconColor: '#3282b0' },
        { title: 'Todos', href: todoIndex(), icon: CheckSquare, iconColor: '#6e5cc8' },
        { title: 'Chores', href: choreIndex(), icon: RotateCcw, iconColor: '#3a8a5c' },
        { title: 'Calendar', href: calendarIndex(), icon: CalendarDays, iconColor: '#3282b0' },
        { title: 'Shopping', href: shoppingIndex(), icon: ShoppingCart, iconColor: '#c4503c' },
        { title: 'Recipes', href: recipeIndex(), icon: ChefHat, iconColor: '#d4900e' },
        { title: 'Meal Planner', href: mealIndex(), icon: UtensilsCrossed, iconColor: '#a85c3a' },
        { title: 'Family', href: familyShow(), icon: Users, iconColor: '#5ba3cb' },
    ];

    function handleUserMenuOpen(event: React.MouseEvent<HTMLElement>) {
        setUserMenuAnchor(event.currentTarget);
    }

    function handleUserMenuClose() {
        setUserMenuAnchor(null);
    }

    function handleLogout() {
        handleUserMenuClose();
        router.flushAll();
        router.post(toUrl(logout()));
    }

    function handleSettings() {
        handleUserMenuClose();
        router.visit(toUrl(edit()));
    }

    const drawerContent = (
        <SidebarContainer sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            {/* Header / Logo */}
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    height: 63,
                    px: open || isMobile ? 2 : 1,
                    flexShrink: 0,
                    justifyContent: open || isMobile ? 'flex-start' : 'center',
                }}
            >
                <Box
                    component={Link}
                    href={dashboard()}
                    sx={{ display: 'flex', alignItems: 'center', gap: 1, textDecoration: 'none', color: 'inherit', minWidth: 0, overflow: 'hidden' }}
                >
                    <AppLogo />
                </Box>
            </Box>

            {/* Navigation */}
            <Box sx={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', py: 1 }}>
                <List disablePadding sx={{ px: open || isMobile ? 1 : 0.5 }}>
                    {mainNavItems.map((item) => {
                        const isActive = urlIsActive(item.href, page.url);
                        const Icon = item.icon;
                        const button = (
                            <SidebarNavButton
                                component={Link as React.ElementType}
                                href={toUrl(item.href)}
                                selected={isActive}
                                sx={{
                                    minHeight: 40,
                                    px: open || isMobile ? 1.5 : 1,
                                    justifyContent: open || isMobile ? 'flex-start' : 'center',
                                }}
                            >
                                <SidebarNavIcon sx={{ minWidth: 0, mr: open || isMobile ? 1.5 : 0, justifyContent: 'center' }}>
                                    {Icon && <Icon size={18} style={item.iconColor ? { color: item.iconColor } : undefined} />}
                                </SidebarNavIcon>
                                {(open || isMobile) && (
                                    <ListItemText
                                        primary={item.title}
                                        primaryTypographyProps={{ fontSize: '0.875rem', fontWeight: isActive ? 600 : 400 }}
                                    />
                                )}
                            </SidebarNavButton>
                        );

                        return (
                            <ListItem key={item.title} disablePadding sx={{ mb: 0.25 }}>
                                {!open && !isMobile ? (
                                    <Tooltip title={item.title} placement="right">
                                        {button}
                                    </Tooltip>
                                ) : (
                                    button
                                )}
                            </ListItem>
                        );
                    })}
                </List>
            </Box>

            <SidebarDivider />

            {/* Footer */}
            <Box sx={{ py: 1, px: open || isMobile ? 1 : 0.5 }}>
                {/* AI Assistant */}
                <ListItem disablePadding sx={{ mb: 0.25 }}>
                    {!open && !isMobile ? (
                        <Tooltip title="AI Assistant" placement="right">
                            <AiNavButton onClick={() => aiChatModalRef.current?.open()} sx={{ minHeight: 40, px: 1, justifyContent: 'center' }}>
                                <SidebarNavIcon sx={{ minWidth: 0, justifyContent: 'center' }}>
                                    <Sparkles size={18} />
                                </SidebarNavIcon>
                            </AiNavButton>
                        </Tooltip>
                    ) : (
                        <AiNavButton onClick={() => aiChatModalRef.current?.open()} sx={{ minHeight: 40, px: 1.5 }}>
                            <SidebarNavIcon sx={{ minWidth: 0, mr: 1.5, justifyContent: 'center' }}>
                                <Sparkles size={18} />
                            </SidebarNavIcon>
                            <ListItemText primary="AI Assistant" primaryTypographyProps={{ fontSize: '0.875rem' }} />
                        </AiNavButton>
                    )}
                </ListItem>

                {/* User menu */}
                <ListItem disablePadding>
                    {!open && !isMobile ? (
                        <Tooltip title={user.name} placement="right">
                            <SidebarUserIconButton onClick={handleUserMenuOpen} size="small" sx={{ width: '100%', py: 0.75 }}>
                                <SidebarAvatar src={user.avatar} alt={user.name} sx={{ width: 28, height: 28 }}>
                                    {getInitials(user.name)}
                                </SidebarAvatar>
                            </SidebarUserIconButton>
                        </Tooltip>
                    ) : (
                        <SidebarUserButton onClick={handleUserMenuOpen} sx={{ minHeight: 48, px: 1.5 }}>
                            <ListItemIcon sx={{ minWidth: 0, mr: 1.5, justifyContent: 'center' }}>
                                <SidebarAvatar src={user.avatar} alt={user.name} sx={{ width: 28, height: 28 }}>
                                    {getInitials(user.name)}
                                </SidebarAvatar>
                            </ListItemIcon>
                            <Box sx={{ flex: 1, minWidth: 0 }}>
                                <UserNameText variant="body2" noWrap fontWeight={500}>
                                    {user.name}
                                </UserNameText>
                            </Box>
                            <ChevronUp size={16} />
                        </SidebarUserButton>
                    )}
                </ListItem>
            </Box>

            {/* User Menu Popover */}
            <Menu
                anchorEl={userMenuAnchor}
                open={Boolean(userMenuAnchor)}
                onClose={handleUserMenuClose}
                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                transformOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                slotProps={{ paper: { sx: { minWidth: 220 }, style: { borderRadius: 8 } } }}
            >
                <SidebarMenuItem sx={{ gap: 1.5 }}>
                    <ListItemIcon sx={{ minWidth: 0, justifyContent: 'center' }}>
                        <SidebarAvatar src={user.avatar} alt={user.name} sx={{ width: 28, height: 28 }}>
                            {getInitials(user.name)}
                        </SidebarAvatar>
                    </ListItemIcon>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                        <UserNameText variant="body2" noWrap fontWeight={500}>
                            {user.name}
                        </UserNameText>
                        {user.email && (
                            <UserEmailText variant="caption" noWrap sx={{ display: 'block' }}>
                                {user.email}
                            </UserEmailText>
                        )}
                    </Box>
                    <AppearanceToggle />
                </SidebarMenuItem>
                <Divider />
                <SidebarMenuItem onClick={handleSettings} sx={{ gap: 1.5 }}>
                    <Settings size={16} />
                    Settings
                </SidebarMenuItem>
                <Divider />
                <LogoutMenuItem onClick={handleLogout} sx={{ gap: 1.5 }}>
                    <LogOut size={16} />
                    Log out
                </LogoutMenuItem>
            </Menu>
        </SidebarContainer>
    );

    return (
        <>
            {/* Desktop permanent drawer */}
            <SidebarDesktopDrawer
                variant="permanent"
                sx={{
                    display: { xs: 'none', md: 'block' },
                    width: open ? SIDEBAR_WIDTH : SIDEBAR_COLLAPSED_WIDTH,
                    flexShrink: 0,
                    '& .MuiDrawer-paper': {
                        width: open ? SIDEBAR_WIDTH : SIDEBAR_COLLAPSED_WIDTH,
                    },
                }}
            >
                {drawerContent}
            </SidebarDesktopDrawer>

            {/* Mobile temporary drawer */}
            <SidebarMobileDrawer
                variant="temporary"
                open={mobileOpen}
                onClose={() => setMobileOpen(false)}
                ModalProps={{ keepMounted: true }}
                sx={{
                    display: { xs: 'block', md: 'none' },
                    '& .MuiDrawer-paper': {
                        width: SIDEBAR_WIDTH,
                    },
                }}
            >
                {drawerContent}
            </SidebarMobileDrawer>

            <AiChatModal ref={aiChatModalRef} />
        </>
    );
}
