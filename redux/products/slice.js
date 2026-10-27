import { createSlice } from "@reduxjs/toolkit";
import { fetchProducts, fetchProductById } from "./operations.js";

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
    productUpdated: (state, { payload }) => {
      state.products = state.products.map((product) => product._id === payload._id ? payload : product);
      if (state.tempProduct?._id === payload._id) state.tempProduct = payload;
      // Discard catalogue responses started before this save.
      state.listRequestId = null;
      state.loading = false;
      state.rejected = false;
    },
  },
  extraReducers: (builder) => {
    builder
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

export const { clearTempProduct, productUpdated } = productsSlice.actions;
export const productsReducer = productsSlice.reducer;
