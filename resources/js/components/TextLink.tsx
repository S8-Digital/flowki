import type { InertiaLinkProps } from '@inertiajs/react';
import { Link } from '@inertiajs/react';

type TextLinkProps = InertiaLinkProps & {
    tabIndex?: number;
};

export default function TextLink({ href, children, ...props }: TextLinkProps) {
    return (
        <Link
            href={href}
            className="text-foreground underline decoration-neutral-300 underline-offset-4 transition-colors duration-300 ease-out hover:decoration-current! dark:decoration-neutral-500"
            {...props}
        >
            {children}
        </Link>
    );
}
