import React from 'react'
import { FaCheckCircle } from 'react-icons/fa';
import { Link } from 'react-router-dom'
import { formatPrice } from '../../utils/formatPrice';

const PaymentConfirmation = () => {
    const lastOrderSummary = localStorage.getItem("LAST_ORDER_SUMMARY")
        ? JSON.parse(localStorage.getItem("LAST_ORDER_SUMMARY"))
        : null;

  return (
    <div className='min-h-screen flex items-center justify-center'>
        <div className="p-8 rounded-lg shadow-lg text-center max-w-md mx-auto border border-gray-200">
            <div className="text-green-500 mb-4 flex  justify-center">    
                <FaCheckCircle size={64} />
            </div>
            <h2 className='text-3xl font-bold text-gray-800 mb-2'>Order Confirmed!</h2>
            <p className="text-gray-600 mb-4">
                Thank you for your purchase. Your order has been placed successfully.
            </p>
            {lastOrderSummary && (
                <div className='text-sm text-slate-700 mb-4'>
                    {lastOrderSummary.orderId && <p><strong>Order ID:</strong> {lastOrderSummary.orderId}</p>}
                    <p><strong>Items:</strong> {lastOrderSummary.itemCount}</p>
                    <p><strong>Payment:</strong> {lastOrderSummary.paymentMethod}</p>
                    <p><strong>Total:</strong> {formatPrice(lastOrderSummary.totalPrice)}</p>
                </div>
            )}
            <Link to='/products' className='inline-block px-4 py-2 rounded-md bg-custom-blue text-white font-semibold'>
                Continue Shopping
            </Link>
        </div>
    </div>
  )
}

export default PaymentConfirmation