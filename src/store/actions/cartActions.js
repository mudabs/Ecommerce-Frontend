import toast from 'react-hot-toast';

const CART_STORAGE_KEY = 'smartcart_cart_items';

const persistCart = (cartItems) => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
};

const clampQuantity = (quantity, maxQuantity) => {
    const parsedQuantity = Number(quantity) || 1;
    const minimumSafeQuantity = Math.max(1, parsedQuantity);

    if (!Number.isFinite(maxQuantity) || maxQuantity <= 0) {
        return minimumSafeQuantity;
    }

    return Math.min(minimumSafeQuantity, maxQuantity);
};

export const addToCart = (product, quantity = 1) => (dispatch, getState) => {
    const existingCart = getState().carts?.cart || [];
    const stockQuantity = Number(product?.quantity) || 0;

    if (!product?.productId || stockQuantity <= 0) {
        return;
    }

    const existingItem = existingCart.find((item) => item.productId === product.productId);

    let nextCart = [];

    if (existingItem) {
        const maxQuantity = Number(existingItem.stockQuantity) || stockQuantity;
        const mergedQuantity = clampQuantity(existingItem.quantity + quantity, maxQuantity);
        nextCart = existingCart.map((item) =>
            item.productId === product.productId
                ? { ...item, quantity: mergedQuantity, stockQuantity: maxQuantity }
                : item
        );
        toast.success(`${product.productName || 'Item'} quantity updated in cart`);
    } else {
        const nextItem = {
            ...product,
            quantity: clampQuantity(quantity, stockQuantity),
            stockQuantity,
        };
        nextCart = [...existingCart, nextItem];
        toast.success(`${product.productName || 'Item'} added to cart`);
    }

    persistCart(nextCart);
    dispatch({ type: 'CART_SET_ITEMS', payload: nextCart });
};

export const updateCartQuantity = (productId, quantity) => (dispatch, getState) => {
    const existingCart = getState().carts?.cart || [];

    const nextCart = existingCart
        .map((item) => {
            if (item.productId !== productId) return item;
            const safeQuantity = clampQuantity(quantity, Number(item.stockQuantity) || undefined);
            return { ...item, quantity: safeQuantity };
        })
        .filter((item) => item.quantity > 0);

    persistCart(nextCart);
    dispatch({ type: 'CART_SET_ITEMS', payload: nextCart });
};

export const incrementCartQuantity = (productId) => (dispatch, getState) => {
    const existingCart = getState().carts?.cart || [];
    const item = existingCart.find((cartItem) => cartItem.productId === productId);

    if (!item) return;

    const maxQuantity = Number(item?.stockQuantity) || Number(item?.quantity) || 1;
    const nextQuantity = Math.min((Number(item.quantity) || 1) + 1, maxQuantity);

    dispatch(updateCartQuantity(productId, nextQuantity));
};

export const decrementCartQuantity = (productId) => (dispatch, getState) => {
    const existingCart = getState().carts?.cart || [];
    const item = existingCart.find((cartItem) => cartItem.productId === productId);

    if (!item) return;

    const nextQuantity = Math.max((Number(item.quantity) || 1) - 1, 1);
    dispatch(updateCartQuantity(productId, nextQuantity));
};

export const removeFromCart = (productId) => (dispatch, getState) => {
    const existingCart = getState().carts?.cart || [];
    const removedItem = existingCart.find((item) => item.productId === productId);
    const nextCart = existingCart.filter((item) => item.productId !== productId);

    persistCart(nextCart);
    dispatch({ type: 'CART_SET_ITEMS', payload: nextCart });

    if (removedItem) {
        toast.success(`${removedItem.productName || 'Item'} removed from cart`);
    }
};

export const clearCart = () => (dispatch) => {
    localStorage.removeItem(CART_STORAGE_KEY);
    dispatch({ type: 'CART_CLEAR' });
};
