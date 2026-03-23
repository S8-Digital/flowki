import type { InertiaLinkProps } from '@inertiajs/react';
import { Link } from '@inertiajs/react';
import MuiLink from '@mui/material/Link';
import { styled } from '@mui/material/styles';

type TextLinkProps = InertiaLinkProps & {
    tabIndex?: number;
};

const StyledLink = styled(MuiLink)(({ theme }) => ({
    color: theme.palette.text.primary,
    textDecoration: 'underline',
    textDecorationColor: theme.palette.divider,
    textUnderlineOffset: '4px',
    transition: 'color 300ms ease-out, text-decoration-color 300ms ease-out',
    '&:hover': {
        textDecorationColor: 'currentColor',
    },
}));

export default function TextLink({ href, children, ...props }: TextLinkProps) {
    return (
        <StyledLink component={Link} href={href} {...props}>
            {children}
        </StyledLink>
    );
}
