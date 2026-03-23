import type { InertiaLinkProps } from '@inertiajs/react';
import { Link, usePage } from '@inertiajs/react';
import Box from '@mui/material/Box';
import MuiLink from '@mui/material/Link';
import { styled } from '@mui/material/styles';
import { BookOpen, Folder, LayoutGrid, Menu } from 'lucide-react';
import AppLogo from '@/components/AppLogo';
import AppLogoIcon from '@/components/AppLogoIcon';
import Breadcrumbs from '@/components/Breadcrumbs';
import GlobalSearch from '@/components/GlobalSearch';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { NavigationMenu, NavigationMenuItem, NavigationMenuList, navigationMenuTriggerStyle } from '@/components/ui/navigation-menu';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import UserMenuContent from '@/components/UserMenuContent';
import { getInitials } from '@/hooks/useInitials';
import { cn, toUrl, urlIsActive } from '@/lib/utils';
import type { AppPageProps, BreadcrumbItem, NavItem } from '@/types';
import type { PolymorphicProps } from '@/types/globals';
import { dashboard } from '@/routes';

const MobileNavLink = styled(MuiLink, {
    shouldForwardProp: (prop) => prop !== 'isActive',
})<PolymorphicProps & { isActive?: boolean }>(({ theme, isActive }) => ({
    fontSize: '0.875rem',
    fontWeight: 500,
    textDecoration: 'none',
    color: theme.palette.text.primary,
    borderRadius: theme.shape.borderRadius,
    ...(isActive && {
        backgroundColor: theme.palette.action.selected,
    }),
    '&:hover': {
        backgroundColor: theme.palette.action.hover,
    },
}));

const ExternalNavLink = styled(MuiLink)(({ theme }) => ({
    fontSize: '0.875rem',
    fontWeight: 500,
    color: theme.palette.text.primary,
    textDecoration: 'none',
    '&:hover': {
        textDecoration: 'underline',
    },
}));

const ActiveNavIndicator = styled(Box)(({ theme }) => ({
    backgroundColor: theme.palette.text.primary,
}));

const BreadcrumbsBar = styled(Box)(({ theme }) => ({
    color: theme.palette.text.secondary,
}));

interface AppHeaderProps {
    breadcrumbs?: BreadcrumbItem[];
}

const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: dashboard(),
        icon: LayoutGrid,
    },
];

const rightNavItems: NavItem[] = [
    {
        title: 'Repository',
        href: 'https://github.com/laravel/vue-starter-kit',
        icon: Folder,
    },
    {
        title: 'Documentation',
        href: 'https://laravel.com/docs/starter-kits#vue',
        icon: BookOpen,
    },
];

export default function AppHeader({ breadcrumbs = [] }: AppHeaderProps) {
    const page = usePage<AppPageProps>();
    const auth = page.props.auth;

    const srOnlyLayout = { position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0,0,0,0)' } as const;

    function isCurrentRoute(url: NonNullable<InertiaLinkProps['href']>) {
        return urlIsActive(url, page.url);
    }

    return (
        <Box>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Box sx={{ mx: 'auto', display: 'flex', height: 64, alignItems: 'center', px: 2, maxWidth: { md: '7xl' } }}>
                    {/* Mobile Menu */}
                    <Box sx={{ display: { xs: 'block', lg: 'none' } }}>
                        <Sheet>
                            <SheetTrigger asChild>
                                <Button variant="ghost" size="icon" sx={{ mr: 1, width: 36, height: 36 }}>
                                    <Menu size={20} />
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="left" sx={{ width: 300, p: 3 }}>
                                <SheetTitle sx={srOnlyLayout} style={{ whiteSpace: 'nowrap' }}>
                                    Navigation Menu
                                </SheetTitle>
                                <SheetHeader sx={{ display: 'flex', justifyContent: 'flex-start' }}>
                                    <AppLogoIcon style={{ width: 24, height: 24 }} />
                                </SheetHeader>
                                <Box
                                    sx={{
                                        display: 'flex',
                                        height: '100%',
                                        flex: 1,
                                        flexDirection: 'column',
                                        justifyContent: 'space-between',
                                        gap: 2,
                                        py: 3,
                                    }}
                                >
                                    <Box component="nav" sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, mx: -1.5 }}>
                                        {mainNavItems.map((item) => (
                                            <MobileNavLink
                                                key={item.title}
                                                component={Link as React.ElementType}
                                                href={toUrl(item.href)}
                                                isActive={isCurrentRoute(item.href)}
                                                sx={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: 1.5,
                                                    px: 1.5,
                                                    py: 1,
                                                }}
                                            >
                                                {item.icon && <item.icon size={20} />}
                                                {item.title}
                                            </MobileNavLink>
                                        ))}
                                    </Box>
                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                        {rightNavItems.map((item) => (
                                            <ExternalNavLink
                                                key={item.title}
                                                href={toUrl(item.href)}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                sx={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: 1,
                                                }}
                                            >
                                                {item.icon && <item.icon size={20} />}
                                                <Box component="span">{item.title}</Box>
                                            </ExternalNavLink>
                                        ))}
                                    </Box>
                                </Box>
                            </SheetContent>
                        </Sheet>
                    </Box>

                    <MuiLink component={Link} href={dashboard()} sx={{ display: 'flex', alignItems: 'center', gap: 1, textDecoration: 'none' }}>
                        <AppLogo />
                    </MuiLink>

                    {/* Desktop Menu */}
                    <Box sx={{ display: { xs: 'none', lg: 'flex' }, height: '100%', flex: 1 }}>
                        <NavigationMenu sx={{ ml: 5, display: 'flex', height: '100%', alignItems: 'stretch' }}>
                            <NavigationMenuList sx={{ display: 'flex', height: '100%', alignItems: 'stretch', gap: 1 }}>
                                {mainNavItems.map((item, index) => (
                                    <NavigationMenuItem
                                        key={index}
                                        sx={{ position: 'relative', display: 'flex', height: '100%', alignItems: 'center' }}
                                    >
                                        <Link className={cn(navigationMenuTriggerStyle(), 'h-9 cursor-pointer px-3')} href={item.href}>
                                            {item.icon && <item.icon size={16} style={{ marginRight: 8 }} />}
                                            {item.title}
                                        </Link>
                                        {isCurrentRoute(item.href) && (
                                            <ActiveNavIndicator
                                                sx={{
                                                    position: 'absolute',
                                                    bottom: 0,
                                                    left: 0,
                                                    height: '2px',
                                                    width: '100%',
                                                    transform: 'translateY(1px)',
                                                }}
                                            />
                                        )}
                                    </NavigationMenuItem>
                                ))}
                            </NavigationMenuList>
                        </NavigationMenu>
                    </Box>

                    <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box sx={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <GlobalSearch />

                            <Box sx={{ display: { xs: 'none', lg: 'flex' }, gap: 0.5 }}>
                                {rightNavItems.map((item) => (
                                    <TooltipProvider key={item.title} delayDuration={0}>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button variant="ghost" size="icon" asChild sx={{ width: 36, height: 36 }}>
                                                    <a href={toUrl(item.href)} target="_blank" rel="noopener noreferrer">
                                                        <Box component="span" sx={srOnlyLayout} style={{ whiteSpace: 'nowrap' }}>
                                                            {item.title}
                                                        </Box>
                                                        {item.icon && <item.icon size={20} style={{ opacity: 0.8 }} />}
                                                    </a>
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p>{item.title}</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                ))}
                            </Box>
                        </Box>

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" sx={{ position: 'relative', width: 40, p: 0.5 }} aria-label="User menu">
                                    <Avatar style={{ width: 32, height: 32, overflow: 'hidden', borderRadius: '50%' }}>
                                        {auth.user.avatar && <AvatarImage src={auth.user.avatar} alt={auth.user.name} />}
                                        <AvatarFallback style={{ borderRadius: 8, fontWeight: 600 }}>{getInitials(auth.user?.name)}</AvatarFallback>
                                    </Avatar>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" style={{ width: 224 }}>
                                <UserMenuContent user={auth.user} />
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </Box>
                </Box>
            </Box>

            {breadcrumbs.length > 1 && (
                <Box sx={{ display: 'flex', width: '100%', borderBottom: 1, borderColor: 'divider' }}>
                    <BreadcrumbsBar
                        sx={{
                            mx: 'auto',
                            display: 'flex',
                            height: 48,
                            width: '100%',
                            alignItems: 'center',
                            justifyContent: 'flex-start',
                            px: 2,
                        }}
                    >
                        <Breadcrumbs breadcrumbs={breadcrumbs} />
                    </BreadcrumbsBar>
                </Box>
            )}
        </Box>
    );
}
