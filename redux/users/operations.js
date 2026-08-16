import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

axios.defaults.baseURL = import.meta.env.VITE_API_URL || "http://localhost:4000/api/";
axios.defaults.withCredentials = true;

export const signUp = createAsyncThunk(
    "users/signup",
    async (data, thunkAPI) => {
        try {
            const response = await axios.post('users/signup', data);
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
            const responce = await axios.post('users/signin', data);
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
            const responce = await axios.post('users/logout');
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
            const responce = await axios.get('users/current');
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
            const responce = await axios.post('users/forgot-password', data);
            return responce.data
        } catch (err) {
            return thunkAPI.rejectWithValue(err.response?.data?.message || err.message);
        }
    }
)
