import { createSlice } from "@reduxjs/toolkit"
import { signUp, signIn, logOut } from "./operations"

const usersSlice = createSlice({
    name: "user",
    initialState: {
        user: {
            username: null,
            email: null,
            avatar: null,
            role: null,
        },
        userLoading: false,
        token: null,
        isLogged: false,
        isRefreshing: false
    },
    extraReducers: (builder) => 
        builder
    .addCase(signUp.fulfilled, (state, action) => {
        state.userLoading = false;
        state.isLogged = false;
        state.token = null;
        state.user = action.payload.user ?? state.user;
    })
    .addCase(signIn.pending, state => {
        state.userLoading = true;
    })
    .addCase(signIn.rejected, state => {
        state.userLoading = false
    })
    .addCase(signIn.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isLogged = true;
        state.userLoading = false;
    })
    .addCase(logOut.fulfilled, state => {
        state.user = { username: null, email: null, password: null, avatar: null };
        state.token = null;
        state.isLogged = false;
    })
})

export const { registration } = usersSlice.actions;
export const usersReducer = usersSlice.reducer;