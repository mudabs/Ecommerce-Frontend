import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchProductsAction, sortProducts } from "../store/actions";

const useProductFilter = () => {
    const [searchParams] = useSearchParams();
    const dispatch = useDispatch();
    const { products } = useSelector((state) => state.product);

    // Build query string and fetch filtered products from backend
    useEffect(() => {
        const searchTerm = searchParams.get("searchTerm") || "";
        const category = searchParams.get("category") || "";

        let queryString = "";
        if (searchTerm.trim()) {
            queryString += `keyword=${encodeURIComponent(searchTerm.trim())}&`;
        }
        if (category && category !== "all") {
            queryString += `category=${encodeURIComponent(category)}&`;
        }
        // Remove trailing &
        queryString = queryString.slice(0, -1);

        dispatch(fetchProductsAction(queryString));
    }, [dispatch, searchParams]);

    // Apply client-side sorting
    useEffect(() => {
        if (!products) return;

        const sortOrder = searchParams.get("sortOrder") || "asc";
        dispatch(sortProducts(products, sortOrder));
    }, [dispatch, products, searchParams]);

    return {
        sortOrder: searchParams.get("sortOrder") || "asc",
        category: searchParams.get("category") || null,
        searchTerm: searchParams.get("searchTerm") || null,
    };
};

export default useProductFilter;