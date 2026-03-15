const CART_STORAGE_KEY = 'smartcart_cart_items';

const loadCartFromStorage = () => {
    try {
        const storedCart = localStorage.getItem(CART_STORAGE_KEY);
        if (!storedCart) return [];

        const parsedCart = JSON.parse(storedCart);
        return Array.isArray(parsedCart) ? parsedCart : [];
    } catch {
        return [];
    }
};

const initialState = {
    cart: loadCartFromStorage(),
};

export const CartReducer = (state = initialState, action) => {
    switch (action.type) {
        case 'CART_SET_ITEMS':
            return {
                ...state,
                cart: action.payload,
            };
        case 'CART_CLEAR':
            return {
                ...state,
                cart: [],
            };
        default:
            return state;
    }
};
