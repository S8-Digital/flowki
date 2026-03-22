import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider } from '@mui/material/styles';
import { useEffect, useMemo, useState } from 'react';
import type { PropsWithChildren } from 'react';
import { createAppTheme } from '@/theme';

/**
 * Watches the `.dark` CSS class on <html> (set by useAppearance / initializeTheme)
 * and re-renders children with the appropriate MUI theme.
 *
 * This ensures MUI component colours (backgrounds, text, borders) properly switch
 * when the user toggles the appearance via AppearanceToggle.
 */
export default function ThemeWrapper({ children }: PropsWithChildren) {
    const [isDark, setIsDark] = useState<boolean>(() => {
        if (typeof document === 'undefined') {
            return false;
        }

        return document.documentElement.classList.contains('dark');
    });

    useEffect(() => {
        const observer = new MutationObserver(() => {
            setIsDark(document.documentElement.classList.contains('dark'));
        });

        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ['class'],
        });

        return () => observer.disconnect();
    }, []);

    const theme = useMemo(() => createAppTheme(isDark ? 'dark' : 'light'), [isDark]);

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            {children}
        </ThemeProvider>
    );
}
