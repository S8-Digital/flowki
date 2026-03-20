import MuiButton from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import type { SxProps, Theme } from '@mui/material/styles';
import * as React from 'react';
import { Slot } from '@/lib/slot';
import { cn } from '@/lib/utils';

function mapVariant(variant?: string): 'text' | 'outlined' | 'contained' {
    switch (variant) {
        case 'outline':
            return 'outlined';
        case 'ghost':
        case 'link':
            return 'text';
        default:
            return 'contained';
    }
}

function mapColor(variant?: string): 'primary' | 'secondary' | 'error' | 'inherit' {
    switch (variant) {
        case 'destructive':
            return 'error';
        case 'secondary':
            return 'secondary';
        case 'ghost':
        case 'link':
            return 'inherit';
        default:
            return 'primary';
    }
}

function mapSize(size?: string): 'small' | 'medium' | 'large' {
    switch (size) {
        case 'sm':
            return 'small';
        case 'lg':
            return 'large';
        default:
            return 'medium';
    }
}

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
    size?: 'default' | 'sm' | 'lg' | 'icon';
    asChild?: boolean;
    sx?: SxProps<Theme>;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({ className, variant, size, asChild = false, children, ...props }, ref) => {
    if (asChild) {
        return (
            <Slot ref={ref} className={className} {...props}>
                {children}
            </Slot>
        );
    }

    const isIcon = size === 'icon';

    if (isIcon) {
        return (
            <IconButton
                ref={ref}
                color={mapColor(variant)}
                size="small"
                className={cn(className)}
                {...(props as any)}
            >
                {children}
            </IconButton>
        );
    }

    return (
        <MuiButton
            ref={ref}
            variant={mapVariant(variant)}
            color={mapColor(variant)}
            size={mapSize(size)}
            className={cn(className)}
            {...(props as any)}
        >
            {children}
        </MuiButton>
    );
});
Button.displayName = 'Button';

export { Button };
