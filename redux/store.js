import { configureStore } from "@reduxjs/toolkit";

import { usersReducer } from "./users/slice";
import { productsReducer } from "./products/slice";

const store = configureStore({
    reducer: {
        users: usersReducer,
        products: productsReducer
    }
})

export default store