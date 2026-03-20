import { DatePicker, DateTimePicker, LocalizationProvider, TimePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import type { Dayjs } from 'dayjs';
import 'dayjs/locale/en-au';
import type { ComponentProps } from 'react';
import { locale } from '@/lib/locale';

type DateTimeInputProps =
    | ({ type: 'date'; value?: string | Dayjs | null } & Omit<ComponentProps<typeof DatePicker>, 'value'>)
    | ({ type?: 'datetime'; value?: string | Dayjs | null } & Omit<ComponentProps<typeof DateTimePicker>, 'value'>)
    | ({ type: 'time'; value?: string | Dayjs | null } & Omit<ComponentProps<typeof TimePicker>, 'value'>);

function DateTimeInput({ value, ...props }: DateTimeInputProps) {
    const type = props.type ?? 'datetime';
    const dayjsValue = typeof value === 'string' ? (value ? dayjs(value) : null) : (value ?? null);

    return (
        <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale={locale}>
            {type === 'date' ? (
                <DatePicker value={dayjsValue} {...(props as ComponentProps<typeof DatePicker>)} />
            ) : type === 'time' ? (
                <TimePicker value={dayjsValue} {...(props as ComponentProps<typeof TimePicker>)} />
            ) : (
                <DateTimePicker value={dayjsValue} {...(props as ComponentProps<typeof DateTimePicker>)} />
            )}
        </LocalizationProvider>
    );
}

export { DateTimeInput };
export type { DateTimeInputProps };
