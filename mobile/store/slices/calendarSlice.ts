import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { CalendarEvent } from '@/lib/api';

interface CalendarState {
  events: Record<string, CalendarEvent>;
  isLoading: boolean;
  error: string | null;
}

const initialState: CalendarState = {
  events: {},
  isLoading: false,
  error: null,
};

const calendarSlice = createSlice({
  name: 'calendar',
  initialState,
  reducers: {
    setEvents(state, action: PayloadAction<Record<string, CalendarEvent>>) {
      state.events = action.payload;
      state.isLoading = false;
      state.error = null;
    },
    upsertEvent(state, action: PayloadAction<CalendarEvent>) {
      state.events[String(action.payload.id)] = action.payload;
    },
    removeEvent(state, action: PayloadAction<number>) {
      delete state.events[String(action.payload)];
    },
    setLoading(state, action: PayloadAction<boolean>) {
      state.isLoading = action.payload;
    },
    setError(state, action: PayloadAction<string | null>) {
      state.error = action.payload;
      state.isLoading = false;
    },
  },
});

export const { setEvents, upsertEvent, removeEvent, setLoading, setError } =
  calendarSlice.actions;
export default calendarSlice.reducer;
