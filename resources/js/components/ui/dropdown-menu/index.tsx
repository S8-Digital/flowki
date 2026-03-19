import MuiMenu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
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
            <div style={{ position: 'relative', display: 'inline-block' }} {...props}>
                {children}
            </div>
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
        <button type="button" onClick={handleClick} {...props}>
            {children}
        </button>
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
        <div
            className={cn(inset && 'pl-8', className)}
            style={{ padding: '6px 8px', fontSize: '0.875rem', fontWeight: 600 }}
            {...props}
        />
    );
}

function DropdownMenuSeparator({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
    return <div className={cn(className)} style={{ margin: '4px 0', height: 1, backgroundColor: 'var(--border)' }} {...props} />;
}

function DropdownMenuGroup({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
    return <div {...props}>{children}</div>;
}

function DropdownMenuShortcut({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) {
    return <span className={cn(className)} style={{ marginLeft: 'auto', fontSize: '0.75rem', letterSpacing: '0.1em', opacity: 0.6 }} {...props} />;
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
        <div
            className={cn('flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm', inset && 'pl-8', className)}
            {...props}
        >
            {children}
        </div>
    );
}

function DropdownMenuSubContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
    return (
        <div
            className={cn('z-50 min-w-32 overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-lg', className)}
            {...props}
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
