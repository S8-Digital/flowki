import {
    DrawerRoot as MtDrawerRoot,
    DrawerTrigger as MtDrawerTrigger,
    DrawerOverlay as MtDrawerOverlay,
    DrawerPanel as MtDrawerPanel,
    DrawerDismissTrigger as MtDrawerDismissTrigger,
} from '@material-tailwind/react';
import { XIcon } from 'lucide-react';
import * as React from 'react';
import { cn } from '@/lib/utils';

function Sheet({ open, onOpenChange, children }: { open?: boolean; onOpenChange?: (open: boolean) => void; children?: React.ReactNode }) {
    return <MtDrawerRoot open={open} onOpenChange={onOpenChange as any}>{children}</MtDrawerRoot>;
}

function SheetTrigger({ asChild, children, ...props }: { asChild?: boolean; children?: React.ReactNode; [key: string]: any }) {
    if (asChild && React.isValidElement(children)) {
        return <MtDrawerTrigger as={children.type as any} {...(children.props as any)} {...props} />;
    }
    return <MtDrawerTrigger {...props}>{children}</MtDrawerTrigger>;
}

function SheetClose({ asChild, children, ...props }: { asChild?: boolean; children?: React.ReactNode; [key: string]: any }) {
    if (asChild && React.isValidElement(children)) {
        return <MtDrawerDismissTrigger as={children.type as any} {...(children.props as any)} {...props} />;
    }
    return <MtDrawerDismissTrigger {...props}>{children}</MtDrawerDismissTrigger>;
}

function SheetOverlay({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
    return <MtDrawerOverlay className={cn(className)} {...(props as any)} />;
}

const SIDE_MAP: Record<string, 'left' | 'right' | 'top' | 'bottom'> = {
    left: 'left',
    right: 'right',
    top: 'top',
    bottom: 'bottom',
};

function SheetContent({ className, children, side = 'right', ...props }: React.HTMLAttributes<HTMLDivElement> & { side?: string }) {
    return (
        <MtDrawerPanel
            placement={SIDE_MAP[side] || 'right'}
            className={cn('bg-background text-foreground p-6', className)}
            {...(props as any)}
        >
            {children}
            <MtDrawerDismissTrigger className="absolute right-4 top-4 rounded-sm opacity-70 transition-opacity hover:opacity-100 focus:outline-none">
                <XIcon className="h-4 w-4" />
                <span className="sr-only">Close</span>
            </MtDrawerDismissTrigger>
        </MtDrawerPanel>
    );
}

function SheetHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
    return <div className={cn('flex flex-col gap-1.5 text-left mb-4', className)} {...props} />;
}

function SheetFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
    return <div className={cn('flex flex-col-reverse gap-2 sm:flex-row sm:justify-end mt-4', className)} {...props} />;
}

function SheetTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
    return <h2 className={cn('text-lg font-semibold', className)} {...props} />;
}

function SheetDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
    return <p className={cn('text-sm text-muted-foreground', className)} {...props} />;
}

export { Sheet, SheetClose, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetOverlay, SheetTitle, SheetTrigger };
