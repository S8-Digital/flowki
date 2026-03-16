import {
    Select as MtSelectRoot,
    SelectTrigger as MtSelectTrigger,
    SelectList as MtSelectList,
    SelectOption as MtSelectOption,
} from '@material-tailwind/react';
import * as React from 'react';
import { cn } from '@/lib/utils';

function Select({ value, onValueChange, children, ...props }: {
    value?: string;
    onValueChange?: (value: string) => void;
    children?: React.ReactNode;
    [key: string]: any;
}) {
    return (
        <MtSelectRoot value={value} onValueChange={onValueChange} {...props}>
            {children}
        </MtSelectRoot>
    );
}

function SelectTrigger({ className, children, ...props }: React.HTMLAttributes<HTMLButtonElement>) {
    return (
        <MtSelectTrigger className={cn('w-full', className)} {...(props as any)}>
            {children}
        </MtSelectTrigger>
    );
}

function SelectValue({ placeholder }: { placeholder?: string }) {
    return <span data-slot="placeholder" className="text-foreground/60">{placeholder}</span>;
}

function SelectContent({ children, className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
    return (
        <MtSelectList className={cn(className)} {...(props as any)}>
            {children}
        </MtSelectList>
    );
}

function SelectItem({ value, children, className, ...props }: { value: string; children?: React.ReactNode; className?: string; [key: string]: any }) {
    return (
        <MtSelectOption value={value} className={cn(className)} {...props}>
            {children}
        </MtSelectOption>
    );
}

function SelectGroup({ children }: { children?: React.ReactNode }) {
    return <>{children}</>;
}

function SelectLabel({ className, children }: { className?: string; children?: React.ReactNode }) {
    return <div className={cn('px-2 py-1.5 text-xs font-semibold text-muted-foreground', className)}>{children}</div>;
}

function SelectSeparator({ className }: { className?: string }) {
    return <div className={cn('my-1 h-px bg-border', className)} />;
}

export { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectSeparator, SelectTrigger, SelectValue };
