import { FaExclamationTriangle } from "react-icons/fa";
import ProductCard from "./ProductCard";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchProductsAction } from "../store/actions/productActions";
import Filter from "./Filter";

const Products = () => {
    const dispatch = useDispatch();
    const { isLoading, errorMessage } = useSelector((state) => state.errors);
    const { products } = useSelector((state) => state.product);

    console.log("Products component state:", { isLoading, errorMessage, products });

    useEffect(() => {
        dispatch(fetchProductsAction());
    }, [dispatch]);
    return(
        <div className="lg:px-14 sm:px-8 px-4 2xl:w-[90%] 2xl:mx-auto">
            {/* This checks if loading, else errorMessage else displays the products */}
            <Filter />
            {isLoading ? (
                <p>It is Loading...</p>
            ) : errorMessage ? (
                <div className="flex justify-center items-center h-50">
                    <FaExclamationTriangle className="text-slate-800 text-3xl mr-2" />
                    <span className="text-slate-800 text-lg font-medium">
                        {errorMessage}
                    </span>
                </div>
            ) : (
                <div className="min-h-175">
                    {products?.length ? (
                        <div className="pb-6 pt-14 grid 2xl:grid-cols-4 lg:grid-cols-3 sm:grid-cols-2 gap-y-6 gap-x-6">
                            {products.map((item, i) => <ProductCard key={i} {...item}/>) }
                        </div>
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