import { createAsyncThunk } from "@reduxjs/toolkit";

import api from "../api";

export const signUp = createAsyncThunk(
    "users/signup",
    async (data, thunkAPI) => {
        try {
            const response = await api.post('users/signup', data);
            return response.data
        } catch (err) {
            return thunkAPI.rejectWithValue(err.response?.data?.message || err.message);
        }
    }
)

export const signIn = createAsyncThunk(
    "users/signin",
    async (data, thunkAPI) => {
        try {
            const responce = await api.post('users/signin', data);
            return responce.data
        } catch (err) {
            return thunkAPI.rejectWithValue(err.response?.data?.message || err.message);
        }
    }
)

export const logOut = createAsyncThunk(
    "users/logout",
    async (_, thunkAPI) => {
        try {
            const responce = await api.post('users/logout');
            return responce.data
        } catch (err) {
            return thunkAPI.rejectWithValue(err.response?.data?.message || err.message);
        }
    }
)

export const refreshUser = createAsyncThunk(
    "users/refresh",
    async (_, thunkAPI) => {
        try {
            const responce = await api.get('users/current');
            return responce.data
        } catch (err) {
            return thunkAPI.rejectWithValue(err.response?.data?.message || err.message);
        }
    }
)

export const requestNewPassword = createAsyncThunk(
    "users/requestNewPassword",
    async (data, thunkAPI) => {
        try {
            const responce = await api.post('users/forgot-password', data);
            return responce.data
        } catch (err) {
            return thunkAPI.rejectWithValue(err.response?.data?.message || err.message);
        }
    }
)

export const resetPassword = createAsyncThunk(
    "users/resetPassword",
    async ({ resetToken, newPassword }, thunkAPI) => {
        try {
            const responce = await api.patch(
                `users/reset-password/${encodeURIComponent(resetToken)}`,
                { newPassword },
            );
            return responce.data
        } catch (err) {
            return thunkAPI.rejectWithValue(err.response?.data?.message || err.message);
        }
    }
)

export const addProductToWishlist = createAsyncThunk(
    "users/addProductToWishlist",
    async (productId, thunkAPI) => {
        try {
            const responce = await api.post(`users/wishlist/${productId}`);
            return responce.data
        } catch (err) {
            return thunkAPI.rejectWithValue(err.response?.data?.message || err.message);
        }
    }
)

export const removeProductFromWishlist = createAsyncThunk(
    "users/removeProductFromWishlist",
    async (productId, thunkAPI) => {
        try {
            const responce = await api.delete(`users/wishlist/${productId}`);
            return responce.data
        } catch (err) {
            return thunkAPI.rejectWithValue(err.response?.data?.message || err.message);
        }
    }
)

export const addProductToBasket = createAsyncThunk(
    "users/addProductToBasket",
    async ({ productId, quantity }, thunkAPI) => {
        try {
            const responce = await api.post(`users/basket/${productId}`, { quantity });
            return responce.data
        } catch (err) {
            return thunkAPI.rejectWithValue(err.response?.data?.message || err.message);
        }
    }
)

export const updateBasketProductQuantity = createAsyncThunk(
    "users/updateBasketProductQuantity",
    async ({ productId, quantity }, thunkAPI) => {
        try {
            const responce = await api.patch(`users/basket/${productId}`, { quantity });
            return responce.data
        } catch (err) {
            return thunkAPI.rejectWithValue(err.response?.data?.message || err.message);
        }
    }
)

export const removeProductFromBasket = createAsyncThunk(
    "users/removeProductFromBasket",
    async (productId, thunkAPI) => {
        try {
            const responce = await api.delete(`users/basket/${productId}`);
            return responce.data
        } catch (err) {
            return thunkAPI.rejectWithValue(err.response?.data?.message || err.message);
        }
    }
)
