import api from "../../api/api"

const buildUrlWithQuery = (path, queryString) => {
    const safeQuery = typeof queryString === "string" ? queryString.trim() : "";
    return safeQuery ? `${path}?${safeQuery}` : path;
};

const tryGetWithFallbackEndpoints = async (endpoints, config) => {
    let lastError;

    for (const endpoint of endpoints) {
        try {
            return await api.get(endpoint, config);
        } catch (error) {
            lastError = error;
            const status = error?.response?.status;
            if (status !== 404 && status !== 405) {
                throw error;
            }
        }
    }

    throw lastError;
};

const tryPostWithFallbackEndpoints = async (endpoints, payload) => {
    let lastError;

    for (const endpoint of endpoints) {
        try {
            return await api.post(endpoint, payload);
        } catch (error) {
            lastError = error;
            const status = error?.response?.status;
            if (status !== 403 && status !== 404) {
                throw error;
            }
        }
    }

    throw lastError;
};

const extractAuthErrorMessage = (error) => {
    const data = error?.response?.data;
    if (typeof data === "string") return data;

    return (
        data?.message ||
        data?.error ||
        data?.description ||
        data?.password ||
        "Internal Server Error"
    );
};

const extractApiErrorMessage = (error, fallbackMessage) => {
    const data = error?.response?.data;
    if (typeof data === "string") {
        return data;
    }

    if (Array.isArray(data?.errors) && data.errors.length > 0) {
        const firstError = data.errors[0];
        if (typeof firstError === "string") {
            return firstError;
        }

        if (typeof firstError?.defaultMessage === "string") {
            return firstError.defaultMessage;
        }

        if (typeof firstError?.message === "string") {
            return firstError.message;
        }
    }

    if (data?.errors && typeof data.errors === "object") {
        const firstValue = Object.values(data.errors)[0];
        if (typeof firstValue === "string") {
            return firstValue;
        }
    }

    return (
        data?.message ||
        data?.error ||
        data?.description ||
        fallbackMessage
    );
};

const normalizeAddressPayload = (sendData = {}) => {
    const normalizedPincode = String(sendData?.pincode ?? "")
        .trim()
        .replace(/\s+/g, "");

    return {
        buildingName: String(sendData?.buildingName ?? "").trim(),
        city: String(sendData?.city ?? "").trim(),
        street: String(sendData?.street ?? "").trim(),
        state: String(sendData?.state ?? "").trim(),
        pincode: normalizedPincode,
        country: String(sendData?.country ?? "").trim(),
    };
};

const getAddressPayloadCandidates = (sendData) => {
    const normalizedPayload = normalizeAddressPayload(sendData);
    const alternateNamesPayload = {
        ...normalizedPayload,
        name: normalizedPayload.buildingName,
        addressLine1: normalizedPayload.street,
        addressLine2: normalizedPayload.buildingName,
        postalCode: normalizedPayload.pincode,
        zipCode: normalizedPayload.pincode,
        zipcode: normalizedPayload.pincode,
    };

    return [
        normalizedPayload,
        {
            ...normalizedPayload,
            zipCode: normalizedPayload.pincode,
            pincode: undefined,
        },
        {
            ...normalizedPayload,
            postalCode: normalizedPayload.pincode,
            pincode: undefined,
        },
        {
            ...alternateNamesPayload,
            pincode: undefined,
        },
    ];
};

const normalizeBearerToken = (value) => {
    if (!value || typeof value !== "string") {
        return null;
    }
    const trimmed = value.trim();
    if (!trimmed) {
        return null;
    }
    // Remove any "Bearer " prefix first.
    const withoutBearerPrefix = trimmed.replace(/^Bearer\s+/i, "");

    // Backend sometimes returns the JWT embedded in a cookie string, like:
    // "smartcart=<jwt>; Path=/api; Max-Age=..."
    // JWT segments may include '=' padding at the end, so we must extract
    // the raw token using a regex over the *whole* string (not split on '=').
    const jwtMatch = withoutBearerPrefix.match(
        /[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+=*/
    );
    if (jwtMatch && jwtMatch[0]) {
        // Sometimes the cookie string may contain an URL-encoded JWT value.
        // Decode it if needed (safe if not encoded).
        try {
            return jwtMatch[0].includes("%")
                ? decodeURIComponent(jwtMatch[0])
                : jwtMatch[0];
        } catch {
            return jwtMatch[0];
        }
    }

    // Fallback: take the part after the first '=' (safe for cookie strings).
    const firstPart = withoutBearerPrefix.split(";")[0].trim();
    const eqIdx = firstPart.indexOf("=");
    if (eqIdx !== -1) {
        const tokenPart = firstPart.slice(eqIdx + 1).trim();
        if (!tokenPart) return null;
        try {
            return tokenPart.includes("%") ? decodeURIComponent(tokenPart) : tokenPart;
        } catch {
            return tokenPart;
        }
    }

    return withoutBearerPrefix || null;
};

const getAuthRequestConfig = (getState) => {
    const extractTokenFromObject = (source) => {
        if (!source || typeof source !== "object") {
            return null;
        }

        const directToken =
            source?.jwtToken ||
            source?.token ||
            source?.accessToken ||
            source?.access_token ||
            source?.bearerToken ||
            source?.idToken ||
            source?.jwt ||
            null;

        if (directToken && typeof directToken === "string") {
            return normalizeBearerToken(directToken);
        }

        // Common backend response wrappers: { data: {...} }, { user: {...} }, { result: {...} }, etc.
        const nestedKeys = ["data", "user", "auth", "result", "response"];
        for (const key of nestedKeys) {
            const nestedValue = source?.[key];
            if (nestedValue && typeof nestedValue === "object") {
                const nestedToken = extractTokenFromObject(nestedValue);
                if (nestedToken) return nestedToken;
            }
        }

        return null;
    };

    const { user } = getState().auth || {};
    let token = extractTokenFromObject(user);

    if (!token) {
        try {
            const persistedAuth = localStorage.getItem("auth");
            const parsedAuth = persistedAuth ? JSON.parse(persistedAuth) : null;
            token = extractTokenFromObject(parsedAuth);
        } catch (error) {
            token = null;
        }
    }

    const normalized = normalizeBearerToken(token);
    if (!normalized) {
        return undefined;
    }

    return {
        headers: {
            Authorization: `Bearer ${normalized}`,
        },
    };
};

const getGuestCartItems = () => {
    try {
        const raw = localStorage.getItem("cartItems");
        return raw ? JSON.parse(raw) : [];
    } catch {
        return [];
    }
};

const setGuestCartItems = (cartItems) => {
    localStorage.setItem("cartItems", JSON.stringify(Array.isArray(cartItems) ? cartItems : []));
};

const clearGuestCartItems = () => {
    localStorage.removeItem("cartItems");
};

const isAuthenticatedCartSession = (getState) => Boolean(getAuthRequestConfig(getState));

const applyCartResponse = (dispatch, cartData, persistAsGuest = false) => {
    const cartItems = Array.isArray(cartData?.products) ? cartData.products : [];
    dispatch({
        type: "GET_USER_CART_PRODUCTS",
        payload: cartItems,
        totalPrice: Number(cartData?.totalPrice || 0),
        cartId: cartData?.cartId || null,
    });

    if (persistAsGuest) {
        setGuestCartItems(cartItems);
    } else {
        clearGuestCartItems();
    }
};

const normalizeCartItemsForSync = (cartItems) => {
    const normalizedItems = (Array.isArray(cartItems) ? cartItems : [])
        .map((item) => ({
            productId: item?.productId ?? item?.id,
            quantity: Number(item?.quantity || 0),
        }))
        .filter((item) => item.productId != null && item.quantity > 0);

    const dedupedByProductId = normalizedItems.reduce((acc, item) => {
        const key = String(item.productId);
        acc[key] = Math.min((acc[key] ?? 0) + item.quantity, 25);
        return acc;
    }, {});

    return Object.entries(dedupedByProductId).map(([productId, quantity]) => ({
        productId: Number(productId),
        quantity,
    }));
};

export const fetchProducts = (queryString) => async (dispatch) => {
    try {
        dispatch({ type: "IS_FETCHING" });
        const { data } = await api.get(buildUrlWithQuery("/public/products", queryString));
        dispatch({
            type: "FETCH_PRODUCTS",
            payload: data.content,
            pageNumber: data.pageNumber,
            pageSize: data.pageSize,
            totalElements: data.totalElements,
            totalPages: data.totalPages,
            lastPage: data.lastPage,
        });
        dispatch({ type: "IS_SUCCESS" });
    } catch (error) {
        console.log(error);
        dispatch({ 
            type: "IS_ERROR",
            payload: error?.response?.data?.message || "Failed to fetch products",
         });
    }
};


export const fetchCategories = () => async (dispatch) => {
    try {
        dispatch({ type: "CATEGORY_LOADER" });
        const { data } = await api.get(`/public/categories`);
        dispatch({
            type: "FETCH_CATEGORIES",
            payload: data.content,
            pageNumber: data.pageNumber,
            pageSize: data.pageSize,
            totalElements: data.totalElements,
            totalPages: data.totalPages,
            lastPage: data.lastPage,
        });
        dispatch({ type: "IS_ERROR" });
    } catch (error) {
        console.log(error);
        dispatch({ 
            type: "IS_ERROR",
            payload: error?.response?.data?.message || "Failed to fetch categories",
         });
    }
};


export const addToCart = (data, qty = 1, toast) => 
    async (dispatch, getState) => {
        if (isAuthenticatedCartSession(getState)) {
            try {
                const requestConfig = getAuthRequestConfig(getState);
                const { data: cartData } = await api.post(
                    `/carts/products/${data.productId}/quantity/${qty}`,
                    null,
                    requestConfig
                );
                applyCartResponse(dispatch, cartData);
                toast.success(`${data?.productName} added to the cart`);
            } catch (error) {
                toast.error(extractApiErrorMessage(error, "Failed to add item to cart"));
            }
            return;
        }

        const { products = [] } = getState().products;
        const currentProduct = products.find((item) => item.productId === data.productId) || data;
        const isQuantityExist = Number(currentProduct?.quantity || 0) >= qty;

        if (isQuantityExist) {
            dispatch({ type: "ADD_CART", payload: {...data, quantity: qty}});
            toast.success(`${data?.productName} added to the cart`);
            setGuestCartItems(getState().carts.cart);
        } else {
            toast.error("Out of stock");
        }
};


export const increaseCartQuantity = 
    (data, toast, currentQuantity, setCurrentQuantity) =>
    async (dispatch, getState) => {
        if (isAuthenticatedCartSession(getState)) {
            try {
                const requestConfig = getAuthRequestConfig(getState);
                const { data: cartData } = await api.put(
                    `/cart/products/${data.productId}/quantity/increase`,
                    null,
                    requestConfig
                );
                applyCartResponse(dispatch, cartData);
                setCurrentQuantity((prev) => prev + 1);
            } catch (error) {
                toast.error(extractApiErrorMessage(error, "Failed to update cart quantity"));
            }
            return;
        }

        const { products = [] } = getState().products;
        const currentProduct = products.find(
            (item) => item.productId === data.productId
        ) || data;

        const isQuantityExist = Number(currentProduct?.quantity || 0) >= currentQuantity + 1;

        if (isQuantityExist) {
            const newQuantity = currentQuantity + 1;
            setCurrentQuantity(newQuantity);

            dispatch({
                type: "ADD_CART",
                payload: {...data, quantity: newQuantity },
            });
            setGuestCartItems(getState().carts.cart);
        } else {
            toast.error("Quantity Reached to Limit");
        }

    };



export const decreaseCartQuantity = 
    (data, newQuantity) => async (dispatch, getState) => {
        if (isAuthenticatedCartSession(getState)) {
            try {
                const requestConfig = getAuthRequestConfig(getState);
                const { data: cartData } = await api.put(
                    `/cart/products/${data.productId}/quantity/delete`,
                    null,
                    requestConfig
                );
                applyCartResponse(dispatch, cartData);
            } catch (error) {
                console.log(error);
            }
            return;
        }

        dispatch({
            type: "ADD_CART",
            payload: {...data, quantity: newQuantity},
        });
        setGuestCartItems(getState().carts.cart);
    }

export const removeFromCart =  (data, toast) => async (dispatch, getState) => {
    if (isAuthenticatedCartSession(getState)) {
        try {
            const requestConfig = getAuthRequestConfig(getState);
            await api.delete(`/carts/users/cart/product/${data.productId}`, requestConfig);
            await dispatch(getUserCart());
            toast.success(`${data.productName} removed from cart`);
        } catch (error) {
            toast.error(extractApiErrorMessage(error, "Failed to remove item from cart"));
        }
        return;
    }

    dispatch({type: "REMOVE_CART", payload: data });
    toast.success(`${data.productName} removed from cart`);
    setGuestCartItems(getState().carts.cart);
}



export const authenticateSignInUser 
    = (sendData, toast, reset, navigate, setLoader) => async (dispatch) => {
        try {
            setLoader(true);
            const rawUsername = String(sendData?.username || "").trim();
            const isEmailLogin = rawUsername.includes("@");
            const signinPayload = {
                username: rawUsername,
                userName: rawUsername,
                password: sendData?.password,
            };

            if (isEmailLogin) {
                signinPayload.email = rawUsername;
                signinPayload.usernameOrEmail = rawUsername;
            }

            let response;
            try {
                // Use the canonical endpoint first to avoid multiple failed attempts per submit.
                response = await api.post("/auth/signin", signinPayload);
            } catch (error) {
                if (error?.response?.status === 404) {
                    // Fallback only when backend exposes /auth/login instead of /auth/signin.
                    response = await api.post("/auth/login", signinPayload);
                } else {
                    throw error;
                }
            }

            const { data } = response;
            dispatch({ type: "LOGIN_USER", payload: data });
            localStorage.setItem("auth", JSON.stringify(data));
            await dispatch(syncUserCart(getGuestCartItems()));
            reset();
            toast.success("Login Success");
            navigate("/");
        } catch (error) {
            console.log(error);
            toast.error(extractAuthErrorMessage(error));
        } finally {
            setLoader(false);
        }
}


export const registerNewUser 
    = (sendData, toast, reset, navigate, setLoader) => async (dispatch) => {
        try {
            setLoader(true);
            const registerPayload = {
                ...sendData,
                userName: sendData?.username,
            };

            const { data } = await tryPostWithFallbackEndpoints([
                "/auth/signup",
                "/auth/register",
            ], registerPayload);
            reset();
            toast.success(data?.message || "User Registered Successfully");
            navigate("/login");
        } catch (error) {
            console.log(error);
            toast.error(extractAuthErrorMessage(error));
        } finally {
            setLoader(false);
        }
};


export const logOutUser = (navigate) => (dispatch) => {
    dispatch({ type:"LOG_OUT" });
    dispatch({ type: "CLEAR_CART" });
    dispatch({ type: "CHAT_CLEAR" });
    localStorage.removeItem("auth");
    localStorage.removeItem("cartItems");
    localStorage.removeItem("PAYMENT_METHOD");
    localStorage.removeItem("SAVED_PAYMENT_METHODS");
    navigate("/login");
};

export const addUpdateUserAddress =
     (sendData, toast, addressId, setOpenAddressModal) => async (dispatch, getState) => {
    /*
    const { user } = getState().auth;
    await api.post(`/addresses`, sendData, {
          headers: { Authorization: "Bearer " + user.jwtToken },
        });
    */
    dispatch({ type:"BUTTON_LOADER" });
    let isAddressSaved = false;

    try {
        const payloadCandidates = getAddressPayloadCandidates(sendData);
        const requestConfig = getAuthRequestConfig(getState);
        let lastError;

        for (const payload of payloadCandidates) {
            try {
                if (!addressId) {
                    await api.post("/addresses", payload, requestConfig);
                } else {
                    await api.put(`/addresses/${addressId}`, payload, requestConfig);
                }

                isAddressSaved = true;
                break;
            } catch (error) {
                lastError = error;
                const statusCode = error?.response?.status;
                if (statusCode !== 400 && statusCode !== 422) {
                    throw error;
                }
            }
        }

        if (!isAddressSaved) {
            throw lastError;
        }

        dispatch(getUserAddresses());
        toast.success("Address saved successfully");
        dispatch({ type:"IS_SUCCESS" });
    } catch (error) {
        console.log(error);
        toast.error(extractApiErrorMessage(error, "Failed to save address"));
        dispatch({ type:"IS_ERROR", payload: null });
    } finally {
        if (isAddressSaved) {
            setOpenAddressModal(false);
        }
    }
};


export const deleteUserAddress = 
    (toast, addressId, setOpenDeleteModal) => async (dispatch, getState) => {
    try {
        dispatch({ type: "BUTTON_LOADER" });
        const requestConfig = getAuthRequestConfig(getState);
        await api.delete(`/addresses/${addressId}`, requestConfig);
        dispatch({ type: "IS_SUCCESS" });
        dispatch(getUserAddresses());
        dispatch(clearCheckoutAddress());
        toast.success("Address deleted successfully");
    } catch (error) {
        console.log(error);
        dispatch({ 
            type: "IS_ERROR",
            payload: error?.response?.data?.message || "Some Error Occured",
         });
    } finally {
        setOpenDeleteModal(false);
    }
};

export const clearCheckoutAddress = () => {
    return {
        type: "REMOVE_CHECKOUT_ADDRESS",
    }
};

export const getUserAddresses = () => async (dispatch, getState) => {
    try {
        dispatch({ type: "IS_FETCHING" });
        const requestConfig = getAuthRequestConfig(getState);
        const { data } = await api.get(`/users/addresses`, requestConfig);
        dispatch({type: "USER_ADDRESS", payload: data});
        const selectedUserCheckoutAddress = getState()?.auth?.selectedUserCheckoutAddress;
        const hasSelectedAddress = Boolean(selectedUserCheckoutAddress?.addressId);
        const selectedAddressStillExists = hasSelectedAddress && data?.some(
            (address) => address?.addressId === selectedUserCheckoutAddress.addressId
        );

        if (hasSelectedAddress && !selectedAddressStillExists) {
            dispatch(clearCheckoutAddress());
        }

        dispatch({ type: "IS_SUCCESS" });
    } catch (error) {
        console.log(error);
        if (error?.response?.status === 401) {
            dispatch({ type: "LOG_OUT" });
            localStorage.removeItem("auth");
            dispatch({
                type: "IS_ERROR",
                payload: "Session expired. Please login again.",
            });
            return;
        }

        dispatch({ 
            type: "IS_ERROR",
            payload: error?.response?.data?.message || "Failed to fetch user addresses",
         });
    }
};

export const selectUserCheckoutAddress = (address) => {
    localStorage.setItem("CHECKOUT_ADDRESS", JSON.stringify(address));
    
    return {
        type: "SELECT_CHECKOUT_ADDRESS",
        payload: address,
    }
};


export const addPaymentMethod = (method) => {
    localStorage.setItem("PAYMENT_METHOD", JSON.stringify(method));

    return {
        type: "ADD_PAYMENT_METHOD",
        payload: method,
    }
};

export const removePaymentMethod = () => {
    localStorage.removeItem("PAYMENT_METHOD");

    return {
        type: "REMOVE_PAYMENT_METHOD",
    };
};


export const createUserCart = (sendCartItems) => async (dispatch, getState) => {
    try {
        await dispatch(syncUserCart(sendCartItems));
    } catch (error) {
        console.log(error);
        dispatch({ 
            type: "IS_ERROR",
            payload: extractApiErrorMessage(error, "Failed to create cart items"),
         });
    }
};

export const syncUserCart = (sendCartItems = []) => async (dispatch, getState) => {
    const requestConfig = getAuthRequestConfig(getState);
    if (!requestConfig) {
        return null;
    }

    const normalizedCartItems = normalizeCartItemsForSync(sendCartItems);

    if (normalizedCartItems.length === 0) {
        await dispatch(getUserCart());
        return null;
    }

    const { data } = await api.post("/carts/users/cart/sync", normalizedCartItems, requestConfig);
    applyCartResponse(dispatch, data);
    return data;
};


export const getUserCart = () => async (dispatch, getState) => {
    try {
        const requestConfig = getAuthRequestConfig(getState);
        if (!requestConfig) {
            return null;
        }
        const { data } = await api.get('/carts/users/cart', requestConfig);
        applyCartResponse(dispatch, data);
        return data;
    } catch (error) {
        console.log(error);
        dispatch({ 
            type: "IS_ERROR",
            payload: error?.response?.data?.message || "Failed to fetch cart items",
         });
    }
};


export const createStripePaymentSecret 
    = (sendData) => async (dispatch, getState) => {
        try {
            dispatch({ type: "IS_FETCHING" });
            const requestConfig = getAuthRequestConfig(getState);
            if (!requestConfig) {
                dispatch({
                    type: "IS_ERROR",
                    payload: "Please login again to continue payment.",
                });
                return;
            }

            const { data } = await api.post("/order/stripe-client-secret", sendData, requestConfig);
            dispatch({ type: "CLIENT_SECRET", payload: data });
              localStorage.setItem("client-secret", JSON.stringify(data));
              dispatch({ type: "IS_SUCCESS" });
        } catch (error) {
            console.log(error);
            dispatch({
                type: "IS_ERROR",
                payload: extractApiErrorMessage(error, "Failed to create client secret"),
            });
        }
};

/**
 * Stripe Checkout Session (hosted checkout). Backend must create a Session and return a redirect URL.
 * POST /order/stripe-checkout-session — expect JSON: { "url": "https://checkout.stripe.com/..." }.
 * successUrl should include the literal substring {CHECKOUT_SESSION_ID} for Stripe to substitute.
 */
export const createStripeCheckoutSession =
    (sendData) => async (dispatch, getState) => {
        try {
            dispatch({ type: "IS_FETCHING" });
            const requestConfig = getAuthRequestConfig(getState);
            if (!requestConfig) {
                dispatch({
                    type: "IS_ERROR",
                    payload: "Please login again to continue payment.",
                });
                return;
            }

            const { data } = await api.post(
                "/order/stripe-checkout-session",
                sendData,
                requestConfig
            );
            const url =
                (typeof data === "string" ? data : null) ||
                data?.url ||
                data?.sessionUrl;

            if (!url || typeof url !== "string") {
                dispatch({
                    type: "IS_ERROR",
                    payload:
                        "Checkout session did not return a redirect URL. Check your backend response.",
                });
                return;
            }

            dispatch({ type: "IS_SUCCESS" });
            window.location.assign(url);
        } catch (error) {
            console.log(error);
            const status = error?.response?.status;
            const message =
                status === 401
                    ? "Session expired. Please log out and log in again to continue payment."
                    : extractApiErrorMessage(error, "Failed to start Stripe Checkout");
            dispatch({
                type: "IS_ERROR",
                payload: message,
            });
        }
    };


export const stripePaymentConfirmation
    = (sendData, setErrorMessage, setLoading, toast, onSuccess) => async (dispatch, getState) => {
        try {
            const requestConfig = getAuthRequestConfig(getState);
            if (!requestConfig) {
                setErrorMessage("Session expired. Please login again.");
                return;
            }

            const response = await api.post("/order/users/payments/online", sendData, requestConfig);
            if (response.data) {
                localStorage.removeItem("CHECKOUT_ADDRESS");
                localStorage.removeItem("cartItems");
                localStorage.removeItem("client-secret");
                dispatch({ type: "REMOVE_CLIENT_SECRET_ADDRESS"});
                dispatch({ type: "CLEAR_CART"});
                toast.success("Order Accepted");
                if (typeof onSuccess === "function") {
                    onSuccess(response.data);
                }
            } else {
                setErrorMessage("Payment Failed. Please try again.");
            }
        } catch (error) {
            setErrorMessage(
                extractApiErrorMessage(error, "Payment Failed. Please try again.")
            );
        } finally {
            if (typeof setLoading === "function") {
                setLoading(false);
            }
        }
};

export const analyticsAction = () => async (dispatch, getState) => {
        try {
            dispatch({ type: "IS_FETCHING"});
            const requestConfig = getAuthRequestConfig(getState);
            const { data } = await api.get('/admin/app/analytics', requestConfig);
            dispatch({
                type: "FETCH_ANALYTICS",
                payload: data,
            })
            dispatch({ type: "IS_SUCCESS"});
        } catch (error) {
            dispatch({ 
                type: "IS_ERROR",
                payload: extractApiErrorMessage(error, "Failed to fetch analytics data"),
            });
        }
};

export const fetchDashboardData = () => async (dispatch, getState) => {
    try {
        dispatch({ type: "IS_FETCHING" });
        const requestConfig = getAuthRequestConfig(getState);

        const [analyticsRes, ordersRes] = await Promise.all([
            api.get('/admin/app/analytics', requestConfig),
            api.get('/admin/orders?pageSize=100&sortBy=orderDate&sortDir=desc', requestConfig),
        ]);

        dispatch({ type: "FETCH_ANALYTICS", payload: analyticsRes.data });
        dispatch({ type: "FETCH_DASHBOARD_ORDERS", payload: ordersRes.data.content || [] });
        dispatch({ type: "IS_SUCCESS" });
    } catch (error) {
        dispatch({
            type: "IS_ERROR",
            payload: extractApiErrorMessage(error, "Failed to fetch dashboard data"),
        });
    }
};

export const getOrdersForDashboard = (queryString, isAdmin) => async (dispatch, getState) => {
    try {
        dispatch({ type: "IS_FETCHING" });
        const endpoint = isAdmin ? "/admin/orders" : "/seller/orders";
        const requestConfig = getAuthRequestConfig(getState);
        const searchParams = new URLSearchParams(queryString || "");
        const keyword = searchParams.get("keyword") || "";
        const requestedPage = Number(searchParams.get("pageNumber") || 0);

        if (keyword.trim()) {
            const { items, pageSize: serverPageSize } = await fetchAllPagesForSearch(endpoint, requestConfig);
            const filtered = filterByFields(items, keyword, ["email", "orderStatus"]);
            const { page, ...pagination } = paginateFilteredResults(filtered, requestedPage, serverPageSize || DEFAULT_DASHBOARD_PAGE_SIZE);
            dispatch({ type: "GET_ADMIN_ORDERS", payload: page, ...pagination });
            dispatch({ type: "IS_SUCCESS" });
            return;
        }

        const { data } = await api.get(buildUrlWithQuery(endpoint, queryString), requestConfig);
        dispatch({
            type: "GET_ADMIN_ORDERS",
            payload: data.content,
            pageNumber: data.pageNumber,
            pageSize: data.pageSize,
            totalElements: data.totalElements,
            totalPages: data.totalPages,
            lastPage: data.lastPage,
        });
        dispatch({ type: "IS_SUCCESS" });
    } catch (error) {
        console.log(error);
        dispatch({ 
            type: "IS_ERROR",
            payload: error?.response?.data?.message || "Failed to fetch orders data",
         });
    }
};


export const fetchProductById = (productId) => async (dispatch) => {
    try {
        dispatch({ type: "IS_FETCHING" });
        const { data } = await api.get(`/public/products/${productId}`);
        dispatch({ type: "FETCH_PRODUCT_BY_ID", payload: data });
        dispatch({ type: "IS_SUCCESS" });
    } catch (error) {
        console.log(error);
        dispatch({
            type: "IS_ERROR",
            payload: error?.response?.data?.message || "Failed to fetch product",
        });
    }
};

export const fetchProductReviews = (productId, page = 0) => async (dispatch) => {
    try {
        const { data } = await api.get(`/public/products/${productId}/reviews?pageNumber=${page}&pageSize=10`);
        dispatch({
            type: "FETCH_PRODUCT_REVIEWS",
            payload: data.content,
            averageRating: data.averageRating,
            reviewCount: data.reviewCount,
            pageNumber: data.pageNumber,
            totalPages: data.totalPages,
            lastPage: data.lastPage,
        });
    } catch (error) {
        console.log(error);
    }
};

export const addProductReview = (productId, reviewData, toast, onSuccess) => async (dispatch, getState) => {
    try {
        const requestConfig = getAuthRequestConfig(getState);
        if (!requestConfig) {
            toast.error("Please log in to leave a review.");
            return;
        }
        await api.post(`/products/${productId}/reviews`, reviewData, requestConfig);
        toast.success("Review submitted!");
        dispatch(fetchProductReviews(productId));
        if (typeof onSuccess === "function") onSuccess();
    } catch (error) {
        toast.error(extractApiErrorMessage(error, "Failed to submit review"));
    }
};

export const deleteProductReview = (productId, reviewId, toast) => async (dispatch, getState) => {
    try {
        const requestConfig = getAuthRequestConfig(getState);
        await api.delete(`/products/${productId}/reviews/${reviewId}`, requestConfig);
        toast.success("Review deleted.");
        dispatch(fetchProductReviews(productId));
    } catch (error) {
        toast.error(extractApiErrorMessage(error, "Failed to delete review"));
    }
};

export const fetchSimilarProducts = (category, excludeProductId) => async (dispatch) => {
    try {
        const { data } = await api.get(
            buildUrlWithQuery("/public/products", `category=${encodeURIComponent(category)}&pageSize=8`)
        );
        const similar = (data.content || []).filter((p) => p.productId !== excludeProductId);
        dispatch({ type: "FETCH_SIMILAR_PRODUCTS", payload: similar });
    } catch (error) {
        console.log(error);
    }
};

export const updateOrderStatusFromDashboard =
     (orderId, orderStatus, toast, setLoader, isAdmin) => async (dispatch, getState) => {
    try {
        setLoader(true);
        const endpoint = isAdmin ? "/admin/orders/" : "/seller/orders/";
        const requestConfig = getAuthRequestConfig(getState);
        
        const { data } = await api.put(`${endpoint}${orderId}/status`, { status: orderStatus}, requestConfig);
        toast.success(data.message || "Order updated successfully");
        await dispatch(getOrdersForDashboard());
    } catch (error) {
        console.log(error);
        toast.error(error?.response?.data?.message || "Internal Server Error");
    } finally {
        setLoader(false)
    }
};

const resolveDashboardProductAccess = (getState, isAdminOverride) => {
    if (typeof isAdminOverride === "boolean") {
        return isAdminOverride;
    }

    const { user } = getState().auth || {};
    return Boolean(user?.roles?.includes("ROLE_ADMIN"));
};

const DEFAULT_DASHBOARD_PAGE_SIZE = 10;
const DASHBOARD_SEARCH_BATCH_SIZE = 100;
const DEFAULT_DASHBOARD_PRODUCT_PAGE_SIZE = DEFAULT_DASHBOARD_PAGE_SIZE;
const DASHBOARD_PRODUCT_SEARCH_BATCH_SIZE = DASHBOARD_SEARCH_BATCH_SIZE;

const normalizeSearchableText = (value) =>
    String(value || "")
        .toLowerCase()
        .trim();

const fetchAllPagesForSearch = async (endpoint, requestConfig, batchSize = DASHBOARD_SEARCH_BATCH_SIZE) => {
    const aggregated = [];
    let pageNumber = 0;
    let lastPage = false;
    let pageSize = DEFAULT_DASHBOARD_PAGE_SIZE;

    while (!lastPage) {
        const params = new URLSearchParams();
        params.set("pageNumber", pageNumber);
        params.set("pageSize", batchSize);

        const { data } = await api.get(buildUrlWithQuery(endpoint, params.toString()), requestConfig);
        const content = Array.isArray(data?.content) ? data.content : [];
        aggregated.push(...content);
        pageSize = Number(data?.pageSize) || pageSize;
        lastPage = Boolean(data?.lastPage);
        pageNumber += 1;

        if (!content.length && data?.lastPage !== false) break;
    }

    return { items: aggregated, pageSize };
};

const filterByFields = (items, keyword, fields) => {
    const normalized = normalizeSearchableText(keyword);
    if (!normalized) return Array.isArray(items) ? items : [];
    return (Array.isArray(items) ? items : []).filter((item) =>
        fields.some((field) => normalizeSearchableText(item?.[field]).includes(normalized))
    );
};

const paginateFilteredResults = (filteredItems, requestedPage, pageSize) => {
    const totalElements = filteredItems.length;
    const totalPages = Math.max(1, Math.ceil(totalElements / pageSize));
    const safePage = Math.min(Math.max(requestedPage, 0), totalPages - 1);
    const start = safePage * pageSize;
    return {
        page: filteredItems.slice(start, start + pageSize),
        pageNumber: safePage,
        pageSize,
        totalElements,
        totalPages,
        lastPage: safePage >= totalPages - 1,
    };
};

const fetchAllDashboardProductsForSearch = async (endpoint, requestConfig) => {
    const { items, pageSize } = await fetchAllPagesForSearch(endpoint, requestConfig, DASHBOARD_PRODUCT_SEARCH_BATCH_SIZE);
    return { products: items, pageSize };
};

const filterDashboardProducts = (products, keyword) =>
    filterByFields(products, keyword, ["productName", "description"]);


export const dashboardProductsAction = (queryString, isAdmin) => async (dispatch, getState) => {
    try {
        dispatch({ type: "IS_FETCHING" });
        const hasAdminAccess = resolveDashboardProductAccess(getState, isAdmin);
        const endpoint = hasAdminAccess ? "/admin/products" : "/seller/products";
        const requestConfig = getAuthRequestConfig(getState);
        const searchParams = new URLSearchParams(queryString || "");
        const keyword = searchParams.get("keyword") || "";
        const requestedPageNumber = Number(searchParams.get("pageNumber") || 0);

        if (keyword.trim()) {
            const { products: allProducts, pageSize: serverPageSize } = await fetchAllDashboardProductsForSearch(
                endpoint,
                requestConfig
            );
            const filteredProducts = filterDashboardProducts(allProducts, keyword);
            const effectivePageSize = serverPageSize || DEFAULT_DASHBOARD_PRODUCT_PAGE_SIZE;
            const totalElements = filteredProducts.length;
            const totalPages = Math.max(1, Math.ceil(totalElements / effectivePageSize));
            const safePageNumber = Math.min(Math.max(requestedPageNumber, 0), totalPages - 1);
            const startIndex = safePageNumber * effectivePageSize;
            const paginatedProducts = filteredProducts.slice(startIndex, startIndex + effectivePageSize);

            dispatch({
                type: "FETCH_PRODUCTS",
                payload: paginatedProducts,
                pageNumber: safePageNumber,
                pageSize: effectivePageSize,
                totalElements,
                totalPages,
                lastPage: safePageNumber >= totalPages - 1,
            });
            dispatch({ type: "IS_SUCCESS" });
            return;
        }
        
        const { data } = await api.get(buildUrlWithQuery(endpoint, queryString), requestConfig);
        dispatch({
            type: "FETCH_PRODUCTS",
            payload: data.content,
            pageNumber: data.pageNumber,
            pageSize: data.pageSize,
            totalElements: data.totalElements,
            totalPages: data.totalPages,
            lastPage: data.lastPage,
        });
        dispatch({ type: "IS_SUCCESS" });
    } catch (error) {
        console.log(error);
        dispatch({ 
            type: "IS_ERROR",
            payload: error?.response?.data?.message || "Failed to fetch dashboard products",
         });
    }
};


export const updateProductFromDashboard = 
    (sendData, toast, reset, setLoader, setOpen, isAdmin, queryString = "") => async (dispatch, getState) => {
    try {
        setLoader(true);
        const hasAdminAccess = resolveDashboardProductAccess(getState, isAdmin);
        const endpoint = hasAdminAccess ? "/admin/products/" : "/seller/products/";
        const requestConfig = getAuthRequestConfig(getState);
        
        await api.put(`${endpoint}${sendData.id}`, sendData, requestConfig);
        toast.success("Product update successful");
        reset();
        setLoader(false);
        setOpen(false);
        await dispatch(dashboardProductsAction(queryString, hasAdminAccess));
    } catch (error) {
        toast.error(error?.response?.data?.description || "Product update failed");
        setLoader(false);
    }
};



export const addNewProductFromDashboard = 
    (sendData, toast, reset, setLoader, setOpen, isAdmin, queryString = "") => async(dispatch, getState) => {
        try {
            setLoader(true);
            const hasAdminAccess = resolveDashboardProductAccess(getState, isAdmin);
            const endpoint = hasAdminAccess ? "/admin/categories/" : "/seller/categories/";
            const requestConfig = getAuthRequestConfig(getState);
            
            await api.post(`${endpoint}${sendData.categoryId}/product`,
                sendData,
                requestConfig
            );
            toast.success("Product created successfully");
            reset();
            setOpen(false);
            await dispatch(dashboardProductsAction(queryString, hasAdminAccess));
        } catch (error) {
            console.error(error);
            toast.error(error?.response?.data?.description || "Product creation failed");
        } finally {
            setLoader(false);
        }
    }

export const deleteProduct = 
    (setLoader, productId, toast, setOpenDeleteModal, isAdmin, queryString = "") => async (dispatch, getState) => {
    try {
        setLoader(true)
        const hasAdminAccess = resolveDashboardProductAccess(getState, isAdmin);
        const endpoint = hasAdminAccess ? "/admin/products/" : "/seller/products/";
        const requestConfig = getAuthRequestConfig(getState);
        
        await api.delete(`${endpoint}${productId}`, requestConfig);
        toast.success("Product deleted successfully");
        setLoader(false);
        setOpenDeleteModal(false);
        await dispatch(dashboardProductsAction(queryString, hasAdminAccess));
    } catch (error) {
        console.log(error);
        toast.error(
            error?.response?.data?.message || "Some Error Occured"
        )
    }
};


export const updateProductImageFromDashboard = 
    (formData, productId, toast, setLoader, setOpen, isAdmin, queryString = "") => async (dispatch, getState) => {
    try {
        setLoader(true);
        const hasAdminAccess = resolveDashboardProductAccess(getState, isAdmin);
        const endpoint = hasAdminAccess ? "/admin/products/" : "/seller/products/";
        const requestConfig = getAuthRequestConfig(getState);

        await api.put(`${endpoint}${productId}/image`, formData, requestConfig);
        toast.success("Image upload successful");
        setLoader(false);
        setOpen(false);
        await dispatch(dashboardProductsAction(queryString, hasAdminAccess));
    } catch (error) {
        toast.error(error?.response?.data?.description || "Product Image upload failed");
        setLoader(false);
    }
};

export const getAllCategoriesDashboard = (queryString) => async (dispatch) => {
  dispatch({ type: "CATEGORY_LOADER" });
  try {
    const searchParams = new URLSearchParams(queryString || "");
    const keyword = searchParams.get("keyword") || "";
    const requestedPage = Number(searchParams.get("pageNumber") || 0);

    if (keyword.trim()) {
        const { items, pageSize: serverPageSize } = await fetchAllPagesForSearch("/public/categories", null);
        const filtered = filterByFields(items, keyword, ["categoryName"]);
        const { page, ...pagination } = paginateFilteredResults(filtered, requestedPage, serverPageSize || DEFAULT_DASHBOARD_PAGE_SIZE);
        dispatch({ type: "FETCH_CATEGORIES", payload: page, ...pagination });
        dispatch({ type: "CATEGORY_SUCCESS" });
        return;
    }

    const { data } = await api.get(buildUrlWithQuery("/public/categories", queryString));
    dispatch({
      type: "FETCH_CATEGORIES",
      payload: data["content"],
      pageNumber: data["pageNumber"],
      pageSize: data["pageSize"],
      totalElements: data["totalElements"],
      totalPages: data["totalPages"],
      lastPage: data["lastPage"],
    });

    dispatch({ type: "CATEGORY_SUCCESS" });
  } catch (err) {
    console.log(err);

    dispatch({
      type: "IS_ERROR",
      payload: err?.response?.data?.message || "Failed to fetch categories",
    });
  }
};

export const createCategoryDashboardAction =
  (sendData, setOpen, reset, toast) => async (dispatch, getState) => {
    try {
      dispatch({ type: "CATEGORY_LOADER" });
      const requestConfig = getAuthRequestConfig(getState);
      
      await api.post("/admin/categories", sendData, requestConfig);
      dispatch({ type: "CATEGORY_SUCCESS" });
      reset();
      toast.success("Category Created Successful");
      setOpen(false);
      await dispatch(getAllCategoriesDashboard());
    } catch (err) {
      console.log(err);
      toast.error(
        err?.response?.data?.categoryName || "Failed to create new category"
      );

      dispatch({
        type: "IS_ERROR",
        payload: err?.response?.data?.message || "Internal Server Error",
      });
    }
  };

export const updateCategoryDashboardAction =
  (sendData, setOpen, categoryID, reset, toast) =>
  async (dispatch, getState) => {
    try {
      dispatch({ type: "CATEGORY_LOADER" });
      const requestConfig = getAuthRequestConfig(getState);

      await api.put(`/admin/categories/${categoryID}`, sendData, requestConfig);

      dispatch({ type: "CATEGORY_SUCCESS" });

      reset();
      toast.success("Category Update Successful");
      setOpen(false);
      await dispatch(getAllCategoriesDashboard());
    } catch (err) {
      console.log(err);
      toast.error(
        err?.response?.data?.categoryName || "Failed to update category"
      );

      dispatch({
        type: "IS_ERROR",
        payload: err?.response?.data?.message || "Internal Server Error",
      });
    }
  };

export const deleteCategoryDashboardAction =
  (setOpen, categoryID, toast) => async (dispatch, getState) => {
    try {
      dispatch({ type: "CATEGORY_LOADER" });
      const requestConfig = getAuthRequestConfig(getState);

      await api.delete(`/admin/categories/${categoryID}`, requestConfig);

      dispatch({ type: "CATEGORY_SUCCESS" });

      toast.success("Category Delete Successful");
      setOpen(false);
      await dispatch(getAllCategoriesDashboard());
    } catch (err) {
      console.log(err);
      toast.error(err?.response?.data?.message || "Failed to delete category");
      dispatch({
        type: "IS_ERROR",
        payload: err?.response?.data?.message || "Internal Server Error",
      });
    }
  };


  export const getAllSellersDashboard =
  (queryString) => async (dispatch, getState) => {
    try {
      dispatch({ type: "IS_FETCHING" });
      const searchParams = new URLSearchParams(queryString || "");
      const keyword = searchParams.get("keyword") || "";
      const requestedPage = Number(searchParams.get("pageNumber") || 0);

      if (keyword.trim()) {
          const { items, pageSize: serverPageSize } = await fetchAllPagesForSearch("/auth/sellers", null);
          const filtered = filterByFields(items, keyword, ["username", "email"]);
          const { page, ...pagination } = paginateFilteredResults(filtered, requestedPage, serverPageSize || DEFAULT_DASHBOARD_PAGE_SIZE);
          dispatch({ type: "GET_SELLERS", payload: page, ...pagination });
          dispatch({ type: "IS_SUCCESS" });
          return;
      }

      const { data } = await api.get(buildUrlWithQuery("/auth/sellers", queryString));
      dispatch({
        type: "GET_SELLERS",
        payload: data["content"],
        pageNumber: data["pageNumber"],
        pageSize: data["pageSize"],
        totalElements: data["totalElements"],
        totalPages: data["totalPages"],
        lastPage: data["lastPage"],
      });

      dispatch({ type: "IS_SUCCESS" });
    } catch (err) {
      console.log(err);
      dispatch({
        type: "IS_ERROR",
        payload: err?.response?.data?.message || "Failed to fetch sellers data",
      });
    }
  };

export const addNewDashboardSeller =
  (sendData, toast, reset, setOpen, setLoader) => async (dispatch) => {
    try {
      setLoader(true);
      await api.post("/auth/signup", sendData);
      reset();
      toast.success("Seller registered successfully!");

      await dispatch(getAllSellersDashboard());
    } catch (err) {
      console.log(err);
      toast.error(
        err?.response?.data?.message ||
          err?.response?.data?.password ||
          "Internal Server Error"
      );
    } finally {
      setLoader(false);
      setOpen(false);
    }
  };

// Authentication Actions
export const loginUser = (credentials, navigate, toast) => async (dispatch) => {
    try {
        dispatch({ type: "AUTH_LOADING" });
        const { data } = await api.post("/auth/signin", credentials);
        
        // Store user data in localStorage and Redux
        localStorage.setItem("auth", JSON.stringify(data));
        dispatch({ type: "LOGIN_USER", payload: data });
        
        toast.success("Login successful!");
        navigate("/");
    } catch (error) {
        const message = extractAuthErrorMessage(error);
        dispatch({ type: "AUTH_ERROR", payload: message });
        toast.error(message);
    }
};

export const registerUser = (userData, navigate, toast) => async (dispatch) => {
    try {
        dispatch({ type: "AUTH_LOADING" });
        const { data } = await api.post("/auth/signup", userData);
        
        toast.success(data.message || "Registration successful! Please login.");
        navigate("/login");
    } catch (error) {
        const message = extractAuthErrorMessage(error);
        dispatch({ type: "AUTH_ERROR", payload: message });
        toast.error(message);
    }
};

export const logoutUser = (navigate, toast) => async (dispatch) => {
    try {
        try {
            await api.delete("/ai/chat/history");
        } catch (chatError) {
            console.warn("Failed to clear chat history before logout:", chatError);
        }

        await api.post("/auth/signout");
        
        // Clear localStorage
        localStorage.removeItem("auth");
        localStorage.removeItem("cartItems");
        localStorage.removeItem("CHECKOUT_ADDRESS");
        localStorage.removeItem("PAYMENT_METHOD");
        localStorage.removeItem("SAVED_PAYMENT_METHODS");
        
        dispatch({ type: "LOG_OUT" });
        dispatch({ type: "CHAT_CLEAR" });
        toast.success("Logged out successfully!");
        navigate("/login");
    } catch (error) {
        // Even if backend fails, clear local state
        localStorage.removeItem("auth");
        localStorage.removeItem("cartItems");
        localStorage.removeItem("CHECKOUT_ADDRESS");
        localStorage.removeItem("PAYMENT_METHOD");
        localStorage.removeItem("SAVED_PAYMENT_METHODS");
        dispatch({ type: "LOG_OUT" });
        dispatch({ type: "CHAT_CLEAR" });
        navigate("/login");
    }
};

export const getCurrentUser = () => async (dispatch) => {
    try {
        const { data } = await api.get("/auth/user");
        dispatch({ type: "LOGIN_USER", payload: data });
        return data;
    } catch (error) {
        console.log("Failed to get current user:", error);
        // If token is invalid, clear auth state
        if (error.response?.status === 401) {
            localStorage.removeItem("auth");
            dispatch({ type: "LOG_OUT" });
        }
        throw error;
    }
};

export const refreshToken = () => async (dispatch) => {
    try {
        const { data } = await api.post("/auth/refresh");
        localStorage.setItem("auth", JSON.stringify(data));
        dispatch({ type: "LOGIN_USER", payload: data });
        return data;
    } catch (error) {
        console.log("Token refresh failed:", error);
        localStorage.removeItem("auth");
        dispatch({ type: "LOG_OUT" });
        throw error;
    }
};

// User Address Actions (Additional)

export const addUserAddress = (addressData, toast) => async (dispatch, getState) => {
    try {
        dispatch({ type: "AUTH_LOADING" });
        const config = getAuthRequestConfig(getState);
        if (!config) {
            throw new Error("Authentication required");
        }
        
        const candidates = getAddressPayloadCandidates(addressData);
        const response = await tryPostWithFallbackEndpoints(
            candidates.map(() => "/addresses"),
            candidates[0],
            config
        );
        
        // Refresh addresses list
        await dispatch(getUserAddresses());
        
        toast.success("Address added successfully!");
        return response.data;
    } catch (error) {
        const message = extractApiErrorMessage(error, "Failed to add address");
        dispatch({ type: "AUTH_ERROR", payload: message });
        toast.error(message);
        throw error;
    }
};

export const updateUserAddress = (addressId, addressData, toast) => async (dispatch, getState) => {
    try {
        dispatch({ type: "AUTH_LOADING" });
        const config = getAuthRequestConfig(getState);
        if (!config) {
            throw new Error("Authentication required");
        }
        
        const normalizedPayload = normalizeAddressPayload(addressData);
        const { data } = await api.put(`/addresses/${addressId}`, normalizedPayload, config);
        
        // Refresh addresses list
        await dispatch(getUserAddresses());
        
        toast.success("Address updated successfully!");
        return data;
    } catch (error) {
        const message = extractApiErrorMessage(error, "Failed to update address");
        dispatch({ type: "AUTH_ERROR", payload: message });
        toast.error(message);
        throw error;
    }
};



export const selectCheckoutAddress = (address) => (dispatch) => {
    localStorage.setItem("CHECKOUT_ADDRESS", JSON.stringify(address));
    dispatch({ type: "SELECT_CHECKOUT_ADDRESS", payload: address });
};

export const removeCheckoutAddress = () => (dispatch) => {
    localStorage.removeItem("CHECKOUT_ADDRESS");
    dispatch({ type: "REMOVE_CHECKOUT_ADDRESS" });
};

// User Orders Actions
export const getUserOrders = (queryString = "") => async (dispatch, getState) => {
    try {
        dispatch({ type: "IS_FETCHING" });
        const config = getAuthRequestConfig(getState);
        if (!config) {
            throw new Error("Authentication required");
        }

        const userOrderEndpoints = [
            "/order/users/orders",
            "/orders/users",
            "/users/orders",
            "/user/orders",
            "/order/user/orders",
        ].map((endpoint) => buildUrlWithQuery(endpoint, queryString));

        const { data } = await tryGetWithFallbackEndpoints(userOrderEndpoints, config);
        const orders = Array.isArray(data)
            ? data
            : Array.isArray(data?.content)
                ? data.content
                : Array.isArray(data?.orders)
                    ? data.orders
                    : Array.isArray(data?.data)
                        ? data.data
                        : [];

        const totalElements = typeof data?.totalElements === "number"
            ? data.totalElements
            : orders.length;

        const pageSize = typeof data?.pageSize === "number"
            ? data.pageSize
            : orders.length;

        const totalPages = typeof data?.totalPages === "number"
            ? data.totalPages
            : (orders.length > 0 ? 1 : 0);

        dispatch({
            type: "FETCH_USER_ORDERS",
            payload: orders,
            pageNumber: typeof data?.pageNumber === "number" ? data.pageNumber : 0,
            pageSize,
            totalElements,
            totalPages,
            lastPage: typeof data?.lastPage === "boolean" ? data.lastPage : true,
        });
        dispatch({ type: "IS_SUCCESS" });
        return { ...data, content: orders, totalElements, pageSize, totalPages };
    } catch (error) {
        console.log("Failed to fetch user orders:", error);
        const message = extractApiErrorMessage(error, "Failed to fetch orders");
        dispatch({ type: "IS_ERROR", payload: message });
        throw error;
    }
};

export const getUserOrderById = (orderId) => async (dispatch, getState) => {
    try {
        dispatch({ type: "IS_FETCHING" });
        const config = getAuthRequestConfig(getState);
        if (!config) {
            throw new Error("Authentication required");
        }

        const { data } = await api.get(`/order/users/orders/${orderId}`, config);
        dispatch({ type: "FETCH_USER_ORDER_DETAIL", payload: data });
        dispatch({ type: "IS_SUCCESS" });
        return data;
    } catch (error) {
        console.log("Failed to fetch user order detail:", error);
        const message = extractApiErrorMessage(error, "Failed to fetch order details");
        dispatch({ type: "IS_ERROR", payload: message });
        throw error;
    }
};

export const clearUserOrderDetail = () => ({
    type: "CLEAR_USER_ORDER_DETAIL",
});

export const reorderItems = (orderId, navigate, toast) => async (dispatch, getState) => {
    try {
        dispatch({ type: "IS_FETCHING" });
        
        // This would typically fetch order details and add items to cart
        // For now, we'll just show a success message
        toast.success("Items added to cart successfully!");
        navigate("/cart");
        
        dispatch({ type: "IS_SUCCESS" });
    } catch (error) {
        console.log("Failed to reorder items:", error);
        const message = extractApiErrorMessage(error, "Failed to reorder items");
        dispatch({ type: "IS_ERROR", payload: message });
        toast.error(message);
    }
};

// Admin Actions for User Management
export const getAllSellers = (pageNumber = 0, toast) => async (dispatch, getState) => {
    try {
        dispatch({ type: "AUTH_LOADING" });
        const config = getAuthRequestConfig(getState);
        if (!config) {
            throw new Error("Authentication required");
        }
        
        const { data } = await api.get(`/auth/sellers?pageNumber=${pageNumber}`, config);
        dispatch({ type: "FETCH_SELLERS", payload: data });
        return data;
    } catch (error) {
        const message = extractApiErrorMessage(error, "Failed to fetch sellers");
        dispatch({ type: "AUTH_ERROR", payload: message });
        if (toast) {
            toast.error(message);
        }
        throw error;
    }
};


// ==================== AI CHAT ACTIONS ====================

export const sendChatMessage = (message) => async (dispatch, getState) => {
    dispatch({ type: "CHAT_ADD_USER_MESSAGE", payload: message });
    dispatch({ type: "CHAT_LOADING" });

    try {
        const requestConfig = getAuthRequestConfig(getState);
        if (!requestConfig) {
            dispatch({
                type: "CHAT_ERROR",
                payload: "Please log in to use the AI assistant.",
            });
            return;
        }

        const { data } = await api.post("/ai/chat", { message }, requestConfig);
        dispatch({ type: "CHAT_RESPONSE", payload: data });
    } catch (error) {
        dispatch({
            type: "CHAT_ERROR",
            payload: extractApiErrorMessage(error, "Failed to get AI response. Please try again."),
        });
    }
};

export const clearChatHistory = () => async (dispatch, getState) => {
    try {
        const requestConfig = getAuthRequestConfig(getState);
        if (requestConfig) {
            await api.delete("/ai/chat/history", requestConfig);
        }
    } catch (error) {
        console.warn("Failed to clear server chat history:", error);
    }
    dispatch({ type: "CHAT_CLEAR" });
};

export const toggleChat = () => ({ type: "CHAT_TOGGLE" });
