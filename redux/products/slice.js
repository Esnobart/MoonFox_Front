import { createSlice } from "@reduxjs/toolkit";
import { fetchProducts, fetchProductById, updateProduct } from "./operations.js";

const productsSlice = createSlice({
  name: "products",
  initialState: {
    products: [],
    tempProduct: null,
    loading: false,
    rejected: false,
    productLoading: false,
    productRejected: false,
    listRequestId: null,
    productRequestId: null,
  },
  reducers: {
    clearTempProduct: (state) => {
      state.tempProduct = null;
      state.productRequestId = null;
      state.productLoading = false;
      state.productRejected = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(updateProduct.fulfilled, (state, action) => {
        const product = action.payload.product;
        state.products = state.products.map((item) => item._id === product._id ? product : item);
        if (state.tempProduct?._id === product._id) state.tempProduct = product;
        state.listRequestId = null;
        state.loading = false;
        state.rejected = false;
      })
      .addCase(fetchProducts.pending, (state, action) => {
        state.listRequestId = action.meta.requestId;
        state.loading = true;
        state.rejected = false;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        if (state.listRequestId !== action.meta.requestId) return;
        state.listRequestId = null;
        state.loading = false;
        state.products = action.payload;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        if (state.listRequestId !== action.meta.requestId) return;
        state.listRequestId = null;
        state.loading = false;
        state.rejected = !action.meta.aborted;
      })
      .addCase(fetchProductById.pending, (state, action) => {
        state.productRequestId = action.meta.requestId;
        state.productLoading = true;
        state.productRejected = false;
        state.tempProduct = null;
      })
      .addCase(fetchProductById.fulfilled, (state, action) => {
        if (state.productRequestId !== action.meta.requestId) return;
        state.productRequestId = null;
        state.productLoading = false;
        state.tempProduct = action.payload;
      })
      .addCase(fetchProductById.rejected, (state, action) => {
        if (state.productRequestId !== action.meta.requestId) return;
        state.productRequestId = null;
        state.productLoading = false;
        state.productRejected = !action.meta.aborted;
      });
  },
});

export const { clearTempProduct } = productsSlice.actions;
export const productsReducer = productsSlice.reducer;
