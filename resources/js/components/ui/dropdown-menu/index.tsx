import Box from '@mui/material/Box';
import MuiDivider from '@mui/material/Divider';
import MuiMenu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import * as React from 'react';
import { Slot } from '@/lib/slot';
import { cn } from '@/lib/utils';

const StyledDropdownMenuLabel = styled(Box)({
    fontSize: '0.875rem',
    fontWeight: 600,
});

const StyledDropdownMenuShortcut = styled(Typography)({
    letterSpacing: '0.1em',
    opacity: 0.6,
});

const StyledDropdownMenuSubTrigger = styled(Box)({
    cursor: 'default',
    userSelect: 'none' as const,
    fontSize: '0.875rem',
    borderRadius: 4,
});

const StyledDropdownMenuSubContent = styled(Box)(({ theme }) => ({
    borderRadius: theme.shape.borderRadius * 2,
    border: `1px solid ${theme.palette.divider}`,
    backgroundColor: theme.palette.background.paper,
    boxShadow: theme.shadows[4],
}));

interface DropdownMenuContextValue {
    anchorEl: HTMLElement | null;
    setAnchorEl: (el: HTMLElement | null) => void;
    controlledOpen?: boolean;
    onOpenChange?: (open: boolean) => void;
}

const DropdownMenuContext = React.createContext<DropdownMenuContextValue>({
    anchorEl: null,
    setAnchorEl: () => {},
});

function DropdownMenu({
    children,
    open,
    onOpenChange,
    ...props
}: {
    children?: React.ReactNode;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    [key: string]: any;
}) {
    const [anchorEl, setAnchorEl] = React.useState<HTMLElement | null>(null);

    return (
        <DropdownMenuContext.Provider value={{ anchorEl, setAnchorEl, controlledOpen: open, onOpenChange }}>
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
    const { setAnchorEl, onOpenChange } = React.useContext(DropdownMenuContext);
    const handleClick = (e: React.MouseEvent<HTMLElement>) => {
        onClick?.(e as any);
        setAnchorEl(e.currentTarget);
        onOpenChange?.(true);
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
    const { anchorEl, setAnchorEl, controlledOpen, onOpenChange } = React.useContext(DropdownMenuContext);
    const isOpen = controlledOpen !== undefined ? controlledOpen : Boolean(anchorEl);

    function handleClose() {
        setAnchorEl(null);
        onOpenChange?.(false);
    }

    return (
        <MuiMenu
            anchorEl={anchorEl}
            open={isOpen}
            onClose={handleClose}
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
    const { setAnchorEl, onOpenChange } = React.useContext(DropdownMenuContext);
    const handleClick = (e: React.MouseEvent<HTMLLIElement>) => {
        (onClick as any)?.(e);
        setAnchorEl(null);
        onOpenChange?.(false);
    };
    return (
        <MenuItem onClick={handleClick} className={cn(inset && 'pl-8', className)} {...(props as any)}>
            {children}
        </MenuItem>
    );
}

function DropdownMenuLabel({ className, inset, ...props }: React.HTMLAttributes<HTMLDivElement> & { inset?: boolean }) {
    return (
        <StyledDropdownMenuLabel
            className={cn(inset && 'pl-8', className)}
            sx={{ py: 0.75, px: 1 }}
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
        <StyledDropdownMenuShortcut
            component="span"
            variant="caption"
            className={cn(className)}
            sx={{ ml: 'auto' }}
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
        <StyledDropdownMenuSubTrigger
            className={cn(inset && 'pl-8', className)}
            sx={{ display: 'flex', alignItems: 'center', px: 1, py: 0.5 }}
            {...(props as any)}
        >
            {children}
        </StyledDropdownMenuSubTrigger>
    );
}

function DropdownMenuSubContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
    return (
        <StyledDropdownMenuSubContent
            className={cn(className)}
            sx={{ zIndex: 50, minWidth: 128, overflow: 'hidden', p: 0.5 }}
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
