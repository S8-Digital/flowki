import Box from '@mui/material/Box';
import MuiDialog from '@mui/material/Dialog';
import MuiDialogContent from '@mui/material/DialogContent';
import MuiDialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import { styled } from '@mui/material/styles';
import type { SxProps, Theme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import { XIcon } from 'lucide-react';
import * as React from 'react';
import { Slot } from '@/lib/slot';
import { cn } from '@/lib/utils';

const StyledCloseButton = styled(IconButton)({
    opacity: 0.7,
    '&:hover': { opacity: 1 },
});

const StyledDialogHeader = styled(Box)({
    textAlign: 'left' as const,
});

const StyledDialogTitle = styled(MuiDialogTitle)({
    fontSize: '1.125rem',
    fontWeight: 600,
    lineHeight: 1,
});

const StyledDialogDescription = styled(Typography)(({ theme }) => ({
    color: theme.palette.text.secondary,
}));

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
        <Box component="button" type="button" onClick={handleClick} {...(props as any)}>
            {children}
        </Box>
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
        <Box component="button" type="button" onClick={handleClick} {...(props as any)}>
            {children}
        </Box>
    );
}

function DialogOverlay({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
    return <Box className={cn(className)} {...(props as any)} />;
}

function DialogContent({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement> & { sx?: SxProps<Theme> }) {
    const ctx = React.useContext(DialogContext);
    return (
        <MuiDialog open={ctx?.open ?? false} onClose={() => ctx?.setOpen(false)} maxWidth="sm" fullWidth {...(props as any)}>
            <MuiDialogContent className={cn(className)} sx={{ position: 'relative', pt: 3 }}>
                {children}
                <StyledCloseButton
                    size="small"
                    onClick={() => ctx?.setOpen(false)}
                    sx={{ position: 'absolute', top: 5, right: 5 }}
                >
                    <XIcon size={16} />
                    <Box
                        component="span"
                        sx={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0,0,0,0)' }}
                    >
                        Close
                    </Box>
                </StyledCloseButton>
            </MuiDialogContent>
        </MuiDialog>
    );
}

function DialogHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
    return (
        <StyledDialogHeader
            className={cn(className)}
            sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 2 }}
            {...(props as any)}
        />
    );
}

function DialogFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
    return (
        <Box
            className={cn(className)}
            sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-end', gap: 1, mt: 2 }}
            {...(props as any)}
        />
    );
}

function DialogTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
    return <StyledDialogTitle className={cn(className)} sx={{ p: 0 }} {...(props as any)} />;
}

function DialogDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
    return (
        <StyledDialogDescription
            variant="body2"
            component="p"
            className={cn(className)}
            sx={{ m: 0 }}
            {...(props as any)}
        />
    );
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
