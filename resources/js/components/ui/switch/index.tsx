import MuiSwitch from '@mui/material/Switch';
import * as React from 'react';

const Switch = React.forwardRef<
    HTMLButtonElement,
    {
        checked?: boolean;
        onCheckedChange?: (checked: boolean) => void;
        id?: string;
        disabled?: boolean;
        className?: string;
    }
>(({ checked, onCheckedChange, disabled, id, ...props }, ref) => (
    <MuiSwitch
        checked={checked}
        disabled={disabled}
        id={id}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => onCheckedChange?.(e.target.checked)}
        size="small"
        {...(props as any)}
    />
));
Switch.displayName = 'Switch';

export { Switch };
