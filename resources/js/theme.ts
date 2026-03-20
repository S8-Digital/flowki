import { createTheme } from '@mui/material/styles';

/**
 * Flowki MUI theme — preserving the existing Curious Blue / Sage Green palette,
 * Plus Jakarta Sans typography, and the soft modern spacing from the previous design.
 */
const theme = createTheme({
    palette: {
        primary: {
            main: 'hsl(207, 55%, 44%)', // Curious Blue
            light: 'hsl(207, 55%, 55%)',
            dark: 'hsl(207, 55%, 33%)',
            contrastText: '#ffffff',
        },
        secondary: {
            main: 'hsl(210, 14%, 93%)',
            light: 'hsl(210, 14%, 97%)',
            dark: 'hsl(210, 14%, 82%)',
            contrastText: 'hsl(220, 12%, 18%)',
        },
        error: {
            main: 'hsl(4, 72%, 56%)',
            contrastText: '#ffffff',
        },
        success: {
            main: 'hsl(142, 42%, 35%)',
            contrastText: '#ffffff',
        },
        warning: {
            main: 'hsl(38, 68%, 45%)',
            contrastText: '#ffffff',
        },
        info: {
            main: 'hsl(207, 55%, 44%)',
            contrastText: '#ffffff',
        },
        background: {
            default: 'hsl(0, 0%, 100%)',
            paper: 'hsl(0, 0%, 100%)',
        },
        text: {
            primary: 'hsl(220, 15%, 12%)',
            secondary: 'hsl(220, 8%, 46%)',
        },
        divider: 'hsl(214, 13%, 90%)',
    },
    typography: {
        fontFamily:
            '"Plus Jakarta Sans", ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"',
        fontWeightRegular: 400,
        fontWeightMedium: 500,
        fontWeightBold: 700,
    },
    shape: {
        borderRadius: 8,
    },
    spacing: 8,
    components: {
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
            defaultProps: {
                disableRipple: true,
                disableElevation: true,
            },
            styleOverrides: {
                root: {
                    textTransform: 'none',
                    fontWeight: 500,
                },
                // Outlined variant hover
                outlined: {
                    '&:hover': {
                        backgroundColor: 'hsl(207, 55%, 44%)',
                        color: '#ffffff',
                        borderColor: 'hsl(207, 55%, 44%)',
                    },
                },
                // Text variant hover
                text: {
                    '&:hover': {
                        backgroundColor: 'hsl(207, 55%, 93%)', // light blue tint
                    },
                },
                // Contained is fine by default but you can darken it explicitly
                contained: {
                    '&:hover': {
                        backgroundColor: 'hsl(207, 55%, 33%)', // primary.dark
                    },
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
    },
});

export default theme;
