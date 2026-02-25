import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchProductsAction, filterAndSortProducts } from "../store/actions";

const useProductFilter = () => {
    const [searchParams] = useSearchParams();
    const dispatch = useDispatch();
    const { products } = useSelector((state) => state.product);

    // Fetch ALL products once on mount
    useEffect(() => {
        dispatch(fetchProductsAction());
    }, [dispatch]);

    // Apply client-side filtering based on URL params
    useEffect(() => {
        if (!products) return;

        const searchTerm = searchParams.get("searchTerm") || "";
        const category = searchParams.get("category") || null;
        const sortOrder = searchParams.get("sortOrder") || "asc";

        const filters = { 
            searchTerm, 
            category, 
            sortOrder 
        };
        
        dispatch(filterAndSortProducts(products, filters));

    }, [dispatch, products, searchParams]);

    return {
        sortOrder: searchParams.get("sortOrder") || "asc",
        category: searchParams.get("category") || null,
        searchTerm: searchParams.get("searchTerm") || null,
    };
};

export default useProductFilter;