import { createSlice } from "@reduxjs/toolkit";

import { fetchUserProfile } from "./operations";

const profileSlice = createSlice({
  name: "profile",
  initialState: {
    user: null,
    loading: false,
    error: null,
  },
  reducers: {
    clearProfile: (state) => {
      state.user = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserProfile.pending, (state) => {
        state.user = null;
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.user = action.payload;
        state.loading = false;
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.user = null;
        state.loading = false;
        state.error = action.payload || "Could not load this profile";
      });
  },
});

export const { clearProfile } = profileSlice.actions;
export const profileReducer = profileSlice.reducer;
