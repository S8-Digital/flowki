import { useAppearance } from '@/hooks/useAppearance';
import Box from '@mui/material/Box';
import { Monitor, Moon, Sun } from 'lucide-react';

const tabs = [
    { value: 'light', Icon: Sun, label: 'Light' },
    { value: 'dark', Icon: Moon, label: 'Dark' },
    { value: 'system', Icon: Monitor, label: 'System' },
] as const;

export default function AppearanceTabs() {
    const { appearance, updateAppearance } = useAppearance();

    return (
        <Box sx={{ display: 'inline-flex', gap: '4px', borderRadius: 2, bgcolor: 'var(--muted)', p: '4px' }}>
            {tabs.map(({ value, Icon, label }) => (
                <Box
                    key={value}
                    component="button"
                    onClick={() => updateAppearance(value)}
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        borderRadius: 1.5,
                        px: '14px',
                        py: '6px',
                        border: 'none',
                        cursor: 'pointer',
                        transition: 'background-color 0.15s, color 0.15s',
                        bgcolor: appearance === value ? 'var(--background)' : 'transparent',
                        color: appearance === value ? 'var(--foreground)' : 'var(--muted-foreground)',
                        boxShadow: appearance === value ? 1 : 'none',
                        '&:hover':
                            appearance !== value
                                ? { bgcolor: 'color-mix(in srgb, var(--muted-foreground) 15%, transparent)', color: 'var(--foreground)' }
                                : {},
                    }}
                >
                    <Icon style={{ marginLeft: -4, width: 16, height: 16 }} />
                    <Box component="span" sx={{ ml: '6px', fontSize: '0.875rem' }}>
                        {label}
                    </Box>
                </Box>
            ))}
        </Box>
    );
}
