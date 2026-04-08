import { useState } from "react";
import ProductViewModal from "./ProductViewModal";
import truncateText from "../../utils/truncateText";
import { useDispatch } from "react-redux";
import { addToCart } from "../../store/actions";
import toast from "react-hot-toast";
import { getBackendImageUrl, handleImageLoadError } from "../../utils/env";
import { useNavigate } from "react-router-dom";

const ProductCard = ({
        productId,
        productName,
        image,
        description,
        quantity,
        price,
        discount,
        specialPrice,
        about = false,
}) => {
    const [openProductViewModal, setOpenProductViewModal] = useState(false);
    const btnLoader = false;
    const [selectedViewProduct, setSelectedViewProduct] = useState("");
    const isAvailable = quantity && Number(quantity) > 0;
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const handleProductView = () => {
        if (!about && productId) {
            navigate(`/products/${productId}`);
        }
    };

    const addToCartHandler = (cartItems) => {
        dispatch(addToCart(cartItems, 1, toast));
    };

    return (
        <div className="border border-slate-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300">
            <div onClick={handleProductView} 
                    className="w-full h-48 overflow-hidden bg-white flex items-center justify-center">
                <img 
                className="w-full h-full object-contain cursor-pointer transition-transform duration-300 transform hover:scale-105"
                src={getBackendImageUrl(image)}
                onError={handleImageLoadError}
                alt={productName}>
                </img>
            </div>
            <div className="p-4">
                <h2 onClick={handleProductView}
                    className="text-lg font-semibold mb-2 cursor-pointer">
                    {truncateText(productName, 50)}
                </h2>
                
                <div className="min-h-20 max-h-20">
                    <p className="text-gray-600 text-sm">
                        {truncateText(description, 80)}
                    </p>
                </div>

            { !about && (
                <div className="flex items-center justify-between mt-2">
                {specialPrice ? (
                    <div className="flex flex-col">
                        <span className="text-gray-400 line-through">
                            ${Number(price).toFixed(2)}
                        </span>
                        <span className="text-gray-800 font-bold">
                            ${Number(specialPrice).toFixed(2)}
                        </span>
                    </div>
                ) : (
                    <span className="text-gray-800 font-bold">
                        {" "}
                        ${Number(price).toFixed(2)}
                    </span>
                )}

                <button
                    disabled={!isAvailable || btnLoader}
                    type="button"
                    onClick={() => addToCartHandler({
                        image,
                        productName,
                        description,
                        specialPrice,
                        price,
                        productId,
                        quantity,
                    })}
                    aria-label={`Add ${productName} to cart`}
                    className={`bg-blue-500 ${isAvailable ? "opacity-100 hover:brightness-95" : "opacity-70"} 
                        text-white py-2 px-3 rounded-full mt-4 transition-colors duration-300 w-36 flex justify-center`}
                >
                    {isAvailable ? "Add to Cart" : "Out of Stock"}
                </button>
                </div>
            )}
                
            </div>
            <ProductViewModal 
                open={openProductViewModal}
                setOpen={setOpenProductViewModal}
                product={selectedViewProduct}
                isAvailable={isAvailable}
            />
        </div>
    )
}

export default ProductCard;