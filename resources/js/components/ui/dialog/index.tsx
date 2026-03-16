import {
    DialogRoot as MtDialogRoot,
    DialogTrigger as MtDialogTrigger,
    DialogOverlay as MtDialogOverlay,
    DialogContent as MtDialogContent,
    DialogDismissTrigger as MtDialogDismissTrigger,
} from '@material-tailwind/react';
import { XIcon } from 'lucide-react';
import * as React from 'react';
import { cn } from '@/lib/utils';

function Dialog({ open, onOpenChange, children }: {
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    children?: React.ReactNode;
}) {
    return (
        <MtDialogRoot open={open} onOpenChange={onOpenChange as any}>
            {children}
        </MtDialogRoot>
    );
}

function DialogTrigger({ asChild, children, ...props }: { asChild?: boolean; children?: React.ReactNode; [key: string]: any }) {
    if (asChild && React.isValidElement(children)) {
        return <MtDialogTrigger as={children.type as any} {...(children.props as any)} {...props} />;
    }
    return <MtDialogTrigger {...props}>{children}</MtDialogTrigger>;
}

function DialogPortal({ children }: { children?: React.ReactNode }) {
    return <>{children}</>;
}

function DialogClose({ asChild, children, ...props }: { asChild?: boolean; children?: React.ReactNode; [key: string]: any }) {
    if (asChild && React.isValidElement(children)) {
        return <MtDialogDismissTrigger as={children.type as any} {...(children.props as any)} {...props} />;
    }
    return <MtDialogDismissTrigger {...props}>{children}</MtDialogDismissTrigger>;
}

function DialogOverlay({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
    return <MtDialogOverlay className={cn(className)} {...(props as any)} />;
}

function DialogContent({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
    return (
        <MtDialogContent
            className={cn('bg-background text-foreground rounded-xl p-6 shadow-xl max-w-lg w-full', className)}
            {...(props as any)}
        >
            {children}
            <MtDialogDismissTrigger className="absolute right-4 top-4 rounded-sm opacity-70 transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
                <XIcon className="h-4 w-4" />
                <span className="sr-only">Close</span>
            </MtDialogDismissTrigger>
        </MtDialogContent>
    );
}

function DialogHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
    return <div className={cn('flex flex-col gap-2 text-left mb-4', className)} {...props} />;
}

function DialogFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
    return <div className={cn('flex flex-row justify-end gap-2 mt-4', className)} {...props} />;
}

function DialogTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
    return <h2 className={cn('text-lg font-semibold leading-none', className)} {...props} />;
}

function DialogDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
    return <p className={cn('text-sm text-muted-foreground', className)} {...props} />;
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
