import { Input as MtInput } from '@material-tailwind/react';
import * as React from 'react';
import { cn } from '@/lib/utils';

// Types natively supported by Material Tailwind's InputRoot
const MT_SUPPORTED_TYPES = ['text', 'email', 'password', 'search', 'number', 'tel', 'url', 'hidden'];

// MT-matching outlined styles for native <input> elements of unsupported types
const mtOutlinedBase =
    'w-full select-none rounded-md border border-surface bg-transparent px-2.5 py-2 text-sm text-black shadow-sm ring ring-transparent outline-none transition-all duration-300 ease-in hover:border-primary hover:ring-primary/10 focus:border-primary focus:ring-primary/10 focus:outline-none disabled:pointer-events-none disabled:opacity-50 dark:text-white';

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<'input'>>(({ className, type, ...props }, ref) => {
    if (type && !MT_SUPPORTED_TYPES.includes(type)) {
        return (
            <input
                ref={ref}
                type={type}
                className={cn(
                    mtOutlinedBase,
                    type === 'file' &&
                        'cursor-pointer file:cursor-pointer file:border-0 file:bg-transparent file:text-sm file:font-medium',
                    className,
                )}
                {...props}
            />
        );
    }

    return <MtInput ref={ref} type={type} className={cn(className)} {...(props as any)} />;
});
Input.displayName = 'Input';

export { Input };
