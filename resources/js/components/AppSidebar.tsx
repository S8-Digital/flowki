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
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import useMediaQuery from '@mui/material/useMediaQuery';
import { CalendarDays, CheckSquare, ChefHat, LayoutGrid, LogOut, RotateCcw, Settings, ShoppingCart, Sparkles, Users } from 'lucide-react';
import * as React from 'react';
import { index as calendarIndex } from '@/actions/App/Http/Controllers/CalendarEventController';
import { index as choreIndex } from '@/actions/App/Http/Controllers/ChoreController';
import { show as familyShow } from '@/actions/App/Http/Controllers/FamilyController';
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

export default function AppSidebar() {
    const { open, mobileOpen, setMobileOpen } = useAppSidebar();
    const page = usePage<AppPageProps>();
    const user = page.props.auth.user;
    const isMobile = useMediaQuery('(max-width:899px)');
    const aiChatModalRef = React.useRef<AiChatModalHandle>(null);
    const [userMenuAnchor, setUserMenuAnchor] = React.useState<null | HTMLElement>(null);

    const mainNavItems: NavItem[] = [
        { title: 'Dashboard', href: dashboard(), icon: LayoutGrid, iconColor: '#3282b0' },
        { title: 'Todos', href: todoIndex(), icon: CheckSquare, iconColor: '#6e5cc8' },
        { title: 'Chores', href: choreIndex(), icon: RotateCcw, iconColor: '#3a8a5c' },
        { title: 'Calendar', href: calendarIndex(), icon: CalendarDays, iconColor: '#3282b0' },
        { title: 'Shopping', href: shoppingIndex(), icon: ShoppingCart, iconColor: '#c4503c' },
        { title: 'Recipes', href: recipeIndex(), icon: ChefHat, iconColor: '#d4900e' },
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
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
                bgcolor: 'var(--sidebar)',
                color: 'var(--sidebar-foreground)',
                boxShadow: 2,
            }}
        >
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
                            <ListItemButton
                                component={Link as React.ElementType}
                                href={item.href}
                                selected={isActive}
                                sx={{
                                    borderRadius: 1,
                                    minHeight: 40,
                                    px: open || isMobile ? 1.5 : 1,
                                    justifyContent: open || isMobile ? 'flex-start' : 'center',
                                    '&.Mui-selected': {
                                        bgcolor: 'var(--sidebar-accent)',
                                        color: 'var(--sidebar-accent-foreground)',
                                        '&:hover': {
                                            bgcolor: 'var(--sidebar-accent)',
                                        },
                                    },
                                    '&:hover': {
                                        bgcolor: 'var(--sidebar-accent)',
                                        color: 'var(--sidebar-accent-foreground)',
                                    },
                                    color: 'var(--sidebar-foreground)',
                                }}
                            >
                                <ListItemIcon
                                    sx={{
                                        minWidth: 0,
                                        mr: open || isMobile ? 1.5 : 0,
                                        justifyContent: 'center',
                                        color: 'inherit',
                                    }}
                                >
                                    {Icon && <Icon size={18} style={item.iconColor ? { color: item.iconColor } : undefined} />}
                                </ListItemIcon>
                                {(open || isMobile) && (
                                    <ListItemText
                                        primary={item.title}
                                        primaryTypographyProps={{ fontSize: '0.875rem', fontWeight: isActive ? 600 : 400 }}
                                    />
                                )}
                            </ListItemButton>
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

            <Divider sx={{ borderColor: 'var(--sidebar-border)' }} />

            {/* Footer */}
            <Box sx={{ py: 1, px: open || isMobile ? 1 : 0.5 }}>
                {/* AI Assistant */}
                <ListItem disablePadding sx={{ mb: 0.25 }}>
                    {!open && !isMobile ? (
                        <Tooltip title="AI Assistant" placement="right">
                            <ListItemButton
                                onClick={() => aiChatModalRef.current?.open()}
                                sx={{
                                    borderRadius: 1,
                                    minHeight: 40,
                                    px: 1,
                                    justifyContent: 'center',
                                    color: 'var(--sidebar-foreground)',
                                    '&:hover': { bgcolor: 'var(--sidebar-accent)', color: 'var(--sidebar-accent-foreground)' },
                                }}
                            >
                                <ListItemIcon sx={{ minWidth: 0, justifyContent: 'center', color: 'inherit' }}>
                                    <Sparkles size={18} />
                                </ListItemIcon>
                            </ListItemButton>
                        </Tooltip>
                    ) : (
                        <ListItemButton
                            onClick={() => aiChatModalRef.current?.open()}
                            sx={{
                                borderRadius: 1,
                                minHeight: 40,
                                px: 1.5,
                                color: 'var(--sidebar-foreground)',
                                '&:hover': { bgcolor: 'var(--sidebar-accent)', color: 'var(--sidebar-accent-foreground)' },
                            }}
                        >
                            <ListItemIcon sx={{ minWidth: 0, mr: 1.5, justifyContent: 'center', color: 'inherit' }}>
                                <Sparkles size={18} />
                            </ListItemIcon>
                            <ListItemText primary="AI Assistant" primaryTypographyProps={{ fontSize: '0.875rem' }} />
                        </ListItemButton>
                    )}
                </ListItem>

                {/* User menu */}
                <ListItem disablePadding>
                    {!open && !isMobile ? (
                        <Tooltip title={user.name} placement="right">
                            <IconButton
                                onClick={handleUserMenuOpen}
                                size="small"
                                sx={{
                                    width: '100%',
                                    borderRadius: 1,
                                    py: 0.75,
                                    color: 'var(--sidebar-foreground)',
                                    '&:hover': { bgcolor: 'var(--sidebar-accent)' },
                                }}
                            >
                                <Avatar
                                    src={user.avatar}
                                    alt={user.name}
                                    sx={{
                                        width: 28,
                                        height: 28,
                                        fontSize: '0.75rem',
                                        bgcolor: 'var(--sidebar-primary)',
                                        color: 'var(--sidebar-primary-foreground)',
                                        borderRadius: 1,
                                    }}
                                >
                                    {getInitials(user.name)}
                                </Avatar>
                            </IconButton>
                        </Tooltip>
                    ) : (
                        <ListItemButton
                            onClick={handleUserMenuOpen}
                            sx={{
                                borderRadius: 1,
                                minHeight: 48,
                                px: 1.5,
                                color: 'var(--sidebar-foreground)',
                                '&:hover': { bgcolor: 'var(--sidebar-accent)', color: 'var(--sidebar-accent-foreground)' },
                            }}
                        >
                            <ListItemIcon sx={{ minWidth: 0, mr: 1.5, justifyContent: 'center' }}>
                                <Avatar
                                    src={user.avatar}
                                    alt={user.name}
                                    sx={{
                                        width: 28,
                                        height: 28,
                                        fontSize: '0.75rem',
                                        bgcolor: 'var(--sidebar-primary)',
                                        color: 'var(--sidebar-primary-foreground)',
                                        borderRadius: 1,
                                    }}
                                >
                                    {getInitials(user.name)}
                                </Avatar>
                            </ListItemIcon>
                            <Box sx={{ flex: 1, minWidth: 0 }}>
                                <Typography variant="body2" noWrap fontWeight={500} sx={{ fontSize: '0.875rem', color: 'inherit' }}>
                                    {user.name}
                                </Typography>
                                {user.email && (
                                    <Typography variant="caption" noWrap sx={{ color: 'var(--muted-foreground)', display: 'block' }}>
                                        {user.email}
                                    </Typography>
                                )}
                            </Box>
                            <AppearanceToggle />
                        </ListItemButton>
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
                slotProps={{ paper: { sx: { minWidth: 180, borderRadius: 2 } } }}
            >
                <MenuItem onClick={handleSettings} sx={{ gap: 1.5, fontSize: '0.875rem' }}>
                    <Settings size={16} />
                    Settings
                </MenuItem>
                <Divider />
                <MenuItem onClick={handleLogout} sx={{ gap: 1.5, fontSize: '0.875rem', color: 'error.main' }}>
                    <LogOut size={16} />
                    Log out
                </MenuItem>
            </Menu>
        </Box>
    );

    return (
        <>
            {/* Desktop permanent drawer */}
            <Drawer
                variant="permanent"
                sx={{
                    display: { xs: 'none', md: 'block' },
                    width: open ? SIDEBAR_WIDTH : SIDEBAR_COLLAPSED_WIDTH,
                    flexShrink: 0,
                    transition: 'width 0.2s ease',
                    '& .MuiDrawer-paper': {
                        width: open ? SIDEBAR_WIDTH : SIDEBAR_COLLAPSED_WIDTH,
                        transition: 'width 0.2s ease',
                        boxSizing: 'border-box',
                        border: 'none',
                        overflow: 'visible',
                        borderRight: '1px solid var(--sidebar-border)',
                    },
                }}
            >
                {drawerContent}
            </Drawer>

            {/* Mobile temporary drawer */}
            <Drawer
                variant="temporary"
                open={mobileOpen}
                onClose={() => setMobileOpen(false)}
                ModalProps={{ keepMounted: true }}
                sx={{
                    display: { xs: 'block', md: 'none' },
                    '& .MuiDrawer-paper': {
                        width: SIDEBAR_WIDTH,
                        boxSizing: 'border-box',
                        border: 'none',
                    },
                }}
            >
                {drawerContent}
            </Drawer>

            <AiChatModal ref={aiChatModalRef} />
        </>
    );
}
