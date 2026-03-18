import MuiDrawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import { XIcon } from 'lucide-react';
import * as React from 'react';
import { Slot } from '@/lib/slot';
import { cn } from '@/lib/utils';

interface SheetContextValue {
    open: boolean;
    setOpen: (value: boolean) => void;
}

const SheetContext = React.createContext<SheetContextValue | null>(null);

function Sheet({
    open: openProp,
    onOpenChange,
    children,
}: {
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    children?: React.ReactNode;
}) {
    const [uncontrolledOpen, setUncontrolledOpen] = React.useState(false);
    const isControlled = openProp !== undefined;
    const open = isControlled ? openProp! : uncontrolledOpen;

    const setOpen = React.useCallback(
        (value: boolean) => {
            if (openProp === undefined) setUncontrolledOpen(value);
            onOpenChange?.(value);
        },
        [openProp, onOpenChange],
    );

    return <SheetContext.Provider value={{ open, setOpen }}>{children}</SheetContext.Provider>;
}

function SheetTrigger({
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
    const ctx = React.useContext(SheetContext);
    const handleClick = (e: React.MouseEvent) => {
        onClick?.(e);
        ctx?.setOpen(true);
    };
    if (asChild) {
        return (
            <Slot {...props} onClick={handleClick}>
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

function SheetClose({
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
    const ctx = React.useContext(SheetContext);
    const handleClick = (e: React.MouseEvent) => {
        onClick?.(e);
        ctx?.setOpen(false);
    };
    if (asChild) {
        return (
            <Slot {...props} onClick={handleClick}>
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

function SheetOverlay({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
    return <div className={cn(className)} {...props} />;
}

const ANCHOR_MAP: Record<string, 'left' | 'right' | 'top' | 'bottom'> = {
    left: 'left',
    right: 'right',
    top: 'top',
    bottom: 'bottom',
};

function SheetContent({
    className,
    children,
    side = 'right',
    ...props
}: React.HTMLAttributes<HTMLDivElement> & { side?: string }) {
    const ctx = React.useContext(SheetContext);
    return (
        <MuiDrawer
            anchor={ANCHOR_MAP[side] ?? 'right'}
            open={ctx?.open ?? false}
            onClose={() => ctx?.setOpen(false)}
            {...(props as any)}
        >
            <div
                className={cn(className)}
                style={{ padding: 24, position: 'relative', minWidth: 300, backgroundColor: 'var(--background)', color: 'var(--foreground)' }}
            >
                {children}
                <IconButton
                    size="small"
                    onClick={() => ctx?.setOpen(false)}
                    sx={{ position: 'absolute', top: 8, right: 8, opacity: 0.7, '&:hover': { opacity: 1 } }}
                >
                    <XIcon size={16} />
                    <span style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0,0,0,0)' }}>Close</span>
                </IconButton>
            </div>
        </MuiDrawer>
    );
}

function SheetHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
    return <div className={cn(className)} style={{ display: 'flex', flexDirection: 'column', gap: 6, textAlign: 'left', marginBottom: 16 }} {...props} />;
}

function SheetFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
    return (
        <div
            className={cn(className)}
            style={{ display: 'flex', flexDirection: 'column-reverse', gap: 8, marginTop: 16 }}
            {...props}
        />
    );
}

function SheetTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
    return <h2 className={cn(className)} style={{ fontSize: '1.125rem', fontWeight: 600, margin: 0 }} {...props} />;
}

function SheetDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
    return <p className={cn(className)} style={{ fontSize: '0.875rem', color: 'var(--muted-foreground)', margin: 0 }} {...props} />;
}

export { Sheet, SheetClose, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetOverlay, SheetTitle, SheetTrigger };
