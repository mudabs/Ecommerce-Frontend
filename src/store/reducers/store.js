import {configureStore} from "@reduxjs/toolkit";
import { ProductReducer } from "./ProductReducer";
import { ErrorReducer } from "./errorReducer";
import { CartReducer } from "./cartReducer";
import { AuthReducer } from "./authReducer";

export const store = configureStore({
    reducer: {
        product: ProductReducer,
        errors: ErrorReducer,
        carts: CartReducer,
        auth: AuthReducer,
    },
    preloadedState: {
        
    },
});

export default store;