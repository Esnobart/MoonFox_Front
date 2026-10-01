import { createSlice } from "@reduxjs/toolkit"
import {
    signUp,
    signIn,
    logOut,
    refreshUser,
    addProductToWishlist,
    removeProductFromWishlist,
    addProductToBasket,
    updateBasketProductQuantity,
    removeProductFromBasket
} from "./operations"

const createEmptyUser = () => ({
    _id: null,
    username: null,
    email: null,
    avatar: null,
    role: null,
    wishlist: [],
    basket: []
});

const updateUserFromPayload = (state, action) => {
    state.user = action.payload.user;
    state.userLoading = false;
};

const setUserActionPending = (state) => {
    state.userLoading = true;
};

const setUserActionRejected = (state) => {
    state.userLoading = false;
};

const usersSlice = createSlice({
    name: "user",
    initialState: {
        user: createEmptyUser(),
        userLoading: false,
        isLogged: false,
        isRefreshing: true
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
        state.user = createEmptyUser();
        state.isLogged = false;
        state.isRefreshing = false;
    })
    .addCase(logOut.fulfilled, state => {
        state.user = createEmptyUser();
        state.isLogged = false;
    })
    .addCase(logOut.rejected, state => {
        state.user = createEmptyUser();
        state.isLogged = false;
    })
    .addCase(addProductToWishlist.pending, setUserActionPending)
    .addCase(addProductToWishlist.fulfilled, updateUserFromPayload)
    .addCase(addProductToWishlist.rejected, setUserActionRejected)
    .addCase(removeProductFromWishlist.pending, setUserActionPending)
    .addCase(removeProductFromWishlist.fulfilled, updateUserFromPayload)
    .addCase(removeProductFromWishlist.rejected, setUserActionRejected)
    .addCase(addProductToBasket.pending, setUserActionPending)
    .addCase(addProductToBasket.fulfilled, updateUserFromPayload)
    .addCase(addProductToBasket.rejected, setUserActionRejected)
    .addCase(updateBasketProductQuantity.pending, setUserActionPending)
    .addCase(updateBasketProductQuantity.fulfilled, updateUserFromPayload)
    .addCase(updateBasketProductQuantity.rejected, setUserActionRejected)
    .addCase(removeProductFromBasket.pending, setUserActionPending)
    .addCase(removeProductFromBasket.fulfilled, updateUserFromPayload)
    .addCase(removeProductFromBasket.rejected, setUserActionRejected)
})

export const usersReducer = usersSlice.reducer;
