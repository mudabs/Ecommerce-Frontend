import { useState } from 'react';
import { FaShoppingCart } from 'react-icons/fa';
import ProductViewModal from './ProductViewModal';
import TextTruncate from './TextTruncate';

const ProductCard = ({
    productId,
      productName,
      image,
      description,
      quantity,
      price,
      discount,
      specialPrice,
}) =>{
    const [openProductViewModal, setOpenProductViewModal] = useState(false);
    const btnLoader = false;
    const [selectedViewProduct, setSelectedViewProduct] = useState("");
    const isAvailable = quantity && Number(quantity) > 0;
    const handleProductView = (product) => {
        setSelectedViewProduct(product);
        setOpenProductViewModal(true);
    }
    return(
        <div className="border border-slate-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300">
            <div onClick={() => {handleProductView({id: productId, productName, image, description, quantity, price, discount, specialPrice})}} className="w-full h-48 overflow-hidden bg-white flex items-center justify-center">
                <img 
                src={image} 
                alt={productName} 
                className="w-full h-full object-contain cursor-pointer transition-transform duration-300 transform hover:scale-105">
                </img>
            </div>
            <div className="p-4">
                <h2 onClick={() => {handleProductView({id: productId, productName, image, description, quantity, price, discount, specialPrice})}} 
                    className="text-lg font-semibold mb-2 cursor-pointer">
                    <TextTruncate text={productName} maxLength={50} />
                </h2>

                <div className="min-h-20 max-h-20 ">
                    <p className="text-gray-600 text-sm">
                        <TextTruncate text={description} maxLength={80} />
                    </p>
                </div>
                
                <div className='flex items-center justify-between mt-2'>
                   {specialPrice ? (
                    <div className="flex flex-col">
                        <span className='text-gray-400 line-through'>
                            ${Number(price).toFixed(2)}
                        </span>
                        <span className='text-gray-800 font-bold'>
                        ${Number(specialPrice).toFixed(2)}
                    </span>
                        </div>
                ) : (
                    <span className='text-gray-800 font-bold'>
                        {" "}
                        ${Number(price).toFixed(2)}
                    </span>
                )} 

                <button
                    disabled={!isAvailable || btnLoader}
                    onClick={() => {}}
                    className={`bg-blue-500 ${isAvailable ? "opacity-100 hover:bg-blue-600" : "opacity-70"} 
                     text-white py-2 px-3 rounded-lg mt-4 transition-colors duration-300 w-36 flex justify-center`}>
                    <FaShoppingCart className='mr-2 mt-1'/>
                    {isAvailable ? "Add to Cart" : "Out of Stock"}
                </button>
                </div>
                

                
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
