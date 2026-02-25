import axios from 'axios';

export const fetchProductsAction = () => async (dispatch) => {
    try {
        dispatch({ type: "IS_FETCHING" });
        
        const response = await axios.get(
            `${import.meta.env.VITE_API_PUBLIC_BASE_URL}/products`,
            {
                withCredentials: true,
                headers: {
                    "Content-Type": "application/json",
                },
            }
        );
        
        console.log("Products fetched successfully:", response.data);
        
        // Handle different API response formats
        let productsArray = [];
        let pagination = {};
        
        if (Array.isArray(response.data)) {
            productsArray = response.data;
        } else if (response.data?.data && Array.isArray(response.data.data)) {
            productsArray = response.data.data;
        } else if (response.data?.content && Array.isArray(response.data.content)) {
            productsArray = response.data.content;
            // Extract pagination info if available
            pagination = {
                pageNumber: response.data.pageNumber,
                pageSize: response.data.pageSize,
                totalElements: response.data.totalElements,
                totalPages: response.data.totalPages,
                lastPage: response.data.lastPage,
            };
        } else if (response.data?.products && Array.isArray(response.data.products)) {
            productsArray = response.data.products;
        } else {
            console.warn("Unable to find products array in response");
        }
        
        dispatch({
            type: "FETCH_PRODUCTS",
            payload: productsArray,
            pageNumber: pagination.pageNumber || 0,
            pageSize: pagination.pageSize || 10,
            totalElements: pagination.totalElements || productsArray.length,
            totalPages: pagination.totalPages || 1,
            lastPage: pagination.lastPage || true,
        });
        
        dispatch({ type: "IS_SUCCESS" });
    } catch (error) {
        console.error("Error fetching products:", error);
        const errorMsg = error.response?.data?.message || error.message || "Failed to fetch products";
        console.log("Dispatching IS_ERROR with message:", errorMsg);
        dispatch({
            type: "IS_ERROR",
            payload: errorMsg,
        });
    }
};
