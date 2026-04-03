import dayjs from 'dayjs';

export type CalendarViewType = 'family' | 'dayGridMonth' | 'timeGridWeek' | 'timeGridDay' | 'listWeek';

/**
 * Returns the ISO date string (YYYY-MM-DD) after navigating prev/next from `dateStr`
 * by the appropriate unit for the given `view`.
 *
 * | View             | Unit  |
 * |------------------|-------|
 * | dayGridMonth     | month |
 * | timeGridWeek     | week  |
 * | listWeek         | week  |
 * | family / timeGridDay | day |
 */
export function navigateCalendar(dateStr: string, direction: 'prev' | 'next', view: CalendarViewType): string {
    const d = dayjs(dateStr);
    let unit: 'day' | 'week' | 'month' = 'day';

    if (view === 'dayGridMonth') {
        unit = 'month';
    } else if (view === 'timeGridWeek' || view === 'listWeek') {
        unit = 'week';
    }

    return direction === 'prev' ? d.subtract(1, unit).format('YYYY-MM-DD') : d.add(1, unit).format('YYYY-MM-DD');
}

/**
 * Returns a human-readable label for the current calendar view/date.
 *
 * | View         | Example                     |
 * |--------------|-----------------------------|
 * | dayGridMonth | April 2025                  |
 * | timeGridWeek | Mar 31 – Apr 6, 2025        |
 * | listWeek     | Mar 31 – Apr 6, 2025        |
 * | family/day   | Monday, April 3             |
 */
export function calendarViewLabel(dateStr: string, view: CalendarViewType): string {
    const d = dayjs(dateStr);

    if (view === 'dayGridMonth') {
        return d.format('MMMM YYYY');
    }

    if (view === 'timeGridWeek' || view === 'listWeek') {
        const start = d.startOf('week');
        const end = d.endOf('week');

        return start.month() === end.month()
            ? `${start.format('MMM D')} – ${end.format('D, YYYY')}`
            : `${start.format('MMM D')} – ${end.format('MMM D, YYYY')}`;
    }

    return d.format('dddd, MMMM D');
}

/**
 * Returns a screen-reader-friendly aria-label for the prev/next navigation buttons.
 */
export function calendarNavAriaLabel(direction: 'prev' | 'next', view: CalendarViewType): string {
    const word = direction === 'prev' ? 'Previous' : 'Next';

    if (view === 'dayGridMonth') {
        return `${word} month`;
    }

    if (view === 'timeGridWeek' || view === 'listWeek') {
        return `${word} week`;
    }

    return `${word} day`;
}
