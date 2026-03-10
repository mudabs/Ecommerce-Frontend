import { useEffect, useRef, useState } from "react";
import { FiArrowUp, FiArrowDown, FiRefreshCw, FiSearch } from "react-icons/fi";
import { FormControl, InputLabel, Select, MenuItem, Tooltip, Button } from "@mui/material";
import { useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchCategories } from "../../store/actions";
import Loader from "../shared/Loader";

const Filter = () => {
    const dispatch = useDispatch();
    const categories = Array.isArray(useSelector(state => state.product.categories)) ? useSelector(state => state.product.categories) : [];
    const loading = useSelector(state => state.product.loading);
    const error = useSelector(state => state.product.error);

    const [searchParams, setSearchParams] = useSearchParams();

    const [category, setCategory] = useState("all");
    const [sortOrder, setSortOrder] = useState("asc");
    const [searchTerm, setSearchTerm] = useState("");
    const lastSearchTermRef = useRef("");

    useEffect(() => {
        dispatch(fetchCategories());
    }, [dispatch]);

    useEffect(() => {
        const currentCategory = searchParams.get("category") || "all";
        const sortOrder = searchParams.get("sortOrder") || "asc";
        const searchTerm = searchParams.get("searchTerm") || "";

        setCategory(currentCategory);
        setSortOrder(sortOrder);
        setSearchTerm(searchTerm);
        lastSearchTermRef.current = searchTerm;
    }, [searchParams]);

    // Debounce search term to update URL with delay
    useEffect(() => {
        if (lastSearchTermRef.current === searchTerm) return;
        const delayTimer = setTimeout(() => {
            const newParams = new URLSearchParams(searchParams);
            if (searchTerm.trim() === "") {
                newParams.delete("searchTerm");
            } else {
                newParams.set("searchTerm", searchTerm);
            }
            newParams.set("page", "1");
            setSearchParams(newParams);
            lastSearchTermRef.current = searchTerm;
        }, 500); // 500ms delay

        return () => clearTimeout(delayTimer);
    }, [searchTerm, searchParams, setSearchParams]);

    const handleCategoryChange = (e) => {
        const selectedCategory = e.target.value;
        const newParams = new URLSearchParams(searchParams);
        if (selectedCategory === "all") {
            newParams.delete("category");
        } else {
            newParams.set("category", selectedCategory);
        }
        newParams.set("page", "1");
        setSearchParams(newParams);
        setCategory(e.target.value);
    };

    const handleClearFilters = () => {
        const newParams = new URLSearchParams();
        const pageSize = searchParams.get("pageSize");
        if (pageSize) {
            newParams.set("pageSize", pageSize);
        }
        newParams.set("page", "1");
        setSearchParams(newParams);
        setCategory("all");
        setSearchTerm("");
    };

    const toggleSortOrder = (e) => {
        const newOrder = (sortOrder === "asc" ? "desc" : "asc");
        const newParams = new URLSearchParams(searchParams);
        newParams.set("sortOrder", newOrder);
        newParams.set("page", "1");
        setSearchParams(newParams);
        setSortOrder(newOrder);
    };

    return(
        <div className="py-4 lg:py-6">
            <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center sm:justify-between w-full">
                {/* SEARCH BAR */}
                <div className="relative flex items-center w-full sm:w-80 md:w-96">
                    <FiSearch className="absolute left-4 text-slate-600 text-lg pointer-events-none" />
                    <input
                        type="text"
                        placeholder="Search products..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-12 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-500"
                    />
                </div>

                {/* CATEGORY FILTER & SORT BUTTON - Right Side */}
                <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center shrink-0">
                    <FormControl variant="outlined" size="small" className="w-full sm:w-40">
                        <InputLabel>Category</InputLabel>
                        <Select 
                            labelId="category-select-label" 
                            value={category} 
                            onChange={handleCategoryChange}
                            label="Category"
                        >
                            <MenuItem value="all">All Categories</MenuItem>
                            {loading && (
                                <MenuItem disabled>
                                    <Loader text="Loading categories..." height={15} width={15} />
                                </MenuItem>
                            )}
                            {error && (
                                <MenuItem disabled>
                                    <span style={{ color: 'red' }}>Failed to load categories</span>
                                </MenuItem>
                            )}
                            {categories.map((cat) => (
                                <MenuItem key={cat.categoryId} value={cat.categoryName}>
                                    {cat.categoryName}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    {/* SORT BUTTON */}
                    <Tooltip title={`Sort by price: ${sortOrder === "asc" ? "ascending" : "descending"}`}>
                        <Button variant="contained" 
                            onClick={toggleSortOrder}  
                            color="primary"
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg transition-colors duration-300 ease-in shadow-md focus:outline-none">
                            Sort By
                            {sortOrder === "asc" ? (<FiArrowUp size={20}/>) : (<FiArrowDown size={20}/>)} 
                        </Button>
                    </Tooltip>
                    <button 
                        onClick={handleClearFilters}
                        className="flex items-center gap-2 px-4 py-2 bg-rose-900 text-white rounded-lg transition-colors duration-300 ease-in shadow-md focus:outline-none hover:bg-rose-800">
                        <FiRefreshCw className="font-semibold" size={16} />
                        <span className="font-semibold">Clear Filters</span>
                    </button>
                    
                </div>
            </div>
        </div>
    );
}

export default Filter;
