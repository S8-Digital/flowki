import MuiDivider from '@mui/material/Divider';
import * as React from 'react';

function Separator({
    className,
    orientation = 'horizontal',
    decorative = true,
    ...props
}: React.HTMLAttributes<HTMLDivElement> & {
    orientation?: 'horizontal' | 'vertical';
    decorative?: boolean;
}) {
    return (
        <MuiDivider
            orientation={orientation}
            role={decorative ? 'none' : 'separator'}
            className={className}
            sx={orientation === 'vertical' ? { height: '100%', alignSelf: 'stretch' } : undefined}
            {...(props as any)}
        />
    );
}

export { Separator };
