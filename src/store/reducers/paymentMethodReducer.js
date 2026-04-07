const initialState = {
    paymentMethod: null,
};

export const paymentMethodReducer = (state = initialState, action) => {
    switch (action.type) {
        case "ADD_PAYMENT_METHOD":
            return {
                ...state,
                paymentMethod: action.payload,
            };
        case "REMOVE_PAYMENT_METHOD":
            return {
                ...state,
                paymentMethod: null,
            };
        case "LOG_OUT":
            return initialState;
        default:
            return state;
    }
};