import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UserState {
    trustScore: number;
    reportsSubmitted: number;
    verifiedReports: number;
    communityRank: string;
    isLoggedIn: boolean;
    token: string | null;
}

const initialState: UserState = {
    trustScore: 890,
    reportsSubmitted: 42,
    verifiedReports: 38,
    communityRank: 'Guardian (Top 5%)',
    isLoggedIn: true, // For demo purposes, starting logged in
    token: 'mock-jwt-token',
};

export const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        setProfile(state, action: PayloadAction<Partial<UserState>>) {
            return { ...state, ...action.payload };
        },
        logout(state) {
            state.isLoggedIn = false;
            state.token = null;
        },
    },
});

export const { setProfile, logout } = userSlice.actions;
export default userSlice.reducer;
