import OutlinedInput from '@mui/material/OutlinedInput';
import * as React from 'react';

/**
 * A datetime-local input backed by MUI OutlinedInput.
 * The underlying native input preserves full datetime-local browser UI.
 */
function DateTimeInput({ className, ...props }: React.ComponentProps<'input'>) {
    return (
        <OutlinedInput
            type="datetime-local"
            size="small"
            fullWidth
            inputProps={{ className, ...props }}
            sx={{ colorScheme: 'light', '& input::-webkit-calendar-picker-indicator': { cursor: 'pointer' } }}
        />
    );
}

export { DateTimeInput };
