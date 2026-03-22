import Box from '@mui/material/Box';
import { alpha, styled } from '@mui/material/styles';
import { Monitor, Moon, Sun } from 'lucide-react';
import { useAppearance } from '@/hooks/useAppearance';

const tabs = [
    { value: 'light', Icon: Sun, label: 'Light' },
    { value: 'dark', Icon: Moon, label: 'Dark' },
    { value: 'system', Icon: Monitor, label: 'System' },
] as const;

const TabsContainer = styled(Box)(({ theme }) => ({
    borderRadius: theme.shape.borderRadius * 2,
    backgroundColor: theme.palette.action.hover,
}));

const TabButton = styled(Box, {
    shouldForwardProp: (prop) => prop !== 'active',
})<{ active?: boolean }>(({ theme, active }) => ({
    display: 'flex',
    alignItems: 'center',
    borderRadius: theme.shape.borderRadius * 1.5,
    border: 'none',
    cursor: 'pointer',
    transition: 'background-color 0.15s, color 0.15s',
    backgroundColor: active ? theme.palette.background.default : 'transparent',
    color: active ? theme.palette.text.primary : theme.palette.text.secondary,
    boxShadow: active ? theme.shadows[1] : 'none',
    '&:hover': !active
        ? {
              backgroundColor: alpha(theme.palette.text.secondary, 0.15),
              color: theme.palette.text.primary,
          }
        : undefined,
}));

const TabLabel = styled(Box)({
    fontSize: '0.875rem',
});

export default function AppearanceTabs() {
    const { appearance, updateAppearance } = useAppearance();

    return (
        <TabsContainer sx={{ display: 'inline-flex', gap: 0.5, p: '4px' }}>
            {tabs.map(({ value, Icon, label }) => (
                <TabButton
                    key={value}
                    component="button"
                    active={appearance === value}
                    onClick={() => updateAppearance(value)}
                    sx={{ px: '14px', py: '6px' }}
                >
                    <Icon style={{ marginLeft: -4, width: 16, height: 16 }} />
                    <TabLabel sx={{ ml: '6px' }}>{label}</TabLabel>
                </TabButton>
            ))}
        </TabsContainer>
    );
}
