import * as React from 'react';
import { cn } from '@/lib/utils';

function Avatar({ className, children, ...props }: React.HTMLAttributes<HTMLSpanElement>) {
    return (
        <span className={cn('relative flex shrink-0 overflow-hidden rounded-full', className)} {...props}>
            {children}
        </span>
    );
}

function AvatarImage({ src, alt, className, ...props }: React.ImgHTMLAttributes<HTMLImageElement> & { src?: string }) {
    if (!src) return null;
    return (
        <img
            src={src}
            alt={alt || ''}
            className={cn('aspect-square h-full w-full object-cover', className)}
            {...props}
        />
    );
}

function AvatarFallback({ className, children, ...props }: React.HTMLAttributes<HTMLSpanElement>) {
    return (
        <span
            className={cn('flex h-full w-full items-center justify-center rounded-full bg-surface text-sm font-medium', className)}
            {...props}
        >
            {children}
        </span>
    );
}

export { Avatar, AvatarFallback, AvatarImage };
