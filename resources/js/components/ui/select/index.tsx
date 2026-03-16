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
    // MT SelectTrigger expects children to be a render function ({ value, element }) => ReactNode,
    // but our API passes <SelectValue placeholder="..."> as children.
    // Extract placeholder from the SelectValue child and pass it as a prop instead.
    let placeholder: string | undefined;
    React.Children.forEach(children, (child) => {
        if (React.isValidElement(child) && (child.props as any).placeholder) {
            placeholder = (child.props as any).placeholder as string;
        }
    });
    return (
        <MtSelectTrigger
            className={cn('w-full cursor-pointer', className)}
            placeholder={placeholder}
            {...(props as any)}
        />
    );
}

function SelectValue({ placeholder }: { placeholder?: string }) {
    // Rendered as placeholder text via the parent SelectTrigger
    return null;
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
