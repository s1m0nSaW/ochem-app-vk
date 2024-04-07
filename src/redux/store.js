import { configureStore } from "@reduxjs/toolkit";
import { authReducer } from "./auth.js";

export const store = configureStore({
    reducer:{
        auth: authReducer,
    },
});
