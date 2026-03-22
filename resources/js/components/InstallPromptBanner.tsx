import Box from '@mui/material/Box';
import { Download, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useInstallPrompt } from '@/hooks/useInstallPrompt';

export default function InstallPromptBanner() {
    const { isInstallable, isDismissed, promptInstall, dismiss } = useInstallPrompt();

    if (!isInstallable || isDismissed) {
        return null;
    }

    return (
        <Box
            sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                borderRadius: 2,
                border: '1px solid',
                borderColor: 'color-mix(in srgb, var(--primary) 20%, transparent)',
                bgcolor: 'color-mix(in srgb, var(--primary) 10%, transparent)',
                px: 2,
                py: 1.5,
                fontSize: '0.875rem',
            }}
        >
            <Download style={{ width: 16, height: 16, flexShrink: 0, color: 'var(--primary)' }} />
            <Box component="p" sx={{ flex: 1, color: 'var(--foreground)', m: 0 }}>
                Add Flowki to your home screen for a faster, app-like experience.
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Button
                    size="sm"
                    onClick={() => {
                        promptInstall().catch(() => {});
                    }}
                >
                    Install
                </Button>
                <Button size="icon" variant="ghost" onClick={dismiss} aria-label="Dismiss install prompt">
                    <X style={{ width: 16, height: 16 }} />
                </Button>
            </Box>
        </Box>
    );
}
