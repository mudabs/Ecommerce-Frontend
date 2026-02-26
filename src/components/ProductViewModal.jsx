import { Button, Description, Dialog, DialogPanel, DialogTitle } from '@headlessui/react'
import { FaShoppingCart } from 'react-icons/fa';
import { MdDone, MdClose } from 'react-icons/md';
import Status from './Status';

function ProductViewModal({open, setOpen, product, isAvailable}) {
  if (!product) return null;

  const{productName, image, description, price, specialPrice, quantity} = product;

  return (
    <>
      <Dialog open={open} as="div" className="relative z-50 focus:outline-none" onClose={() => setOpen(false)}>
        <div className="fixed inset-0 z-10 w-screen overflow-y-auto bg-black/25">
          <div className="flex min-h-full items-center justify-center p-4">
            <DialogPanel
              transition
              className="w-full max-w-lg rounded-xl bg-white/95 p-8 backdrop-blur-2xl duration-300 ease-out data-closed:transform-[scale(95%)] data-closed:opacity-0"
            >
              <DialogTitle as="h3" className="text-2xl font-bold text-gray-900">
                {productName}
              </DialogTitle>
              
              <img 
                src={image} 
                alt={productName}
                className="w-full h-64 object-contain rounded-lg mt-4 mb-4 bg-gray-100"
              />
              
              <Description className="mt-2 text-sm/6 text-gray-600">
                {description}
              </Description>

              <div className="mt-4 space-y-3">
                <div className="flex gap-4 items-center">
                  <span className="text-gray-400 line-through text-lg">
                    ${Number(price).toFixed(2)}
                  </span>
                  <span className="text-2xl font-bold text-green-600">
                    ${Number(specialPrice).toFixed(2)}
                  </span>
                </div>
                
                <div className="w-fit ml-auto">
                  {isAvailable ? (
                    <Status 
                      text={`In Stock (${quantity} available)`}
                      icon={MdDone} 
                      bg="bg-green-100" 
                      color="text-green-600"
                    />
                  ) : (
                    <Status 
                      text="Out of Stock" 
                      icon={MdClose} 
                      bg="bg-red-100" 
                      color="text-red-600"
                    />
                  )}
                </div>
              </div>

              <div className="mt-6 flex gap-3">
                <Button
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-md bg-gray-300 px-4 py-2.5 text-sm/6 font-semibold text-gray-900 shadow-inner shadow-white/10 focus:not-data-focus:outline-none data-focus:outline data-focus:outline-gray-500 data-hover:bg-gray-400 data-open:bg-gray-300 transition-colors"
                  onClick={() => setOpen(false)}
                >
                  Close
                </Button>
                <Button
                  disabled={!isAvailable}
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-md bg-blue-600 px-4 py-2.5 text-sm/6 font-semibold text-white shadow-inner shadow-white/10 focus:not-data-focus:outline-none data-focus:outline data-focus:outline-blue-400 data-hover:bg-blue-700 data-open:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  <FaShoppingCart className='mr-2'/>
                  {isAvailable ? 'Add to Cart' : 'Out of Stock'}
                </Button>
              </div>
            </DialogPanel>
          </div>
        </div>
      </Dialog>
    </>
  )
}

export default ProductViewModal