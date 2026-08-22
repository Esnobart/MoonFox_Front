import { createAsyncThunk } from "@reduxjs/toolkit";

import api from "../api";

export const fetchProducts = createAsyncThunk(
    "products/fetchProducts",
    async (_, thunkAPI) => {
        try {
            const response = await api.get('products');
            return response.data;
        } catch (err) {
            return thunkAPI.rejectWithValue(err.response?.data?.message || err.message);
        }
    }
);

export const fetchProductById = createAsyncThunk(
    "products/fetchProductById",
    async (productId, thunkAPI) => {
        try {
            const response = await api.get(`products/${productId}`);
            return response.data;
        } catch (err) {
            return thunkAPI.rejectWithValue(err.response?.data?.message || err.message);
        }
    }
);