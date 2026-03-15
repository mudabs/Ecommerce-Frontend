// Central export file for all Redux actions
export { fetchProductsAction, fetchCategories } from './productActions';
export { filterAndSortProducts } from './filterActions';
export {
	addToCart,
	updateCartQuantity,
	incrementCartQuantity,
	decrementCartQuantity,
	removeFromCart,
	clearCart,
} from './cartActions';