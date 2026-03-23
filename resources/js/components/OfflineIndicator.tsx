import Box from '@mui/material/Box';
import { alpha, styled } from '@mui/material/styles';
import { WifiOff } from 'lucide-react';
import { useEffect, useState } from 'react';

const OfflineBanner = styled(Box)(({ theme }) => ({
    borderRadius: theme.shape.borderRadius * 2,
    border: `1px solid ${theme.palette.warning.main}`,
    backgroundColor: alpha(theme.palette.warning.main, 0.12),
    fontSize: '0.875rem',
}));

const OfflineText = styled(Box)(({ theme }) => ({
    color: theme.palette.text.primary,
}));

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
        <OfflineBanner role="alert" aria-live="polite" sx={{ display: 'flex', alignItems: 'center', gap: 1.5, px: 2, py: 1.5 }}>
            <WifiOff style={{ width: 16, height: 16, flexShrink: 0, color: 'var(--mui-palette-warning-main)' }} />
            <OfflineText component="p" sx={{ flex: 1, m: 0 }}>
                You're offline. Some content may be unavailable or outdated.
            </OfflineText>
        </OfflineBanner>
    );
}
