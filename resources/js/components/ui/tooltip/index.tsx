import { TooltipRoot as MtTooltipRoot, TooltipTrigger as MtTooltipTrigger, TooltipContent as MtTooltipContent } from '@material-tailwind/react';
import * as React from 'react';
import { cn } from '@/lib/utils';

function TooltipProvider({ children }: { children?: React.ReactNode; delayDuration?: number }) {
    return <>{children}</>;
}

function Tooltip({ children, ...props }: { children?: React.ReactNode; [key: string]: any }) {
    return <MtTooltipRoot {...props}>{children}</MtTooltipRoot>;
}

function TooltipTrigger({ asChild, children, ...props }: { asChild?: boolean; children?: React.ReactNode; [key: string]: any }) {
    if (asChild && React.isValidElement(children)) {
        return <MtTooltipTrigger as={children.type as any} {...(children.props as any)} {...props} />;
    }
    return <MtTooltipTrigger {...props}>{children}</MtTooltipTrigger>;
}

function TooltipContent({ className, children, sideOffset, ...props }: React.HTMLAttributes<HTMLDivElement> & { sideOffset?: number }) {
    return (
        <MtTooltipContent className={cn('bg-primary text-primary-foreground px-3 py-1.5 text-xs rounded-md', className)} {...(props as any)}>
            {children}
        </MtTooltipContent>
    );
}

export { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger };
