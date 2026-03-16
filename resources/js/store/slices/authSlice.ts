import type { PayloadAction } from '@reduxjs/toolkit';
import { createSlice } from '@reduxjs/toolkit';
import type { Auth } from '@/types';

interface AuthState {
    user: Auth['user'] | null;
    connectedProviders: string[];
    hasPasswordSet: boolean;
}

const initialState: AuthState = {
    user: null,
    connectedProviders: [],
    hasPasswordSet: false,
};

export const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setAuth: (state, action: PayloadAction<Auth>) => {
            state.user = action.payload.user;
            state.connectedProviders = action.payload.connectedProviders;
            state.hasPasswordSet = action.payload.hasPasswordSet;
        },
        clearAuth: (state) => {
            state.user = null;
            state.connectedProviders = [];
            state.hasPasswordSet = false;
        },
    },
});

export const { setAuth, clearAuth } = authSlice.actions;
