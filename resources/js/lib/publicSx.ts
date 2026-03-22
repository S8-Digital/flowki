import type { SxProps, Theme } from '@mui/material/styles';

/**
 * Brand wordmark text — used in the public-page sticky header across
 * Welcome, Privacy, and Terms. Keeps the logo label consistent.
 */
export const logoWordmarkSx: SxProps<Theme> = {
    fontSize: '1.125rem',
    fontWeight: 700,
    letterSpacing: '-0.02em',
};

/**
 * Muted text link for the page header nav (body2 size).
 */
export const navLinkSx: SxProps<Theme> = {
    fontSize: '0.875rem',
    color: 'text.secondary',
    textDecoration: 'none',
    '&:hover': { color: 'text.primary' },
};

/**
 * Muted text link for page footers (slightly smaller than nav links).
 */
export const footerLinkSx: SxProps<Theme> = {
    fontSize: '0.8125rem',
    color: 'text.secondary',
    textDecoration: 'none',
    '&:hover': { color: 'text.primary' },
};
