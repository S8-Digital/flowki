import { Checkbox as MtCheckbox } from '@material-tailwind/react';
import * as React from 'react';
import { cn } from '@/lib/utils';

function Checkbox({
    className,
    checked,
    onCheckedChange,
    disabled,
    ...props
}: {
    className?: string;
    checked?: boolean;
    onCheckedChange?: (checked: boolean) => void;
    disabled?: boolean;
    id?: string;
    name?: string;
    tabIndex?: number;
}) {
    return (
        <MtCheckbox
            checked={checked}
            disabled={disabled}
            className={cn(className)}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                onCheckedChange?.(e.target.checked);
            }}
            {...(props as any)}
        >
            <MtCheckbox.Indicator />
        </MtCheckbox>
    );
}

export { Checkbox };
