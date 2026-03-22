import Box from '@mui/material/Box';
import { alpha, styled } from '@mui/material/styles';
import { Download, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useInstallPrompt } from '@/hooks/useInstallPrompt';

const BannerContainer = styled(Box)(({ theme }) => ({
    borderRadius: theme.shape.borderRadius * 2,
    border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
    backgroundColor: alpha(theme.palette.primary.main, 0.1),
    fontSize: '0.875rem',
}));

const BannerText = styled(Box)(({ theme }) => ({
    color: theme.palette.text.primary,
}));

export default function InstallPromptBanner() {
    const { isInstallable, isDismissed, promptInstall, dismiss } = useInstallPrompt();

    if (!isInstallable || isDismissed) {
        return null;
    }

    return (
        <BannerContainer sx={{ display: 'flex', alignItems: 'center', gap: 1.5, px: 2, py: 1.5 }}>
            <Download style={{ width: 16, height: 16, flexShrink: 0, color: 'var(--primary)' }} />
            <BannerText component="p" sx={{ flex: 1, m: 0 }}>
                Add Flowki to your home screen for a faster, app-like experience.
            </BannerText>
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
        </BannerContainer>
    );
}
