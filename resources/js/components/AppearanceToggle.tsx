import { Button } from '@material-tailwind/react';
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
        <Button
            as="button"
            variant="ghost"
            size="sm"
            color="secondary"
            title={label}
            aria-label={`Switch theme (current: ${label})`}
            onClick={toggle}
            className="flex size-8 items-center justify-center p-1.5"
            ripple={false}
        >
            <Icon className="size-4" />
        </Button>
    );
}
