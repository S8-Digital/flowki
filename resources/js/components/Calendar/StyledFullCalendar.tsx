import type { CalendarOptions } from '@fullcalendar/core';
import FullCalendar from '@fullcalendar/react';
import Box from '@mui/material/Box';
import { alpha, useTheme } from '@mui/material/styles';
import { useEffect, useRef } from 'react';

interface StyledFullCalendarProps extends CalendarOptions {
    /** ISO date string — calendar will navigate to this date whenever it changes */
    selectedDate?: string;
    /** FullCalendar view name — calendar will switch view whenever it changes */
    view?: string;
}

/**
 * FullCalendar wrapped in MUI theme tokens.
 *
 * - Hides the built-in header toolbar (pass headerToolbar={false} by default)
 * - Syncs to `selectedDate` via gotoDate()
 * - Overrides all FullCalendar chrome to match MUI theme colours, typography and spacing
 *
 * Usage:
 *   <StyledFullCalendar
 *       plugins={[...]}
 *       initialView="timeGridWeek"
 *       selectedDate={selectedDate}
 *       events={allFcEvents}
 *       select={handleDateSelect}
 *       eventClick={handleEventClick}
 *       eventDrop={handleEventDrop}
 *       eventResize={handleEventResize}
 *       datesSet={handleDatesSet}
 *       editable
 *       selectable
 *       selectMirror
 *       dayMaxEvents
 *       nowIndicator
 *       height="auto"
 *   />
 */
export function StyledFullCalendar({ selectedDate, view, ...calendarOptions }: StyledFullCalendarProps) {
    const calendarRef = useRef<FullCalendar>(null);
    const theme = useTheme();

    // Sync calendar when selectedDate changes
    useEffect(() => {
        if (selectedDate) {
            calendarRef.current?.getApi().gotoDate(selectedDate);
        }
    }, [selectedDate]);

    // Sync calendar when view changes
    useEffect(() => {
        if (view) {
            calendarRef.current?.getApi().changeView(view);
        }
    }, [view]);

    return (
        <Box
            sx={{
                borderRadius: 2,
                border: 1,
                borderColor: 'divider',
                p: 1,
                overflow: 'hidden',

                // ── Base typography ──────────────────────────────────────────────
                '& .fc': {
                    fontFamily: theme.typography.fontFamily,
                    fontSize: theme.typography.body2.fontSize,
                    color: theme.palette.text.primary,
                },

                // ── Grid borders ─────────────────────────────────────────────────
                '& .fc-theme-standard td, & .fc-theme-standard th, & .fc-theme-standard .fc-scrollgrid': {
                    borderColor: theme.palette.divider,
                },

                // ── Column headers (Mon, Tue …) ───────────────────────────────────
                '& .fc .fc-col-header-cell-cushion': {
                    color: theme.palette.text.secondary,
                    fontWeight: theme.typography.fontWeightMedium,
                    fontSize: '0.75rem',
                    textDecoration: 'none',
                    py: 0.5,
                },

                // ── Day numbers ───────────────────────────────────────────────────
                '& .fc .fc-daygrid-day-number': {
                    color: theme.palette.text.primary,
                    textDecoration: 'none',
                    fontSize: '0.8125rem',
                    fontWeight: theme.typography.fontWeightMedium,
                },

                // ── Today highlight ───────────────────────────────────────────────
                '& .fc .fc-daygrid-day.fc-day-today': {
                    backgroundColor: theme.palette.mode === 'dark' ? `${theme.palette.primary.dark}22` : `${theme.palette.primary.light}18`,
                },
                '& .fc .fc-timegrid-col.fc-day-today': {
                    backgroundColor: theme.palette.mode === 'dark' ? `${theme.palette.primary.dark}22` : `${theme.palette.primary.light}18`,
                },
                '& .fc .fc-daygrid-day.fc-day-today .fc-daygrid-day-number': {
                    color: theme.palette.primary.main,
                    fontWeight: theme.typography.fontWeightBold,
                },

                // ── Now indicator ─────────────────────────────────────────────────
                '& .fc .fc-timegrid-now-indicator-line': {
                    borderColor: theme.palette.error.main,
                },
                '& .fc .fc-timegrid-now-indicator-arrow': {
                    borderColor: theme.palette.error.main,
                },

                // ── Time labels ───────────────────────────────────────────────────
                '& .fc .fc-timegrid-slot-label': {
                    color: theme.palette.text.disabled,
                    fontSize: '0.6875rem',
                    fontWeight: theme.typography.fontWeightMedium,
                    letterSpacing: '0.02em',
                },

                // ── Events ────────────────────────────────────────────────────────
                '& .fc-event': {
                    borderRadius: '6px',
                    fontSize: '0.75rem',
                    fontWeight: theme.typography.fontWeightMedium,
                    cursor: 'pointer',
                    border: 'none',
                    boxShadow: theme.shadows[1],
                    transition: 'box-shadow 0.15s, opacity 0.15s',
                    paddingLeft: '0.25rem',
                    marginBottom: '0.1rem',
                },
                '& .fc-event:hover': {
                    boxShadow: theme.shadows[4],
                    opacity: 0.92,
                },
                '& .fc-event .fc-event-title': {
                    fontWeight: theme.typography.fontWeightMedium,
                },

                // ── Daygrid "more" link ───────────────────────────────────────────
                '& .fc .fc-daygrid-more-link': {
                    color: theme.palette.primary.main,
                    fontSize: '0.6875rem',
                    fontWeight: theme.typography.fontWeightMedium,
                },

                // ── Selection highlight ───────────────────────────────────────────
                '& .fc .fc-highlight': {
                    backgroundColor: theme.palette.mode === 'dark' ? `${theme.palette.primary.dark}40` : `${theme.palette.primary.light}35`,
                },

                // ── List view ─────────────────────────────────────────────────────
                '& .fc .fc-listWeek-view': {
                    border: 'none',
                },
                '& .fc .fc-list-day-cushion': {
                    backgroundColor: theme.palette.action.hover,
                    color: theme.palette.text.secondary,
                    fontSize: '0.75rem',
                    fontWeight: theme.typography.fontWeightBold,
                    letterSpacing: '0.06em',
                    textTransform: 'uppercase',
                },
                '& .fc .fc-event-start td': {
                    border: 'none',
                    marginBottom: '0.25rem',
                },
                '& .fc .fc-list-event-time': {
                    color: theme.palette.text.disabled,
                    fontSize: '0.75rem',
                },
                '& .fc .fc-list-event-title a': {
                    color: theme.palette.text.primary,
                    textDecoration: 'none',
                },
                '& .fc .fc-list-event:hover td': {
                    backgroundColor: theme.palette.action.selected,
                },
                '& .fc .fc-list-empty': {
                    backgroundColor: theme.palette.background.default,
                    color: theme.palette.text.disabled,
                },

                // ── Scrollbar ─────────────────────────────────────────────────────
                '& .fc-scroller': {
                    scrollbarWidth: 'thin',
                    scrollbarColor: `${theme.palette.divider} transparent`,
                },
                '& .fc-scroller::-webkit-scrollbar': {
                    width: 6,
                },
                '& .fc-scroller::-webkit-scrollbar-thumb': {
                    borderRadius: 3,
                    backgroundColor: theme.palette.divider,
                },

                // ── Toolbar (hidden by default but styled if re-enabled) ───────────
                '& .fc .fc-toolbar-title': {
                    fontSize: theme.typography.h6.fontSize,
                    fontWeight: theme.typography.fontWeightBold,
                    color: theme.palette.text.primary,
                },
                '& .fc .fc-button': {
                    backgroundColor: theme.palette.background.paper,
                    borderColor: theme.palette.divider,
                    color: theme.palette.text.primary,
                    fontFamily: theme.typography.fontFamily,
                    fontSize: theme.typography.button.fontSize,
                    textTransform: 'none',
                    boxShadow: 'none',
                    '&:hover': {
                        backgroundColor: theme.palette.action.hover,
                        borderColor: theme.palette.divider,
                    },
                    '&:focus': {
                        boxShadow: `0 0 0 2px ${theme.palette.primary.main}40`,
                    },
                    '&.fc-button-active': {
                        backgroundColor: theme.palette.primary.main,
                        borderColor: theme.palette.primary.main,
                        color: theme.palette.primary.contrastText,
                    },
                },
                '& .fc .fc-daygrid-day.fc-day-today, & .fc .fc-timegrid-col.fc-day-today': {
                    '--fc-today-bg-color': alpha(theme.palette.primary.main, 0.1),
                },
            }}
        >
            <FullCalendar
                ref={calendarRef}
                allDayText="All Day"
                eventTimeFormat={{
                    hour: 'numeric',
                    minute: '2-digit',
                    meridiem: 'short',
                }}
                headerToolbar={false}
                slotLabelFormat={{
                    hour: 'numeric',
                    minute: '2-digit',
                    meridiem: 'short',
                }}
                {...calendarOptions}
            />
        </Box>
    );
}
