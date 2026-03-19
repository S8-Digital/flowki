import Box from '@mui/material/Box';
import * as React from 'react';

const ScrollArea = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
    ({ className, children, ...props }, ref) => (
        <Box ref={ref} className={className} sx={{ position: 'relative', overflow: 'auto' }} {...(props as any)}>
            {children}
        </Box>
    ),
);
ScrollArea.displayName = 'ScrollArea';

/** @deprecated No-op stub kept for API compatibility — scrollbar styling is now handled via CSS. */
function ScrollBar() {
    return null;
}

export { ScrollArea, ScrollBar };
