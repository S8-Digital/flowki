import { createTheme } from '@mui/material/styles';
import type { Theme } from '@mui/material/styles';

/**
 * Flowki MUI theme — preserving the existing Curious Blue / Sage Green palette,
 * Plus Jakarta Sans typography, and the soft modern spacing from the previous design.
 *
 * Call createAppTheme('light') or createAppTheme('dark') to get the correct theme
 * for the current color scheme.
 */

const sharedTypography = {
    fontFamily:
        '"Plus Jakarta Sans", ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"',
    fontWeightRegular: 400,
    fontWeightMedium: 500,
    fontWeightBold: 700,
    // Heading styles — baked in so components don't repeat these values individually.
    h1: { fontWeight: 800, letterSpacing: '-0.04em', lineHeight: 1.1 },
    h2: { fontWeight: 800, letterSpacing: '-0.03em' },
    h3: { fontWeight: 800, letterSpacing: '-0.03em' },
    h4: { fontWeight: 800, letterSpacing: '-0.03em' },
    h6: { fontWeight: 700 },
    overline: { fontWeight: 700, letterSpacing: '0.12em' },
    body1: { lineHeight: 1.6 },
    body2: { lineHeight: 1.6 },
};

const sharedShape = { borderRadius: 8 };
const sharedSpacing = 8;

const sharedComponents = {
    MuiCssBaseline: {
        styleOverrides: {
            body: {
                fontFeatureSettings: '"rlig" 1, "calt" 1',
                WebkitFontSmoothing: 'antialiased',
                MozOsxFontSmoothing: 'grayscale',
            },
            a: {
                textDecoration: 'none',
            },
            '::-webkit-scrollbar': {
                width: 6,
                height: 6,
            },
            '::-webkit-scrollbar-track': {
                background: 'transparent',
            },
            '::-webkit-scrollbar-thumb': {
                background: 'var(--color-warm-200)',
                borderRadius: 999,
            },
            '::-webkit-scrollbar-thumb:hover': {
                background: 'var(--color-warm-300)',
            },
        },
    },
    MuiButton: {
        defaultProps: {},
        styleOverrides: {
            root: {
                textTransform: 'none',
                fontWeight: 700,
                borderRadius: 32,
            },
        },
    },
    MuiOutlinedInput: {
        styleOverrides: {
            root: {
                borderRadius: 8,
            },
        },
    },
    MuiPaper: {
        styleOverrides: {
            root: {
                backgroundImage: 'none',
            },
        },
    },
};

export function createAppTheme(mode: 'light' | 'dark'): Theme {
    const isDark = mode === 'dark';

    return createTheme({
        palette: {
            mode,
            primary: {
                // Light: Curious Blue; Dark: lighter blue for legibility on dark bg
                main: isDark ? 'hsl(207, 60%, 68%)' : 'hsl(207, 55%, 44%)',
                light: isDark ? 'hsl(207, 60%, 78%)' : 'hsl(207, 55%, 55%)',
                dark: isDark ? 'hsl(207, 55%, 50%)' : 'hsl(207, 55%, 33%)',
                contrastText: isDark ? 'hsl(207, 50%, 14%)' : '#ffffff',
            },
            secondary: {
                main: isDark ? 'hsl(40, 5%, 18%)' : 'hsl(210, 14%, 93%)',
                light: isDark ? 'hsl(40, 5%, 24%)' : 'hsl(210, 14%, 97%)',
                dark: isDark ? 'hsl(40, 5%, 13%)' : 'hsl(210, 14%, 82%)',
                contrastText: isDark ? 'hsl(40, 10%, 90%)' : 'hsl(220, 12%, 18%)',
            },
            error: {
                main: isDark ? 'hsl(4, 72%, 58%)' : 'hsl(4, 72%, 56%)',
                contrastText: '#ffffff',
            },
            success: {
                main: 'hsl(142, 42%, 35%)',
                contrastText: '#ffffff',
            },
            warning: {
                main: isDark ? 'hsl(38, 68%, 50%)' : 'hsl(38, 68%, 45%)',
                contrastText: '#ffffff',
            },
            info: {
                main: isDark ? 'hsl(207, 60%, 68%)' : 'hsl(207, 55%, 44%)',
                contrastText: isDark ? 'hsl(207, 50%, 14%)' : '#ffffff',
            },
            background: {
                default: isDark ? 'hsl(40, 6%, 10%)' : 'hsl(0, 0%, 100%)',
                paper: isDark ? 'hsl(40, 6%, 13%)' : 'hsl(0, 0%, 100%)',
                subtle: isDark ? 'hsl(207, 40%, 12%)' : 'hsl(207, 55%, 96%)',
            },
            text: {
                primary: isDark ? 'hsl(40, 12%, 94%)' : 'hsl(220, 15%, 12%)',
                secondary: isDark ? 'hsl(40, 6%, 62%)' : 'hsl(220, 8%, 46%)',
            },
            divider: isDark ? 'hsl(40, 5%, 20%)' : 'hsl(214, 13%, 90%)',
        },
        typography: sharedTypography,
        shape: sharedShape,
        spacing: sharedSpacing,
        components: sharedComponents,
    });
}

// Default export for backward compatibility (SSR / initial render)
const theme = createAppTheme('light');
export default theme;
