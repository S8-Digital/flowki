import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import MuiLink from '@mui/material/Link';
import type { SxProps, Theme } from '@mui/material/styles';
import * as React from 'react';
import { cn } from '@/lib/utils';

function NavigationMenu({ className, children, ...props }: React.HTMLAttributes<HTMLElement> & { sx?: SxProps<Theme> }) {
    return (
        <Box
            component="nav"
            className={cn(className)}
            sx={{ position: 'relative', zIndex: 10, display: 'flex', flex: 1, alignItems: 'center', justifyContent: 'flex-start' }}
            {...(props as any)}
        >
            {children}
        </Box>
    );
}

function NavigationMenuList({ className, ...props }: React.HTMLAttributes<HTMLUListElement> & { sx?: SxProps<Theme> }) {
    return (
        <Box
            component="ul"
            className={cn(className)}
            sx={{ display: 'flex', flex: 1, listStyle: 'none', alignItems: 'center', justifyContent: 'flex-start', gap: 0.5, m: 0, p: 0 }}
            {...(props as any)}
        />
    );
}

function NavigationMenuItem({ className, ...props }: React.HTMLAttributes<HTMLLIElement> & { sx?: SxProps<Theme> }) {
    return <Box component="li" className={cn(className)} sx={{ position: 'relative' }} {...(props as any)} />;
}

function NavigationMenuLink({
    className,
    children,
    active,
    href,
    ...props
}: React.AnchorHTMLAttributes<HTMLAnchorElement> & { active?: boolean; asChild?: boolean }) {
    return (
        <MuiLink
            href={href}
            className={cn(className)}
            underline="none"
            sx={{
                display: 'inline-flex',
                height: 36,
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 2,
                px: 2,
                py: 0.5,
                fontSize: '0.875rem',
                fontWeight: 500,
                color: 'inherit',
                transition: 'color 0.15s, background-color 0.15s',
                '&:hover': { bgcolor: 'action.hover' },
                ...(active ? { bgcolor: 'action.selected' } : {}),
            }}
            {...(props as any)}
        >
            {children}
        </MuiLink>
    );
}

function navigationMenuTriggerStyle() {
    return 'inline-flex h-9 cursor-pointer items-center justify-center rounded-md bg-transparent px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50';
}

function NavigationMenuTrigger({ className, children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
    return (
        <ButtonBase
            className={cn(className)}
            sx={{
                display: 'inline-flex',
                height: 36,
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 2,
                px: 2,
                py: 0.5,
                gap: 0.5,
                fontSize: '0.875rem',
                fontWeight: 500,
                cursor: 'pointer',
                bgcolor: 'transparent',
                transition: 'color 0.15s, background-color 0.15s',
                '&:hover': { bgcolor: 'action.hover' },
            }}
            {...(props as any)}
        >
            {children}
        </ButtonBase>
    );
}

function NavigationMenuContent({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
    return (
        <Box
            className={cn(className)}
            sx={{
                position: 'absolute',
                left: 0,
                top: '100%',
                mt: 0.5,
                minWidth: 192,
                borderRadius: 2,
                bgcolor: 'background.paper',
                p: 0.5,
                boxShadow: 4,
            }}
            {...(props as any)}
        >
            {children}
        </Box>
    );
}

export {
    NavigationMenu,
    NavigationMenuContent,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
    NavigationMenuTrigger,
    navigationMenuTriggerStyle,
};
