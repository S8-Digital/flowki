import Box from '@mui/material/Box';
import MuiTooltip from '@mui/material/Tooltip';
import * as React from 'react';
import { Slot } from '@/lib/slot';

function TooltipProvider({ children }: { children?: React.ReactNode; delayDuration?: number }) {
    return <>{children}</>;
}

function Tooltip({ children, ...props }: { children?: React.ReactNode; [key: string]: any }) {
    let tooltipTitle: React.ReactNode = '';
    let triggerNode: React.ReactNode = null;

    React.Children.forEach(children, (child) => {
        if (!React.isValidElement(child)) return;
        const displayName = (child.type as any).displayName;
        if (displayName === 'TooltipContent') {
            tooltipTitle = (child.props as any).children ?? '';
        } else {
            triggerNode = child;
        }
    });

    return (
        <MuiTooltip title={tooltipTitle} {...props}>
            <Box component="span" sx={{ display: 'contents' }}>{triggerNode}</Box>
        </MuiTooltip>
    );
}

function TooltipTrigger({ asChild, children, ...props }: { asChild?: boolean; children?: React.ReactNode; [key: string]: any }) {
    if (asChild) {
        return <Slot {...props}>{children}</Slot>;
    }
    return <Box component="span" {...(props as any)}>{children}</Box>;
}

function TooltipContent({
    children,
    sideOffset: _sideOffset,
    className: _className,
    ...props
}: React.HTMLAttributes<HTMLDivElement> & { sideOffset?: number }) {
    // Content is extracted by parent Tooltip via displayName; this renders nothing directly
    return null;
}
TooltipContent.displayName = 'TooltipContent';

export { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger };
