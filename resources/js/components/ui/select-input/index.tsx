import FormControl from '@mui/material/FormControl';
import NativeSelect from '@mui/material/NativeSelect';
import OutlinedInput from '@mui/material/OutlinedInput';
import * as React from 'react';

interface SelectInputProps {
    options: { value: string; label: string }[];
    placeholder?: string;
    value?: string;
    onChange?: React.ChangeEventHandler<HTMLSelectElement>;
    disabled?: boolean;
    name?: string;
    id?: string;
}

function SelectInput({ options, placeholder, value, onChange, disabled, name, id }: SelectInputProps) {
    return (
        <FormControl size="small" fullWidth>
            <NativeSelect
                value={value}
                onChange={onChange}
                disabled={disabled}
                name={name}
                id={id}
                input={<OutlinedInput notched={false} />}
            >
                {placeholder && <option value="">{placeholder}</option>}
                {options.map((option) => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </NativeSelect>
        </FormControl>
    );
}

export { SelectInput };
