import { useState } from "react";
import { FiArrowUp, FiRefreshCw, FiSearch } from "react-icons/fi";
import { FormControl, InputLabel, Select, MenuItem, Tooltip } from "@mui/material";

const Filter = () => {
    const categories = [
        {categoryId: 1, categoryName: "Electronics"},
        {categoryId: 2, categoryName: "Clothing"},
        {categoryId: 3, categoryName: "Home & Kitchen"},
        {categoryId: 4, categoryName: "Books"},
        {categoryId: 5, categoryName: "Toys & Games"},
        {categoryId: 6, categoryName: "Sports & Outdoors"},
    ];

    const [category, setCategory] = useState("all");

    const handleCategoryChange = (e) => {
        setCategory(e.target.value);
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
                        className="w-full border border-gray-300 rounded-lg px-12 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-500"
                    />
                </div>

                {/* CATEGORY FILTER & SORT BUTTON - Right Side */}
                <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center flex-shrink-0">
                    <FormControl variant="outlined" size="small" className="w-full sm:w-40">
                        <InputLabel>Category</InputLabel>
                        <Select 
                            labelId="category-select-label" 
                            value={category} 
                            onChange={handleCategoryChange}
                            label="Category"
                        >
                            <MenuItem value="all">All Categories</MenuItem>
                            {categories.map((cat) => (
                                <MenuItem key={cat.categoryId} value={cat.categoryName}>
                                    {cat.categoryName}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    {/* SORT BUTTON */}
                    <Tooltip title="Sort by price: ascending">
                        <button className="flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium h-10 whitespace-nowrap">
                            Sort By
                            <FiArrowUp size={18}/>  
                        </button>
                    </Tooltip>
                    <button className="flex items-center gap-2 px-4 py-2 bg-rose-900 text-white rounded-lg transition-colors duration-300 ease-in shadow-md focus:outline-none">
                        <FiRefreshCw size={16} />
                        <span className="font-semibold">Clear Filters</span></button>
                    
                </div>
            </div>
        </div>
    );
}

export default Filter;