// Client-side filtering and sorting actions
export const filterAndSortProducts = (products, filters) => (dispatch) => {
    let filtered = [...(products || [])];

    // Apply search filter with trimming and better text matching
    if (filters.searchTerm && filters.searchTerm.trim() !== "") {
        const searchTermLower = filters.searchTerm.trim().toLowerCase();
        // Split search term into words for more flexible matching
        const searchWords = searchTermLower.split(/\s+/).filter(word => word.length > 0);
        
        filtered = filtered.filter(product => {
            const name = (product.name || "").toLowerCase();
            const description = (product.description || "").toLowerCase();
            const combined = `${name} ${description}`;
            
            // Match if ALL search words are found anywhere in the text (substring matching)
            return searchWords.every(word => combined.includes(word));
        });
    }

    // Apply category filter
    if (filters.category && filters.category !== "all") {
        filtered = filtered.filter(product =>
            product.category?.categoryName === filters.category ||
            product.category === filters.category
        );
    }

    // Apply sorting - ALWAYS sort by sortOrder
    const sortOrder = filters.sortOrder || "asc";
    filtered.sort((a, b) => {
        const priceA = parseFloat(a.price) || 0;
        const priceB = parseFloat(b.price) || 0;
        return sortOrder === "asc" ? priceA - priceB : priceB - priceA;
    });

    dispatch({
        type: "SET_FILTERED_PRODUCTS",
        payload: filtered,
    });
};
