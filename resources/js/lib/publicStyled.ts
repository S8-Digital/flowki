import Box from '@mui/material/Box';
import { styled } from '@mui/material/styles';

/** Outer page wrapper — sets page background and default text colour. */
export const PageRoot = styled(Box)(({ theme }) => ({
    backgroundColor: theme.palette.background.default,
    color: theme.palette.text.primary,
}));

/** Logo/wordmark link — resets anchor decoration so it looks like plain inline content. */
export const LogoLink = styled(Box)({
    textDecoration: 'none',
    color: 'inherit',
});

/** Footer wrapper — paper background with a top border separator. */
export const FooterBox = styled(Box)(({ theme }) => ({
    backgroundColor: theme.palette.background.paper,
    borderTop: `1px solid ${theme.palette.divider}`,
}));
