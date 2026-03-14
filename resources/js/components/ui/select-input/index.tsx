import * as React from 'react';
import { ChevronDownIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SelectInputProps extends React.ComponentProps<'select'> {
    options: { value: string; label: string }[];
    placeholder?: string;
}

function SelectInput({ className, options, placeholder, ...props }: SelectInputProps) {
    return (
        <div className="relative w-full">
            <select
                data-slot="select-input"
                className={cn(
                    'border-input dark:bg-input/30 flex h-9 w-full appearance-none rounded-md border bg-transparent px-3 py-1 pr-8 text-base shadow-xs transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 md:text-sm cursor-pointer',
                    className,
                )}
                {...props}
            >
                {placeholder && <option value="">{placeholder}</option>}
                {options.map((option) => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
            <ChevronDownIcon className="text-muted-foreground pointer-events-none absolute right-2.5 top-1/2 size-4 -translate-y-1/2 opacity-50" />
        </div>
    );
}

export { SelectInput };
