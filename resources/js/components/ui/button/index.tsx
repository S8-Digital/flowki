import { Slot } from '@/lib/slot';
import { Button as MtButton } from '@material-tailwind/react';
import * as React from 'react';
import { cn } from '@/lib/utils';

function mapVariant(variant?: string): { color: string; variant: string } {
    switch (variant) {
        case 'destructive': return { color: 'error', variant: 'solid' };
        case 'outline': return { color: 'primary', variant: 'outline' };
        case 'secondary': return { color: 'secondary', variant: 'solid' };
        case 'ghost': return { color: 'primary', variant: 'ghost' };
        case 'link': return { color: 'primary', variant: 'ghost' };
        default: return { color: 'primary', variant: 'solid' };
    }
}

function mapSize(size?: string): 'sm' | 'md' | 'lg' {
    switch (size) {
        case 'sm': return 'sm';
        case 'lg': return 'lg';
        case 'icon': return 'sm';
        default: return 'md';
    }
}

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
    size?: 'default' | 'sm' | 'lg' | 'icon';
    asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant, size, asChild = false, children, ...props }, ref) => {
        if (asChild) {
            return (
                <Slot ref={ref} className={className} {...props}>
                    {children}
                </Slot>
            );
        }
        const { color, variant: mtVariant } = mapVariant(variant);
        const mtSize = mapSize(size);
        const isIcon = size === 'icon';
        return (
            <MtButton
                ref={ref as any}
                color={color as any}
                variant={mtVariant as any}
                size={mtSize}
                ripple={false}
                className={cn('cursor-pointer', isIcon && 'p-1.5 aspect-square', className)}
                {...(props as any)}
            >
                {children}
            </MtButton>
        );
    },
);
Button.displayName = 'Button';

export { Button };
