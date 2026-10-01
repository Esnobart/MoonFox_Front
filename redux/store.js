import { configureStore } from "@reduxjs/toolkit";

import { usersReducer } from "./users/slice";
import { productsReducer } from "./products/slice";
import { profileReducer } from "./profile/slice";

const store = configureStore({
    reducer: {
        users: usersReducer,
        products: productsReducer,
        profile: profileReducer
    }
})

export default store