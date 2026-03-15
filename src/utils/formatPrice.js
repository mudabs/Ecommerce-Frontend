export const formatPrice = (price = 0) => {
    const safePrice = Number(price);
    const value = Number.isFinite(safePrice) ? safePrice : 0;

    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 2,
    }).format(value);
};
