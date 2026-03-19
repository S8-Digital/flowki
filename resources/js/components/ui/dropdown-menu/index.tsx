import Box from '@mui/material/Box';
import MuiDivider from '@mui/material/Divider';
import MuiMenu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import * as React from 'react';
import { Slot } from '@/lib/slot';
import { cn } from '@/lib/utils';

interface DropdownMenuContextValue {
    anchorEl: HTMLElement | null;
    setAnchorEl: (el: HTMLElement | null) => void;
}

const DropdownMenuContext = React.createContext<DropdownMenuContextValue>({
    anchorEl: null,
    setAnchorEl: () => {},
});

function DropdownMenu({ children, ...props }: { children?: React.ReactNode; [key: string]: any }) {
    const [anchorEl, setAnchorEl] = React.useState<HTMLElement | null>(null);
    return (
        <DropdownMenuContext.Provider value={{ anchorEl, setAnchorEl }}>
            <Box sx={{ position: 'relative', display: 'inline-block' }} {...(props as any)}>
                {children}
            </Box>
        </DropdownMenuContext.Provider>
    );
}

function DropdownMenuTrigger({
    asChild,
    onClick,
    children,
    ...props
}: {
    asChild?: boolean;
    onClick?: React.MouseEventHandler;
    children?: React.ReactNode;
    [key: string]: any;
}) {
    const { setAnchorEl } = React.useContext(DropdownMenuContext);
    const handleClick = (e: React.MouseEvent<HTMLElement>) => {
        onClick?.(e as any);
        setAnchorEl(e.currentTarget);
    };
    if (asChild) {
        return (
            <Slot {...props} onClick={handleClick as any}>
                {children}
            </Slot>
        );
    }
    return (
        <Box component="button" type="button" onClick={handleClick as any} {...(props as any)}>
            {children}
        </Box>
    );
}

function DropdownMenuContent({
    className,
    align: _align,
    side: _side,
    children,
    ...props
}: React.HTMLAttributes<HTMLDivElement> & { align?: string; sideOffset?: number; side?: string }) {
    const { anchorEl, setAnchorEl } = React.useContext(DropdownMenuContext);
    return (
        <MuiMenu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={() => setAnchorEl(null)}
            className={cn(className)}
            slotProps={{ paper: { elevation: 2, sx: { minWidth: 192, borderRadius: 2 } } }}
            {...(props as any)}
        >
            {children}
        </MuiMenu>
    );
}

function DropdownMenuItem({
    className,
    asChild,
    children,
    inset,
    onClick,
    ...props
}: React.HTMLAttributes<HTMLDivElement> & { asChild?: boolean; inset?: boolean }) {
    const { setAnchorEl } = React.useContext(DropdownMenuContext);
    const handleClick = (e: React.MouseEvent<HTMLLIElement>) => {
        (onClick as any)?.(e);
        setAnchorEl(null);
    };
    return (
        <MenuItem onClick={handleClick} className={cn(inset && 'pl-8', className)} {...(props as any)}>
            {children}
        </MenuItem>
    );
}

function DropdownMenuLabel({ className, inset, ...props }: React.HTMLAttributes<HTMLDivElement> & { inset?: boolean }) {
    return (
        <Box
            className={cn(inset && 'pl-8', className)}
            sx={{ py: 0.75, px: 1, fontSize: '0.875rem', fontWeight: 600 }}
            {...(props as any)}
        />
    );
}

function DropdownMenuSeparator({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
    return <MuiDivider className={cn(className)} sx={{ my: 0.5 }} {...(props as any)} />;
}

function DropdownMenuGroup({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
    return <Box {...(props as any)}>{children}</Box>;
}

function DropdownMenuShortcut({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) {
    return (
        <Typography
            component="span"
            variant="caption"
            className={cn(className)}
            sx={{ ml: 'auto', letterSpacing: '0.1em', opacity: 0.6 }}
            {...(props as any)}
        />
    );
}

function DropdownMenuSub({ children }: { children?: React.ReactNode }) {
    return <>{children}</>;
}

function DropdownMenuSubTrigger({
    className,
    inset,
    children,
    ...props
}: React.HTMLAttributes<HTMLDivElement> & { inset?: boolean }) {
    return (
        <Box
            className={cn(inset && 'pl-8', className)}
            sx={{
                display: 'flex',
                cursor: 'default',
                userSelect: 'none',
                alignItems: 'center',
                borderRadius: 1,
                px: 1,
                py: 0.5,
                fontSize: '0.875rem',
            }}
            {...(props as any)}
        >
            {children}
        </Box>
    );
}

function DropdownMenuSubContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
    return (
        <Box
            className={cn(className)}
            sx={{
                zIndex: 50,
                minWidth: 128,
                overflow: 'hidden',
                borderRadius: 2,
                border: 1,
                borderColor: 'divider',
                bgcolor: 'background.paper',
                p: 0.5,
                boxShadow: 4,
            }}
            {...(props as any)}
        />
    );
}

export {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuShortcut,
    DropdownMenuSub,
    DropdownMenuSubContent,
    DropdownMenuSubTrigger,
    DropdownMenuTrigger,
};
