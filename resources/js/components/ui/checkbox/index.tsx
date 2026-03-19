import MuiCheckbox from '@mui/material/Checkbox';
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
        <MuiCheckbox
            checked={checked}
            disabled={disabled}
            className={cn(className)}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                onCheckedChange?.(e.target.checked);
            }}
            size="small"
            {...(props as any)}
        />
    );
}

export { Checkbox };
