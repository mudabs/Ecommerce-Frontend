import axios from 'axios';
import api from '../../api/api';

export const fetchProductsAction = (queryString = "") => async (dispatch) => {
    try {
        dispatch({ type: "IS_FETCHING" });
        
        const url = queryString 
            ? `${import.meta.env.VITE_API_PUBLIC_BASE_URL}/products?${queryString}`
            : `${import.meta.env.VITE_API_PUBLIC_BASE_URL}/products`;
        
        const response = await axios.get(url, {
            withCredentials: true,
            headers: {
                "Content-Type": "application/json",
            },
        });
        
        // Handle different API response formats
        let productsArray = [];
        let pagination = {};
        let isServerPaginated = false;
        
        if (Array.isArray(response.data)) {
            productsArray = response.data;
        } else if (response.data?.data && Array.isArray(response.data.data)) {
            productsArray = response.data.data;
        } else if (response.data?.content && Array.isArray(response.data.content)) {
            productsArray = response.data.content;
            isServerPaginated = true;
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
        }
        
        dispatch({
            type: "FETCH_PRODUCTS",
            payload: productsArray,
            pageNumber: pagination.pageNumber ?? 0,
            pageSize: pagination.pageSize ?? 2,
            totalElements: pagination.totalElements ?? productsArray.length,
            totalPages: pagination.totalPages ?? 1,
            lastPage: pagination.lastPage ?? true,
            isServerPaginated,
        });
        
        dispatch({ type: "IS_SUCCESS" });
    } catch (error) {
        const errorMsg = error.response?.data?.message || error.message || "Failed to fetch products";
        dispatch({
            type: "IS_ERROR",
            payload: errorMsg,
        });
    }
};

export const fetchCategories = () => async (dispatch) => {
    try {
        dispatch({ type: "IS_FETCHING" });
        const { data } = await api.get(`/public/categories`);
        dispatch({
            type: "FETCH_CATEGORIES",
            payload: data,
        });
        dispatch({ type: "IS_SUCCESS" });
    } catch (error) {
        const errorMsg = error?.response?.data?.message || "Failed to fetch categories";
        dispatch({
            type: "IS_ERROR",
            payload: errorMsg,
        });
    }
};
