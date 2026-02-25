import {configureStore} from "@reduxjs/toolkit";
import { ProductReducer } from "./ProductReducer";
import { ErrorReducer } from "./errorReducer";

export const store = configureStore({
    reducer: {
        product: ProductReducer,
        errors: ErrorReducer,
    },
    preloadedState: {
        
    },
});

export default store;