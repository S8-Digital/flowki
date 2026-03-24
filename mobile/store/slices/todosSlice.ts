import { createSlice  } from '@reduxjs/toolkit';
import type {PayloadAction} from '@reduxjs/toolkit';
import type { Todo } from '@/lib/api';

interface TodosState {
  items: Record<string, Todo>;
  isLoading: boolean;
  error: string | null;
}

const initialState: TodosState = {
  items: {},
  isLoading: false,
  error: null,
};

const todosSlice = createSlice({
  name: 'todos',
  initialState,
  reducers: {
    setTodos(state, action: PayloadAction<Record<string, Todo>>) {
      state.items = action.payload;
      state.isLoading = false;
      state.error = null;
    },
    upsertTodo(state, action: PayloadAction<Todo>) {
      state.items[String(action.payload.id)] = action.payload;
    },
    removeTodo(state, action: PayloadAction<number>) {
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

export const { setTodos, upsertTodo, removeTodo, setLoading, setError } =
  todosSlice.actions;
export default todosSlice.reducer;
