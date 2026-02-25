const initialState = {
    products: null,
    filteredProducts: null,
    categories: null,
    pagination: {},
};

export const ProductReducer = (state = initialState, action) => {
    switch (action.type) {
        case "FETCH_PRODUCTS":
            return {
                ...state,
                products: action.payload,
                filteredProducts: action.payload, // Reset filtered when fetching
                pagination: {
                    ...state.pagination,
                    pageNumber: action.pageNumber,
                    pageSize: action.pageSize,
                    totalElements: action.totalElements,
                    totalPages: action.totalPages,
                    lastPage: action.lastPage,
                },
            };
        case "SET_FILTERED_PRODUCTS":
            return {
                ...state,
                filteredProducts: action.payload,
            };
        default:
            return state;
    }   
};