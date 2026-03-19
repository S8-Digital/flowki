import Box from '@mui/material/Box';
import MuiLink from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import * as React from 'react';

function Breadcrumb({ ...props }: React.HTMLAttributes<HTMLElement>) {
    return <Box component="nav" aria-label="breadcrumb" {...(props as any)} />;
}

function BreadcrumbList({ className, ...props }: React.HTMLAttributes<HTMLOListElement>) {
    return (
        <Box
            component="ol"
            className={className}
            sx={{
                display: 'flex',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: 0.5,
                m: 0,
                p: 0,
                listStyle: 'none',
                fontSize: '0.875rem',
                color: 'text.secondary',
            }}
            {...(props as any)}
        />
    );
}

function BreadcrumbItem({ className, ...props }: React.HTMLAttributes<HTMLLIElement>) {
    return (
        <Box component="li" className={className} sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5 }} {...(props as any)} />
    );
}

function BreadcrumbLink({
    asChild,
    className,
    children,
    href,
    ...props
}: React.AnchorHTMLAttributes<HTMLAnchorElement> & { asChild?: boolean; href?: string }) {
    if (asChild && React.isValidElement(children)) {
        return React.cloneElement(children as React.ReactElement<any>, {
            className,
            ...(children.props as any),
        });
    }
    return (
        <MuiLink
            href={href}
            className={className}
            underline="hover"
            color="inherit"
            sx={{ transition: 'color 0.15s', '&:hover': { color: 'text.primary' } }}
            {...(props as any)}
        >
            {children}
        </MuiLink>
    );
}

function BreadcrumbPage({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) {
    return (
        <Typography
            component="span"
            role="link"
            aria-disabled="true"
            aria-current="page"
            className={className}
            sx={{ fontWeight: 400, color: 'text.primary' }}
            {...(props as any)}
        />
    );
}

function BreadcrumbSeparator({ children, className, ...props }: React.HTMLAttributes<HTMLLIElement>) {
    return (
        <Box
            component="li"
            role="presentation"
            aria-hidden="true"
            className={className}
            sx={{ '& > svg': { width: 14, height: 14 } }}
            {...(props as any)}
        >
            {children ?? (
                <Typography component="span" sx={{ color: 'text.secondary' }}>
                    /
                </Typography>
            )}
        </Box>
    );
}

function BreadcrumbEllipsis({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) {
    return (
        <Box
            component="span"
            className={className}
            sx={{ display: 'flex', height: 36, width: 36, alignItems: 'center', justifyContent: 'center' }}
            {...(props as any)}
        >
            …
        </Box>
    );
}

export { Breadcrumb, BreadcrumbEllipsis, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator };
