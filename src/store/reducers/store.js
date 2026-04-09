import { configureStore } from "@reduxjs/toolkit";
import { productReducer } from "./ProductReducer";
import { errorReducer } from "./errorReducer";
import { cartReducer } from "./cartReducer";
import { authReducer } from "./authReducer";
import { paymentMethodReducer } from "./paymentMethodReducer";
import { adminReducer } from "./adminReducer";
import { orderReducer } from "./orderReducer";
import { sellerReducer } from "./sellerReducer";
import { chatReducer } from "./chatReducer";

const user = localStorage.getItem("auth")
    ? JSON.parse(localStorage.getItem("auth"))
    : null;

const cartItems = !user && localStorage.getItem("cartItems")
    ? JSON.parse(localStorage.getItem("cartItems"))
    : [];

const computedTotalPrice = cartItems.reduce(
    (sum, item) => sum + (Number(item?.specialPrice || 0) * Number(item?.quantity || 0)),
    0
);

const selectUserCheckoutAddress = localStorage.getItem("CHECKOUT_ADDRESS")
    ? JSON.parse(localStorage.getItem("CHECKOUT_ADDRESS"))
    : [];

const storedPaymentMethod = localStorage.getItem("PAYMENT_METHOD")
    ? JSON.parse(localStorage.getItem("PAYMENT_METHOD"))
    : null;

const initialState = {
    auth: { user: user, selectedUserCheckoutAddress: selectUserCheckoutAddress },
    carts: { cart: cartItems, totalPrice: computedTotalPrice },
    payment: { paymentMethod: storedPaymentMethod },
};

export const store = configureStore({
    reducer: {
        products: productReducer,
        errors: errorReducer,
        carts: cartReducer,
        auth: authReducer,
        payment: paymentMethodReducer,
        admin: adminReducer,
        order: orderReducer,
        seller: sellerReducer,
        chat: chatReducer,
    },
    preloadedState: initialState,
});

export default store;