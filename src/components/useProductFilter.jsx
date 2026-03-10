import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchProductsAction, filterAndSortProducts } from "../store/actions";

const useProductFilter = () => {
    const [searchParams] = useSearchParams();
    const dispatch = useDispatch();
    const { products, isServerPaginated, pagination } = useSelector((state) => state.product);

    const searchTerm = searchParams.get("searchTerm") || "";
    const category = searchParams.get("category") || null;
    const sortOrder = searchParams.get("sortOrder") || "asc";
    const pageParam = Number(searchParams.get("page") || "1");
    const currentPage = Number.isFinite(pageParam) && pageParam > 0 ? pageParam : 1;
    const pageSize = pagination?.pageSize || 2;

    // Fetch products when filters/page change (server can paginate)
    useEffect(() => {
        const params = new URLSearchParams();
        params.set("pageNumber", String(Math.max(0, currentPage - 1)));
        params.set("pageSize", String(pageSize));
        if (searchTerm.trim() !== "") params.set("searchTerm", searchTerm.trim());
        if (category && category !== "all") params.set("category", category);
        if (sortOrder) params.set("sortOrder", sortOrder);

        dispatch(fetchProductsAction(params.toString()));
    }, [dispatch, searchTerm, category, sortOrder, currentPage, pageSize]);

    // Apply client-side filtering based on URL params
    useEffect(() => {
        if (!products || isServerPaginated) return;

        const filters = { 
            searchTerm, 
            category, 
            sortOrder 
        };
        
        dispatch(filterAndSortProducts(products, filters));

    }, [dispatch, products, isServerPaginated, searchTerm, category, sortOrder]);

    return {
        sortOrder,
        category,
        searchTerm,
    };
};

export default useProductFilter;
