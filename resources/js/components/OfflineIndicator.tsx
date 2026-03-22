import Box from '@mui/material/Box';
import { WifiOff } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function OfflineIndicator() {
    const [isOffline, setIsOffline] = useState<boolean>(() => !navigator.onLine);

    useEffect(() => {
        const handleOffline = () => setIsOffline(true);
        const handleOnline = () => setIsOffline(false);

        window.addEventListener('offline', handleOffline);
        window.addEventListener('online', handleOnline);

        return () => {
            window.removeEventListener('offline', handleOffline);
            window.removeEventListener('online', handleOnline);
        };
    }, []);

    if (!isOffline) {
        return null;
    }

    return (
        <Box
            role="alert"
            aria-live="polite"
            sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                borderRadius: 2,
                border: '1px solid',
                borderColor: 'warning.main',
                bgcolor: 'color-mix(in srgb, var(--mui-palette-warning-main) 12%, transparent)',
                px: 2,
                py: 1.5,
                fontSize: '0.875rem',
            }}
        >
            <WifiOff style={{ width: 16, height: 16, flexShrink: 0, color: 'var(--mui-palette-warning-main)' }} />
            <Box component="p" sx={{ flex: 1, color: 'var(--foreground)', m: 0 }}>
                You're offline. Some content may be unavailable or outdated.
            </Box>
        </Box>
    );
}
