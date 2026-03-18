import type { InertiaLinkProps } from '@inertiajs/react';
import { Link } from '@inertiajs/react';
import MuiLink from '@mui/material/Link';

type TextLinkProps = InertiaLinkProps & {
    tabIndex?: number;
};

export default function TextLink({ href, children, ...props }: TextLinkProps) {
    return (
        <MuiLink
            component={Link}
            href={href}
            sx={{
                color: 'var(--foreground)',
                textDecoration: 'underline',
                textDecorationColor: '#d4d4d4',
                textUnderlineOffset: '4px',
                transition: 'color 300ms ease-out, text-decoration-color 300ms ease-out',
                '&:hover': {
                    textDecorationColor: 'currentColor',
                },
            }}
            {...props}
        >
            {children}
        </MuiLink>
    );
}
