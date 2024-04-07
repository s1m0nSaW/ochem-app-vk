import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    data: null,
    status: 'loading',
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        logout: (state) => {
            state.data = null;
        },
        setData: (state, action) => {
            state.data = action.payload;
            state.status = 'loaded';
        },
    }
})

export const selectIsAuth = (state) => Boolean(state.auth.data);

export const authStatus = (state) => state.auth.status;

export const authReducer = authSlice.reducer;

export const { logout, setData } = authSlice.actions;