import { useState } from "react";
import { useEffect } from "react";
import { HiOutlineTrash } from "react-icons/hi";
import SetQuantity from "./SetQuantity";
import { useDispatch } from "react-redux";
import { decrementCartQuantity, incrementCartQuantity, removeFromCart } from "../../store/actions";
import { formatPrice } from "../../utils/formatPrice";
import truncateText from "../../utils/truncateText";
import { getImageUrl } from "../../utils/imageUtils";

const ItemContent = ({
    productId,
    productName,
    image,
    quantity,
    specialPrice,
  }) => {
    const [currentQuantity, setCurrentQuantity] = useState(quantity);
    const dispatch = useDispatch();

        useEffect(() => {
                setCurrentQuantity(quantity);
        }, [quantity]);

    const handleQtyIncrease = () => {
        dispatch(incrementCartQuantity(productId));
        setCurrentQuantity((prev) => prev + 1);
    };

    const handleQtyDecrease = () => {
        if (currentQuantity > 1) {
            const newQuantity = currentQuantity - 1;
            setCurrentQuantity(newQuantity);
            dispatch(decrementCartQuantity(productId));
        }
    };

    const removeItemFromCart = () => {
        dispatch(removeFromCart(productId));
    };
    
    return (
        <div className="grid md:grid-cols-5 grid-cols-4 md:text-md text-sm gap-4   items-center  border border-slate-200  rounded-md  lg:px-4  py-4 p-2">
            <div className="md:col-span-2 justify-self-start flex  flex-col gap-2 ">
                <div className="flex md:flex-row flex-col lg:gap-4 sm:gap-3 gap-0 items-start ">
                   <h3 className="lg:text-[17px] text-sm font-semibold text-slate-600">
                    {truncateText(productName)}
                   </h3>
                </div>

                <div className="md:w-36 sm:w-24 w-12">
                    <img 
                        src={getImageUrl(image)}
                        alt={productName}
                        onError={(event) => {
                            event.currentTarget.src = 'https://placehold.co/300x200?text=No+Image';
                        }}
                        className="md:h-36 sm:h-24 h-12 w-full object-cover rounded-md"/>
                

                <div className="flex items-start gap-5 mt-3">
                    <button
                        type="button"
                        onClick={removeItemFromCart}
                        aria-label={`Remove ${productName} from cart`}
                        className="flex items-center font-semibold space-x-2 px-4 py-1 text-xs border border-rose-600 text-rose-600 rounded-md hover:bg-red-50 transition-colors duration-200">
                        <HiOutlineTrash size={16} className="text-rose-600"/>
                        Remove
                    </button>
                    </div>
                </div>
            </div>

            <div className="justify-self-center lg:text-[17px] text-sm text-slate-600 font-semibold">
                {formatPrice(Number(specialPrice))}
            </div>

            <div className="justify-self-center">
                <SetQuantity 
                    quantity={currentQuantity}
                    cardCounter={true}
                    handleQtyIncrease={handleQtyIncrease}
                    handleQtyDecrease={handleQtyDecrease}/>
            </div>

            <div className="justify-self-center lg:text-[17px] text-sm text-slate-600 font-semibold">
                {formatPrice(Number(currentQuantity) * Number(specialPrice))}
            </div>
        </div>
    )
};

export default ItemContent;