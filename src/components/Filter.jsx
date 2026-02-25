import { useState } from "react";
import { FiSearch } from "react-icons/fi";
import { FormControl, InputLabel, Select, MenuItem } from "@mui/material";

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
        <div className="py-6 lg:pb-8">
            <div className="flex lg:flex-row flex-col-reverse lg:justify-between justify-center items-center gap-4">
                {/* SEARCH BAR                                 */}
                <div className="relative flex items-center w-full lg:w-96">
                    <FiSearch className="absolute left-4 text-slate-600 text-lg" />
                    <input
                        type="text"
                        placeholder="Search products..."
                        className="w-full border border-gray-300 rounded-lg px-12 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-500"
                    />
                </div>
                <div className="flex sm:flex-row flex-col gap-4 items-center">
                    <FormControl variant="outlined" size="small">
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
                </div>
            </div>
        </div>
    );
}

export default Filter;