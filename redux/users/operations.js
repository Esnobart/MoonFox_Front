import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const setAuthHeader = (token) => {
    axios.defaults.headers.common.Authorization = `Bearer ${token}`
}

const clearAuthHeader = () => {
    axios.defaults.headers.common.Authorization = ``
}

export const signUp = createAsyncThunk(
    "users/signup",
    async (data, thunkAPI) => {
        try {
            const response = await axios.post('users/signup', data);
            return response.data
        } catch (err) {
            return thunkAPI.rejectWithValue(err.response.data.message || err.message);
        }
    }
)

export const signIn = createAsyncThunk(
    "users/signin",
    async (data, thunkAPI) => {
        try {
            const responce = await axios.patch('users/signin', data);
            setAuthHeader(responce.data.token);
            return responce.data
        } catch (err) {
            return thunkAPI.rejectWithValue(err.response.data.message || err.message);
        }
    }
)

export const logOut = createAsyncThunk(
    "users/logout",
    async (data, thunkAPI) => {
        try {
            const responce = await axios.patch('users/logout', data);
            clearAuthHeader();
            return responce.data
        } catch (err) {
            return thunkAPI.rejectWithValue(err.response.data.message || err.message);
        }
    }
)