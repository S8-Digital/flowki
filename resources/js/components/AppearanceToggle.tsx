import IconButton from '@mui/material/IconButton';
import { Monitor, Moon, Sun } from 'lucide-react';
import { useAppearance } from '@/hooks/useAppearance';

export default function AppearanceToggle() {
    const { appearance, updateAppearance } = useAppearance();
    const cycle = ['light', 'dark', 'system'] as const;
    const Icon = appearance === 'dark' ? Moon : appearance === 'light' ? Sun : Monitor;
    const label = appearance === 'dark' ? 'Dark mode' : appearance === 'light' ? 'Light mode' : 'System theme';

    function toggle() {
        const currentIndex = cycle.indexOf(appearance as (typeof cycle)[number]);
        const next = cycle[(currentIndex + 1) % cycle.length];
        updateAppearance(next);
    }

    return (
        <IconButton title={label} aria-label={`Switch theme (current: ${label})`} onClick={toggle} size="small">
            <Icon size={16} />
        </IconButton>
    );
}
