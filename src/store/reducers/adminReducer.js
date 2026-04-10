const initialState = {
    analytics: {},
    dashboardOrders: [],
};

export const adminReducer = (state = initialState, action) => {
    switch (action.type) {
        case "FETCH_ANALYTICS":
            return {
                ...state,
                analytics: action.payload,
            };
        case "FETCH_DASHBOARD_ORDERS":
            return {
                ...state,
                dashboardOrders: action.payload,
            };
            
        default:
            return state;
    }
};

