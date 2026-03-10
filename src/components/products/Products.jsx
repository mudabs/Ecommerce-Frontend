import { FaExclamationTriangle } from "react-icons/fa";
import ProductCard from "../shared/ProductCard";
import { useSelector } from "react-redux";
import { useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import useProductFilter from "../../hooks/useProductFilter";
import Filter from "./Filter";
import Pagination from "../shared/Pagination";

const Products = () => {
    // Use the custom hook to handle filtering
    useProductFilter();
    
    const { isLoading, errorMessage } = useSelector((state) => state.errors);
    const { filteredProducts, products, pagination, isServerPaginated } = useSelector((state) => state.product);
    const [searchParams, setSearchParams] = useSearchParams();

    // Use filtered products if available, otherwise use raw products
    const displayProducts = isServerPaginated ? products : (filteredProducts || products);
    const pageSizeParam = Number(searchParams.get("pageSize") || "");
    const pageSize = Number.isFinite(pageSizeParam) && pageSizeParam > 0
        ? pageSizeParam
        : (pagination?.pageSize || 2);
    const totalItems = displayProducts?.length || 0;
    const totalElements = pagination?.totalElements || totalItems;
    const computedServerPages = Math.max(1, Math.ceil(totalElements / pageSize));
    const totalPages = isServerPaginated
        ? (pagination?.totalPages || computedServerPages)
        : Math.max(1, Math.ceil(totalItems / pageSize));
    const pageParam = Number(searchParams.get("page") || "1");
    const currentPage = Number.isFinite(pageParam) && pageParam > 0 ? pageParam : 1;
    const safePage = Math.min(currentPage, totalPages);

    const paginatedProducts = useMemo(() => {
        if (!displayProducts?.length) return [];
        if (isServerPaginated) return displayProducts;
        const startIndex = (safePage - 1) * pageSize;
        return displayProducts.slice(startIndex, startIndex + pageSize);
    }, [displayProducts, pageSize, safePage, isServerPaginated]);

    useEffect(() => {
        if (currentPage !== safePage) {
            const nextParams = new URLSearchParams(searchParams);
            nextParams.set("page", String(safePage));
            setSearchParams(nextParams);
        }
    }, [currentPage, safePage, searchParams, setSearchParams]);

    const handlePageChange = (page) => {
        const nextPage = Math.min(Math.max(1, page), totalPages);
        const nextParams = new URLSearchParams(searchParams);
        nextParams.set("page", String(nextPage));
        setSearchParams(nextParams);
    };

    const handlePageSizeChange = (size) => {
        const nextParams = new URLSearchParams(searchParams);
        nextParams.set("pageSize", String(size));
        nextParams.set("page", "1");
        setSearchParams(nextParams);
    };

    return(
        <div className="lg:px-14 sm:px-8 px-4 2xl:w-[90%] 2xl:mx-auto">
            {/* This checks if loading, else errorMessage else displays the products */}
            <Filter />
            {isLoading ? (
                <div className="min-h-175" aria-busy="true" />
            ) : errorMessage ? (
                <div className="flex justify-center items-center h-50">
                    <FaExclamationTriangle className="text-slate-800 text-3xl mr-2" />
                    <span className="text-slate-800 text-lg font-medium">
                        {errorMessage}
                    </span>
                </div>
            ) : (
                <div className="min-h-175">
                    {displayProducts?.length ? (
                        <>
                            <div className="pb-6 pt-14 grid 2xl:grid-cols-4 lg:grid-cols-3 sm:grid-cols-2 gap-y-6 gap-x-6">
                                {paginatedProducts.map((item, i) => <ProductCard key={i} {...item}/>) }
                            </div>
                            <Pagination
                                currentPage={safePage}
                                totalPages={totalPages}
                                onPageChange={handlePageChange}
                                pageSize={pageSize}
                                onPageSizeChange={handlePageSizeChange}
                            />
                        </>
                    ) : (
                        <div className="py-14 text-center text-gray-600">
                            No products found.
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}

export default Products;
