import { createAsyncThunk } from "@reduxjs/toolkit";

import api from "../api.js";

export const fetchProducts = createAsyncThunk(
    "products/fetchProducts",
    async (_, thunkAPI) => {
        try {
            const response = await api.get('products', { signal: thunkAPI.signal });
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
            const response = await api.get(`products/${encodeURIComponent(productId)}`, { signal: thunkAPI.signal });
            return response.data;
        } catch (err) {
            return thunkAPI.rejectWithValue(err.response?.data?.message || err.message);
        }
    }
);

export const updateProduct = createAsyncThunk(
    "products/updateProduct",
    async ({ productId, values, version }, thunkAPI) => {
        try {
            const newImages = [];
            const images = values.images.map((image) => {
                if (image.file) {
                    const fileIndex = newImages.push(image.file) - 1;
                    return { fileIndex };
                }

                return { url: image.url };
            });
            const body = new FormData();

            body.append("data", JSON.stringify({
                version,
                name: values.name.trim(),
                description: values.description.trim(),
                collectionName: values.collectionName,
                author: values.author,
                price: values.price,
                inStock: values.inStock,
                popular: values.popular,
                ageRestriction: values.ageRestriction,
                images,
            }));
            newImages.forEach((file) => body.append("newImages", file, file.name));

            const response = await api.patch(
                `products/${encodeURIComponent(productId)}`,
                body,
                { signal: thunkAPI.signal },
            );

            if (response.data?.product?._id !== productId) {
                return thunkAPI.rejectWithValue("Could not save this product. Please try again.");
            }

            return response.data;
        } catch (err) {
            return thunkAPI.rejectWithValue(err.response?.data?.message || err.message);
        }
    }
);
