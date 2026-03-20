import Box from '@mui/material/Box';
import MuiDrawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import type { SxProps, Theme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
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
        <Box component="button" type="button" onClick={handleClick} {...(props as any)}>
            {children}
        </Box>
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
        <Box component="button" type="button" onClick={handleClick} {...(props as any)}>
            {children}
        </Box>
    );
}

function SheetOverlay({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
    return <Box className={cn(className)} {...(props as any)} />;
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
}: React.HTMLAttributes<HTMLDivElement> & { side?: string; sx?: SxProps<Theme> }) {
    const ctx = React.useContext(SheetContext);
    return (
        <MuiDrawer
            anchor={ANCHOR_MAP[side] ?? 'right'}
            open={ctx?.open ?? false}
            onClose={() => ctx?.setOpen(false)}
            {...(props as any)}
        >
            <Box
                className={cn(className)}
                sx={{
                    p: 3,
                    position: 'relative',
                    minWidth: 300,
                    bgcolor: 'background.default',
                    color: 'text.primary',
                }}
            >
                {children}
                <IconButton
                    size="small"
                    onClick={() => ctx?.setOpen(false)}
                    sx={{ position: 'absolute', top: 1, right: 1, opacity: 0.7, '&:hover': { opacity: 1 } }}
                >
                    <XIcon size={16} />
                    <Box
                        component="span"
                        sx={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0,0,0,0)' }}
                    >
                        Close
                    </Box>
                </IconButton>
            </Box>
        </MuiDrawer>
    );
}

function SheetHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement> & { sx?: SxProps<Theme> }) {
    return (
        <Box
            className={cn(className)}
            sx={{ display: 'flex', flexDirection: 'column', gap: 0.75, textAlign: 'left', mb: 2 }}
            {...(props as any)}
        />
    );
}

function SheetFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
    return (
        <Box
            className={cn(className)}
            sx={{ display: 'flex', flexDirection: 'column-reverse', gap: 1, mt: 2 }}
            {...(props as any)}
        />
    );
}

function SheetTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement> & { sx?: SxProps<Theme> }) {
    return (
        <Typography
            variant="h6"
            component="h2"
            className={cn(className)}
            sx={{ m: 0 }}
            {...(props as any)}
        />
    );
}

function SheetDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
    return (
        <Typography
            variant="body2"
            component="p"
            className={cn(className)}
            sx={{ color: 'text.secondary', m: 0 }}
            {...(props as any)}
        />
    );
}

export { Sheet, SheetClose, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetOverlay, SheetTitle, SheetTrigger };
