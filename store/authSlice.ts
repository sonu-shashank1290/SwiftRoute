import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { AuthState } from '@/types/auth/auth';
import type { Role } from '@/types/user/user';

const initialState: AuthState = {
    isAuthenticated: false,
    id: null,
    name: null,
    email: null,
    role: null,
    activeTripId: null,
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
            return { ...initialState };
        },
        setActiveTripId(state, action: PayloadAction<string | null>) {
            state.activeTripId = action.payload;
        },
        endTrip(state) {
            state.activeTripId = null;
        },
    }
});

export const { login, logout, setActiveTripId, endTrip } = authSlice.actions;
export default authSlice.reducer;