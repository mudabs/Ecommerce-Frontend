const initialState = {
    products: null,
    categories: null,
    pagination: {},
    selectedProduct: null,
    reviews: [],
    reviewsPagination: {},
    averageRating: null,
    reviewCount: 0,
    similarProducts: [],
};

export const productReducer = (state = initialState, action) => {
    switch (action.type) {
        case "FETCH_PRODUCTS":
            return {
                ...state,
                products: action.payload,
                pagination: {
                    ...state.pagination,
                    pageNumber: action.pageNumber,
                    pageSize: action.pageSize,
                    totalElements: action.totalElements,
                    totalPages: action.totalPages,
                    lastPage: action.lastPage,
                },
            };

        case "FETCH_CATEGORIES":
            return {
                ...state,
                categories: action.payload,
                pagination: {
                    ...state.pagination,
                    pageNumber: action.pageNumber,
                    pageSize: action.pageSize,
                    totalElements: action.totalElements,
                    totalPages: action.totalPages,
                    lastPage: action.lastPage,
                },
            };

        case "FETCH_PRODUCT_BY_ID":
            return { ...state, selectedProduct: action.payload };

        case "FETCH_PRODUCT_REVIEWS":
            return {
                ...state,
                reviews: action.payload,
                averageRating: action.averageRating,
                reviewCount: action.reviewCount,
                reviewsPagination: {
                    pageNumber: action.pageNumber,
                    totalPages: action.totalPages,
                    lastPage: action.lastPage,
                },
            };

        case "FETCH_SIMILAR_PRODUCTS":
            return { ...state, similarProducts: action.payload };
    
        default:
            return state;
    }
};