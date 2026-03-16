import { CheckboxRoot as MtCheckboxRoot, CheckboxIndicator as MtCheckboxIndicator } from '@material-tailwind/react';
import * as React from 'react';
import { cn } from '@/lib/utils';

function Checkbox({ className, checked, onCheckedChange, disabled, ...props }: {
    className?: string;
    checked?: boolean;
    onCheckedChange?: (checked: boolean) => void;
    disabled?: boolean;
    id?: string;
    name?: string;
    tabIndex?: number;
}) {
    return (
        <MtCheckboxRoot
            checked={checked}
            onCheckedChange={onCheckedChange}
            disabled={disabled}
            className={cn(className)}
            {...(props as any)}
        >
            <MtCheckboxIndicator />
        </MtCheckboxRoot>
    );
}

export { Checkbox };
