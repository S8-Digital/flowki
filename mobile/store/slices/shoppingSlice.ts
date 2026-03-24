import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { ShoppingList } from '@/lib/api';

interface ShoppingState {
  lists: Record<string, ShoppingList>;
  isLoading: boolean;
  error: string | null;
}

const initialState: ShoppingState = {
  lists: {},
  isLoading: false,
  error: null,
};

const shoppingSlice = createSlice({
  name: 'shopping',
  initialState,
  reducers: {
    setLists(state, action: PayloadAction<Record<string, ShoppingList>>) {
      state.lists = action.payload;
      state.isLoading = false;
      state.error = null;
    },
    upsertList(state, action: PayloadAction<ShoppingList>) {
      state.lists[String(action.payload.id)] = action.payload;
    },
    removeList(state, action: PayloadAction<number>) {
      delete state.lists[String(action.payload)];
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

export const { setLists, upsertList, removeList, setLoading, setError } =
  shoppingSlice.actions;
export default shoppingSlice.reducer;
