import { InputRoot } from '@material-tailwind/react';
import * as React from 'react';
import { cn } from '@/lib/utils';

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<'input'>>(
    ({ className, ...props }, ref) => {
        return (
            <InputRoot
                ref={ref}
                className={cn(className)}
                {...(props as any)}
            />
        );
    },
);
Input.displayName = 'Input';

export { Input };
