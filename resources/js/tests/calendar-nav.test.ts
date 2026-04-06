import { describe, expect, it } from 'vitest';
import { calendarNavAriaLabel, calendarViewLabel, navigateCalendar } from '@/lib/calendarNav';

describe('navigateCalendar', () => {
    describe('family view (day navigation)', () => {
        it('navigates to the previous day', () => {
            expect(navigateCalendar('2025-04-03', 'prev', 'family')).toBe('2025-04-02');
        });

        it('navigates to the next day', () => {
            expect(navigateCalendar('2025-04-03', 'next', 'family')).toBe('2025-04-04');
        });

        it('handles month boundary going backward', () => {
            expect(navigateCalendar('2025-04-01', 'prev', 'family')).toBe('2025-03-31');
        });

        it('handles month boundary going forward', () => {
            expect(navigateCalendar('2025-03-31', 'next', 'family')).toBe('2025-04-01');
        });
    });

    describe('day view (day navigation)', () => {
        it('navigates to the previous day', () => {
            expect(navigateCalendar('2025-04-03', 'prev', 'timeGridDay')).toBe('2025-04-02');
        });

        it('navigates to the next day', () => {
            expect(navigateCalendar('2025-04-03', 'next', 'timeGridDay')).toBe('2025-04-04');
        });
    });

    describe('week view (week navigation)', () => {
        it('navigates to the previous week', () => {
            expect(navigateCalendar('2025-04-03', 'prev', 'timeGridWeek')).toBe('2025-03-27');
        });

        it('navigates to the next week', () => {
            expect(navigateCalendar('2025-04-03', 'next', 'timeGridWeek')).toBe('2025-04-10');
        });

        it('handles year boundary going backward', () => {
            expect(navigateCalendar('2025-01-02', 'prev', 'timeGridWeek')).toBe('2024-12-26');
        });
    });

    describe('listWeek view (week navigation)', () => {
        it('navigates to the previous week', () => {
            expect(navigateCalendar('2025-04-03', 'prev', 'listWeek')).toBe('2025-03-27');
        });

        it('navigates to the next week', () => {
            expect(navigateCalendar('2025-04-03', 'next', 'listWeek')).toBe('2025-04-10');
        });
    });

    describe('month view (month navigation)', () => {
        it('navigates to the previous month', () => {
            expect(navigateCalendar('2025-04-03', 'prev', 'dayGridMonth')).toBe('2025-03-03');
        });

        it('navigates to the next month', () => {
            expect(navigateCalendar('2025-04-03', 'next', 'dayGridMonth')).toBe('2025-05-03');
        });

        it('handles year boundary going backward', () => {
            expect(navigateCalendar('2025-01-15', 'prev', 'dayGridMonth')).toBe('2024-12-15');
        });

        it('handles year boundary going forward', () => {
            expect(navigateCalendar('2024-12-15', 'next', 'dayGridMonth')).toBe('2025-01-15');
        });

        it('navigates backward from January to December correctly', () => {
            expect(navigateCalendar('2025-01-01', 'prev', 'dayGridMonth')).toBe('2024-12-01');
        });
    });
});

describe('calendarViewLabel', () => {
    it('returns month and year for dayGridMonth', () => {
        expect(calendarViewLabel('2025-04-03', 'dayGridMonth')).toBe('April 2025');
    });

    it('returns day/month/year for family view', () => {
        // dayjs uses locale-aware format; default locale is en
        const label = calendarViewLabel('2025-04-03', 'family');
        expect(label).toContain('April');
        expect(label).toContain('3');
    });

    it('returns day/month/year for timeGridDay', () => {
        const label = calendarViewLabel('2025-04-03', 'timeGridDay');
        expect(label).toContain('April');
        expect(label).toContain('3');
    });

    it('returns a week range for timeGridWeek', () => {
        // 2025-04-03 is a Thursday; week = Mar 30 – Apr 5
        const label = calendarViewLabel('2025-04-03', 'timeGridWeek');
        expect(label).toContain('–');
    });

    it('returns a week range for listWeek', () => {
        const label = calendarViewLabel('2025-04-03', 'listWeek');
        expect(label).toContain('–');
    });

    it('week range includes the year', () => {
        const label = calendarViewLabel('2025-04-03', 'timeGridWeek');
        expect(label).toContain('2025');
    });
});

describe('calendarNavAriaLabel', () => {
    it('returns "Previous day" for family view', () => {
        expect(calendarNavAriaLabel('prev', 'family')).toBe('Previous day');
    });

    it('returns "Next day" for family view', () => {
        expect(calendarNavAriaLabel('next', 'family')).toBe('Next day');
    });

    it('returns "Previous day" for timeGridDay', () => {
        expect(calendarNavAriaLabel('prev', 'timeGridDay')).toBe('Previous day');
    });

    it('returns "Next day" for timeGridDay', () => {
        expect(calendarNavAriaLabel('next', 'timeGridDay')).toBe('Next day');
    });

    it('returns "Previous week" for timeGridWeek', () => {
        expect(calendarNavAriaLabel('prev', 'timeGridWeek')).toBe('Previous week');
    });

    it('returns "Next week" for timeGridWeek', () => {
        expect(calendarNavAriaLabel('next', 'timeGridWeek')).toBe('Next week');
    });

    it('returns "Previous week" for listWeek', () => {
        expect(calendarNavAriaLabel('prev', 'listWeek')).toBe('Previous week');
    });

    it('returns "Next week" for listWeek', () => {
        expect(calendarNavAriaLabel('next', 'listWeek')).toBe('Next week');
    });

    it('returns "Previous month" for dayGridMonth', () => {
        expect(calendarNavAriaLabel('prev', 'dayGridMonth')).toBe('Previous month');
    });

    it('returns "Next month" for dayGridMonth', () => {
        expect(calendarNavAriaLabel('next', 'dayGridMonth')).toBe('Next month');
    });
});
