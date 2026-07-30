import { configureStore } from "@reduxjs/toolkit";

import { usersReducer } from "./users/slice";

const store = configureStore({
    reducer: {
        user: usersReducer
    }
})

export default store