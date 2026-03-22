import FormLabel from '@mui/material/FormLabel';
import { styled } from '@mui/material/styles';
import type { SxProps, Theme } from '@mui/material/styles';
import * as React from 'react';
import { cn } from '@/lib/utils';

const StyledLabel = styled(FormLabel)({
    fontSize: '0.875rem',
    fontWeight: 500,
    cursor: 'pointer',
});

function Label({ className, sx, ...props }: React.LabelHTMLAttributes<HTMLLabelElement> & { sx?: SxProps<Theme> }) {
    return <StyledLabel className={cn(className)} sx={sx} {...(props as any)} />;
}

export { Label };
