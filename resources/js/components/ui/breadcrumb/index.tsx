import * as React from 'react';
import { cn } from '@/lib/utils';

function Breadcrumb({ ...props }: React.HTMLAttributes<HTMLElement>) {
    return <nav aria-label="breadcrumb" {...props} />;
}

function BreadcrumbList({ className, ...props }: React.HTMLAttributes<HTMLOListElement>) {
    return <ol className={cn('flex items-center gap-1.5 text-sm text-muted-foreground flex-wrap', className)} {...props} />;
}

function BreadcrumbItem({ className, ...props }: React.HTMLAttributes<HTMLLIElement>) {
    return <li className={cn('inline-flex items-center gap-1.5', className)} {...props} />;
}

function BreadcrumbLink({ asChild, className, children, href, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement> & { asChild?: boolean; href?: string }) {
    if (asChild && React.isValidElement(children)) {
        return React.cloneElement(children as React.ReactElement<any>, {
            className: cn('transition-colors hover:text-foreground', (children.props as any).className),
        });
    }
    return (
        <a href={href} className={cn('transition-colors hover:text-foreground', className)} {...props}>
            {children}
        </a>
    );
}

function BreadcrumbPage({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) {
    return <span role="link" aria-disabled="true" aria-current="page" className={cn('font-normal text-foreground', className)} {...props} />;
}

function BreadcrumbSeparator({ children, className, ...props }: React.HTMLAttributes<HTMLLIElement>) {
    return (
        <li role="presentation" aria-hidden="true" className={cn('[&>svg]:size-3.5', className)} {...props}>
            {children ?? <span className="text-muted-foreground">/</span>}
        </li>
    );
}

function BreadcrumbEllipsis({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) {
    return <span className={cn('flex h-9 w-9 items-center justify-center', className)} {...props}>…</span>;
}

export { Breadcrumb, BreadcrumbEllipsis, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator };
