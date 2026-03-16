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
        <button
            type="button"
            title={label}
            aria-label={`Switch theme (current: ${label})`}
            className="flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
            onClick={toggle}
        >
            <Icon className="size-4" />
        </button>
    );
}
