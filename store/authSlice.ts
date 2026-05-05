import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { Role } from '@/types/delivery';

type AuthState = {
    isAuthenticated: boolean;
    id: string | null;
    name: string | null;
    email: string | null;
    role: Role | null;
};

const initialState: AuthState = {
    isAuthenticated: false,
    id: null,
    name: null,
    email: null,
    role: null,
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        login(state, action: PayloadAction<{ id: string; name: string; email: string; role: Role }>) {
            state.isAuthenticated = true;
            state.id = action.payload.id;
            state.name = action.payload.name;
            state.email = action.payload.email;
            state.role = action.payload.role;
        },
        logout(state) {
            state.isAuthenticated = false;
            state.id = null;
            state.name = null;
            state.email = null;
            state.role = null;
        },
    }
});

export const { login, logout } = authSlice.actions;
export default authSlice.reducer;