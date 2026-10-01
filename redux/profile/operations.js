import { createAsyncThunk } from "@reduxjs/toolkit";

import api from "../api";

export const fetchUserProfile = createAsyncThunk(
  "profile/fetchUserProfile",
  async (username, thunkAPI) => {
    try {
      const response = await api.get(
        `users/profile/${encodeURIComponent(username)}`,
      );
      return response.data.user;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
    }
  },
);
