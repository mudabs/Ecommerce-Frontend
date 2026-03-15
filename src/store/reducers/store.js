import {configureStore} from "@reduxjs/toolkit";
import { ProductReducer } from "./ProductReducer";
import { ErrorReducer } from "./errorReducer";
import { CartReducer } from "./cartReducer";

export const store = configureStore({
    reducer: {
        product: ProductReducer,
        errors: ErrorReducer,
        carts: CartReducer,
    },
    preloadedState: {
        
    },
});

export default store;