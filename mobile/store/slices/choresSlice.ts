import { createSlice  } from '@reduxjs/toolkit';
import type {PayloadAction} from '@reduxjs/toolkit';
import type { Chore } from '@/lib/api';

interface ChoresState {
  items: Record<string, Chore>;
  isLoading: boolean;
  error: string | null;
}

const initialState: ChoresState = {
  items: {},
  isLoading: false,
  error: null,
};

const choresSlice = createSlice({
  name: 'chores',
  initialState,
  reducers: {
    setChores(state, action: PayloadAction<Record<string, Chore>>) {
      state.items = action.payload;
      state.isLoading = false;
      state.error = null;
    },
    upsertChore(state, action: PayloadAction<Chore>) {
      state.items[String(action.payload.id)] = action.payload;
    },
    removeChore(state, action: PayloadAction<number>) {
      delete state.items[String(action.payload)];
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

export const { setChores, upsertChore, removeChore, setLoading, setError } =
  choresSlice.actions;
export default choresSlice.reducer;
