const initialState = {
    adminOrder: null,
    userOrders: null,
    selectedUserOrder: null,
    pagination: {},
    userPagination: {},
};

export const orderReducer = (state = initialState, action) => {
    switch (action.type) {
        case "GET_ADMIN_ORDERS":
            return {
                ...state,
                adminOrder: action.payload,
                pagination: {
                    ...state.pagination,
                    pageNumber: action.pageNumber,
                    pageSize: action.pageSize,
                    totalElements: action.totalElements,
                    totalPages: action.totalPages,
                    lastPage: action.lastPage,
                },
            };
        case "FETCH_USER_ORDERS":
            return {
                ...state,
                userOrders: action.payload,
                userPagination: {
                    ...state.userPagination,
                    pageNumber: action.pageNumber,
                    pageSize: action.pageSize,
                    totalElements: action.totalElements,
                    totalPages: action.totalPages,
                    lastPage: action.lastPage,
                },
            };
        case "FETCH_USER_ORDER_DETAIL":
            return {
                ...state,
                selectedUserOrder: action.payload,
            };
        case "CLEAR_USER_ORDER_DETAIL":
            return {
                ...state,
                selectedUserOrder: null,
            };
        default:
            return state;
    }
};