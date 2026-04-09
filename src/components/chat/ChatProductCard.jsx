import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { addToCart } from "../../store/actions";
import { formatPrice } from "../../utils/formatPrice";
import { getBackendImageUrl, handleImageLoadError } from "../../utils/env";
import toast from "react-hot-toast";

const ChatProductCard = ({ product }) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const handleAddToCart = (e) => {
        e.stopPropagation();
        dispatch(addToCart(product, 1, toast));
    };

    const handleOpenProduct = () => {
        navigate(`/products/${product.productId}`);
    };

    const price = product.specialPrice ?? product.price;
    const hasDiscount = product.discount && product.discount > 0;

    return (
        <div
            onClick={handleOpenProduct}
            role="link"
            tabIndex={0}
            onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && handleOpenProduct()}
            className="flex items-center gap-3 bg-white border border-gray-200 rounded-lg p-2.5 shadow-sm hover:shadow-md transition cursor-pointer"
        >
            {product.image && (
                <img
                    src={getBackendImageUrl(product.image)}
                    alt={product.productName}
                    onError={handleImageLoadError}
                    className="w-14 h-14 object-cover rounded-md shrink-0"
                />
            )}
            <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 truncate">{product.productName}</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="text-sm font-semibold text-custom-blue">{formatPrice(price)}</span>
                    {hasDiscount && (
                        <>
                            <span className="text-xs text-gray-400 line-through">{formatPrice(product.price)}</span>
                            <span className="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full font-medium">
                                -{product.discount}%
                            </span>
                        </>
                    )}
                </div>
            </div>
            <button
                onClick={handleAddToCart}
                className="text-xs px-2.5 py-1.5 bg-custom-blue text-white rounded-md hover:bg-blue-700 transition shrink-0"
            >
                Add
            </button>
        </div>
    );
};

export default ChatProductCard;
