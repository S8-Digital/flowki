import {
    MenuRoot as MtMenuRoot,
    MenuTrigger as MtMenuTrigger,
    MenuContent as MtMenuContent,
    MenuItem as MtMenuItem,
    MenuContext as MtMenuContext,
} from '@material-tailwind/react';
import { Slot } from '@/lib/slot';
import * as React from 'react';
import { cn } from '@/lib/utils';

function DropdownMenu({ children, ...props }: { children?: React.ReactNode; [key: string]: any }) {
    return <MtMenuRoot {...props}>{children}</MtMenuRoot>;
}

function DropdownMenuTrigger({ asChild, onClick, children, ...props }: { asChild?: boolean; onClick?: React.MouseEventHandler; children?: React.ReactNode; [key: string]: any }) {
    const ctx = React.useContext(MtMenuContext);
    if (asChild) {
        const refProps = ctx?.getReferenceProps ? ctx.getReferenceProps({ onClick, ...props }) : { onClick, ...props };
        return (
            <Slot ref={ctx?.refs?.setReference as any} {...refProps}>
                {children}
            </Slot>
        );
    }
    return (
        <MtMenuTrigger onClick={onClick} {...props}>
            {children}
        </MtMenuTrigger>
    );
}

function DropdownMenuContent({ className, align, side, children, ...props }: React.HTMLAttributes<HTMLDivElement> & { align?: string; sideOffset?: number; side?: string }) {
    return (
        <MtMenuContent className={cn('z-50 min-w-48 bg-popover text-popover-foreground rounded-lg shadow-lg py-1', className)} {...(props as any)}>
            {children}
        </MtMenuContent>
    );
}

function DropdownMenuItem({ className, asChild, children, inset, ...props }: React.HTMLAttributes<HTMLDivElement> & { asChild?: boolean; inset?: boolean }) {
    return (
        <MtMenuItem className={cn('px-2 py-1.5 text-sm cursor-pointer', inset && 'pl-8', className)} {...(props as any)}>
            {children}
        </MtMenuItem>
    );
}

function DropdownMenuLabel({ className, inset, ...props }: React.HTMLAttributes<HTMLDivElement> & { inset?: boolean }) {
    return <div className={cn('px-2 py-1.5 text-sm font-semibold', inset && 'pl-8', className)} {...props} />;
}

function DropdownMenuSeparator({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
    return <div className={cn('my-1 h-px bg-border', className)} {...props} />;
}

function DropdownMenuGroup({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
    return <div {...props}>{children}</div>;
}

function DropdownMenuShortcut({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) {
    return <span className={cn('ml-auto text-xs tracking-widest opacity-60', className)} {...props} />;
}

function DropdownMenuSub({ children }: { children?: React.ReactNode }) {
    return <>{children}</>;
}

function DropdownMenuSubTrigger({ className, inset, children, ...props }: React.HTMLAttributes<HTMLDivElement> & { inset?: boolean }) {
    return <div className={cn('flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm', inset && 'pl-8', className)} {...props}>{children}</div>;
}

function DropdownMenuSubContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
    return <div className={cn('z-50 min-w-32 overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-lg', className)} {...props} />;
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
