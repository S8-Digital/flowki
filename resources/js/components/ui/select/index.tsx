import Box from '@mui/material/Box';
import MuiDivider from '@mui/material/Divider';
import FormControl from '@mui/material/FormControl';
import MenuItem from '@mui/material/MenuItem';
import MuiSelect, { type SelectChangeEvent } from '@mui/material/Select';
import type { SxProps, Theme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import * as React from 'react';
import { cn } from '@/lib/utils';

/** Collect all <SelectItem> elements recursively from a React node tree */
function collectSelectItems(children: React.ReactNode): React.ReactElement<SelectItemProps>[] {
    const items: React.ReactElement<SelectItemProps>[] = [];
    React.Children.forEach(children, (child) => {
        if (!React.isValidElement(child)) return;
        const el = child as React.ReactElement<any>;
        if (el.type === SelectItem) {
            items.push(el as React.ReactElement<SelectItemProps>);
        } else if ((el.props as any).children) {
            items.push(...collectSelectItems((el.props as any).children));
        }
    });
    return items;
}

function extractPlaceholder(children: React.ReactNode): string {
    let placeholder = '';
    React.Children.forEach(children, (child) => {
        if (!React.isValidElement(child)) return;
        const el = child as React.ReactElement<any>;
        if (el.type === SelectValue && (el.props as any).placeholder) {
            placeholder = (el.props as any).placeholder;
        } else if ((el.props as any).children) {
            const found = extractPlaceholder((el.props as any).children);
            if (found) placeholder = found;
        }
    });
    return placeholder;
}

interface SelectItemProps {
    value: string;
    children?: React.ReactNode;
    className?: string;
}

/** Extract props from a <SelectTrigger> child (aria-label, className, etc.) */
function extractTriggerProps(children: React.ReactNode): Record<string, any> {
    let triggerProps: Record<string, any> = {};
    React.Children.forEach(children, (child) => {
        if (!React.isValidElement(child)) return;
        const el = child as React.ReactElement<any>;
        if ((el.type as any).displayName === 'SelectTrigger') {
            const { children: _c, className: _cls, ...rest } = el.props as any;
            triggerProps = rest;
        }
    });
    return triggerProps;
}

function Select({
    value,
    onValueChange,
    children,
    ...props
}: {
    value?: string;
    onValueChange?: (value: string) => void;
    children?: React.ReactNode;
    [key: string]: any;
}) {
    const items = collectSelectItems(children);
    const placeholder = extractPlaceholder(children);
    const triggerProps = extractTriggerProps(children);

    // MUI Select needs aria-label on inputProps to reach the combobox element
    const { 'aria-label': ariaLabel, ...otherTriggerProps } = triggerProps;

    return (
        <FormControl size="small" fullWidth>
            <MuiSelect
                value={value ?? ''}
                onChange={(e: SelectChangeEvent) => onValueChange?.(e.target.value)}
                displayEmpty
                renderValue={(val) => {
                    if (!val) return <Box component="span" sx={{ color: 'text.secondary' }}>{placeholder}</Box>;
                    const matched = items.find((item) => item.props.value === val);
                    return matched ? matched.props.children : String(val);
                }}
                inputProps={ariaLabel ? { 'aria-label': ariaLabel } : undefined}
                {...otherTriggerProps}
                {...(props as any)}
            >
                {items.map((item, i) => (
                    <MenuItem key={`${item.props.value}-${i}`} value={item.props.value} className={cn(item.props.className)}>
                        {item.props.children}
                    </MenuItem>
                ))}
            </MuiSelect>
        </FormControl>
    );
}

function SelectTrigger({ className: _className, children: _children, ...props }: React.HTMLAttributes<HTMLButtonElement> & { sx?: SxProps<Theme> }) {
    // Rendering handled by Select component; this is kept for API compatibility
    return null;
}

function SelectValue({ placeholder: _placeholder }: { placeholder?: string }) {
    return null;
}

function SelectContent({ children, className: _className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
    // Children are collected by Select; this is kept for API compatibility
    return <>{children}</>;
}

function SelectItem({ value: _value, children, className: _className, ...props }: SelectItemProps & { [key: string]: any }) {
    // Rendered as MenuItem inside Select; this stub is for child-collection only
    return <>{children}</>;
}

function SelectGroup({ children }: { children?: React.ReactNode }) {
    return <>{children}</>;
}

function SelectLabel({ className, children }: { className?: string; children?: React.ReactNode }) {
    return (
        <Typography
            variant="caption"
            className={cn(className)}
            sx={{ display: 'block', py: 0.5, px: 1, fontWeight: 600, color: 'text.secondary' }}
        >
            {children}
        </Typography>
    );
}

function SelectSeparator({ className }: { className?: string }) {
    return <MuiDivider className={cn(className)} sx={{ my: 0.5 }} />;
}

SelectItem.displayName = 'SelectItem';
SelectContent.displayName = 'SelectContent';
SelectTrigger.displayName = 'SelectTrigger';
SelectValue.displayName = 'SelectValue';

export { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectSeparator, SelectTrigger, SelectValue };
