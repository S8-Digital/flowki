import * as React from 'react';
import { cn } from '@/lib/utils';

function NavigationMenu({ className, children, ...props }: React.HTMLAttributes<HTMLElement>) {
    return <nav className={cn('relative z-10 flex flex-1 items-center justify-start', className)} {...props}>{children}</nav>;
}

function NavigationMenuList({ className, ...props }: React.HTMLAttributes<HTMLUListElement>) {
    return <ul className={cn('group flex flex-1 list-none items-center justify-start gap-1', className)} {...props} />;
}

function NavigationMenuItem({ className, ...props }: React.HTMLAttributes<HTMLLIElement>) {
    return <li className={cn('relative', className)} {...props} />;
}

function NavigationMenuLink({ className, children, active, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement> & { active?: boolean; asChild?: boolean }) {
    return (
        <a
            className={cn(
                'inline-flex h-9 items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50',
                active && 'bg-accent text-accent-foreground',
                className,
            )}
            {...props}
        >
            {children}
        </a>
    );
}

function navigationMenuTriggerStyle() {
    return 'inline-flex h-9 cursor-pointer items-center justify-center rounded-md bg-transparent px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50';
}

function NavigationMenuTrigger({ className, children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
    return (
        <button className={cn(navigationMenuTriggerStyle(), 'gap-1', className)} {...props}>
            {children}
        </button>
    );
}

function NavigationMenuContent({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
    return (
        <div className={cn('absolute left-0 top-full mt-1 min-w-48 rounded-md bg-popover p-1 shadow-lg', className)} {...props}>
            {children}
        </div>
    );
}

export {
    NavigationMenu,
    NavigationMenuContent,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
    NavigationMenuTrigger,
    navigationMenuTriggerStyle,
};
