import { createSlice } from "@reduxjs/toolkit";

import { fetchProducts, fetchProductById } from "./operations";

const productsSlice = createSlice({
    name: "products",
    initialState: {
        products: [],
        tempProduct: null,
        loading: false,
        rejected: false
    },
    extraReducers: (builder) => {
       builder
        .addCase(fetchProducts.fulfilled, (state, action) => {
            state.loading = false;
            state.rejected = false;
            state.products = action.payload;
        })
        .addCase(fetchProducts.pending, (state) => {
            state.loading = true;
            state.rejected = false;
        })
        .addCase(fetchProducts.rejected, (state) => {
            state.loading = false;
            state.rejected = true;
        })
        .addCase(fetchProductById.fulfilled, (state, action) => {
            state.loading = false;
            state.rejected = false;
            state.tempProduct = action.payload;
        })
        .addCase(fetchProductById.pending, (state) => {
            state.loading = true;
            state.rejected = false;
        })
        .addCase(fetchProductById.rejected, (state) => {
            state.loading = false;
            state.rejected = true;
        })
    }
});

export const productsReducer = productsSlice.reducer;