import Box from '@mui/material/Box';
import { useMemo } from 'react';

export default function PlaceholderPattern() {
    const patternId = useMemo(() => `pattern-${Math.random().toString(36).substring(2, 9)}`, []);

    return (
        <Box
            component="svg"
            sx={(theme) => ({
                position: 'absolute',
                inset: 0,
                width: '100%',
                height: '100%',
                stroke: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.2)' : 'rgba(10,10,10,0.2)',
            })}
            fill="none"
        >
            <defs>
                <pattern id={patternId} x="0" y="0" width="8" height="8" patternUnits="userSpaceOnUse">
                    <path d="M-1 5L5 -1M3 9L8.5 3.5" strokeWidth="0.5" />
                </pattern>
            </defs>
            <rect stroke="none" fill={`url(#${patternId})`} width="100%" height="100%" />
        </Box>
    );
}
