import * as React from 'react';
import { cn } from '@/lib/utils';

const ScrollArea = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
    ({ className, children, ...props }, ref) => (
        <div ref={ref} className={cn('relative overflow-auto', className)} {...props}>
            {children}
        </div>
    ),
);
ScrollArea.displayName = 'ScrollArea';

/** @deprecated No-op stub kept for API compatibility — scrollbar styling is now handled via CSS. */
function ScrollBar() {
    return null;
}

export { ScrollArea, ScrollBar };
