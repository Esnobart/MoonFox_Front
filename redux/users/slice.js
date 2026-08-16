import { createSlice } from "@reduxjs/toolkit"
import { signUp, signIn, logOut, refreshUser } from "./operations"

const initialUser = {
    username: null,
    email: null,
    avatar: null,
    role: null,
};

const usersSlice = createSlice({
    name: "user",
    initialState: {
        user: initialUser,
        userLoading: false,
        isLogged: false,
        isRefreshing: false
    },
    extraReducers: (builder) => 
        builder
    .addCase(signUp.fulfilled, (state, action) => {
        state.userLoading = false;
        state.isLogged = false;
        state.user = action.payload.user ?? state.user;
    })
    .addCase(signIn.pending, state => {
        state.userLoading = true;
    })
    .addCase(signIn.rejected, state => {
        state.userLoading = false
        state.isLogged = false
    })
    .addCase(signIn.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.isLogged = true;
        state.userLoading = false;
    })
    .addCase(refreshUser.pending, state => {
        state.isRefreshing = true;
    })
    .addCase(refreshUser.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.isLogged = true;
        state.isRefreshing = false;
    })
    .addCase(refreshUser.rejected, state => {
        state.user = initialUser;
        state.isLogged = false;
        state.isRefreshing = false;
    })
    .addCase(logOut.fulfilled, state => {
        state.user = initialUser;
        state.isLogged = false;
    })
    .addCase(logOut.rejected, state => {
        state.user = initialUser;
        state.isLogged = false;
    })
})

export const { registration } = usersSlice.actions;
export const usersReducer = usersSlice.reducer;
