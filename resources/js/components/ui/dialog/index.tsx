import MuiDialog from '@mui/material/Dialog';
import MuiDialogContent from '@mui/material/DialogContent';
import MuiDialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import { XIcon } from 'lucide-react';
import * as React from 'react';
import { Slot } from '@/lib/slot';
import { cn } from '@/lib/utils';

interface DialogContextValue {
    open: boolean;
    setOpen: (value: boolean) => void;
}

const DialogContext = React.createContext<DialogContextValue | null>(null);

function Dialog({
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

    return <DialogContext.Provider value={{ open, setOpen }}>{children}</DialogContext.Provider>;
}

function DialogTrigger({
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
    const ctx = React.useContext(DialogContext);
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

function DialogPortal({ children }: { children?: React.ReactNode }) {
    return <>{children}</>;
}

function DialogClose({
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
    const ctx = React.useContext(DialogContext);
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

function DialogOverlay({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
    return <div className={cn(className)} {...props} />;
}

function DialogContent({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
    const ctx = React.useContext(DialogContext);
    return (
        <MuiDialog open={ctx?.open ?? false} onClose={() => ctx?.setOpen(false)} maxWidth="sm" fullWidth {...(props as any)}>
            <MuiDialogContent className={cn(className)} sx={{ position: 'relative', pt: 3 }}>
                {children}
                <IconButton
                    size="small"
                    onClick={() => ctx?.setOpen(false)}
                    sx={{ position: 'absolute', top: 8, right: 8, opacity: 0.7, '&:hover': { opacity: 1 } }}
                >
                    <XIcon size={16} />
                    <span style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0,0,0,0)' }}>Close</span>
                </IconButton>
            </MuiDialogContent>
        </MuiDialog>
    );
}

function DialogHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
    return <div className={cn(className)} style={{ display: 'flex', flexDirection: 'column', gap: 8, textAlign: 'left', marginBottom: 16 }} {...props} />;
}

function DialogFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
    return <div className={cn(className)} style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-end', gap: 8, marginTop: 16 }} {...props} />;
}

function DialogTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
    return <MuiDialogTitle className={cn(className)} sx={{ p: 0, fontSize: '1.125rem', fontWeight: 600, lineHeight: 1 }} {...(props as any)} />;
}

function DialogDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
    return <p className={cn(className)} style={{ fontSize: '0.875rem', color: 'var(--muted-foreground)', margin: 0 }} {...props} />;
}

export {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogOverlay,
    DialogPortal,
    DialogTitle,
    DialogTrigger,
};
