import { Button, Step, StepLabel, Stepper } from '@mui/material';
import React, { useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { clearCart } from '../../store/actions';
import toast from 'react-hot-toast';
import PaymentMethod from './PaymentMethod';
import OrderSummary from './OrderSummary';
import { Link, useNavigate } from 'react-router-dom';
import orderService from '../../services/orderService';

const Checkout = () => {
    const [activeStep, setActiveStep] = useState(0);
    const [isPlacingOrder, setIsPlacingOrder] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState("Stripe");
    const [address, setAddress] = useState({
        buildingName: "",
        city: "",
        street: "",
        state: "",
        pincode: "",
        country: "",
    });

    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { cart } = useSelector((state) => state.carts);
    const { isAuthenticated } = useSelector((state) => state.auth);

    const totalPrice = useMemo(
        () => cart?.reduce(
            (acc, cur) => acc + (Number(cur?.specialPrice ?? cur?.price ?? 0) * Number(cur?.quantity ?? 0)),
            0
        ) ?? 0,
        [cart]
    );

    const hasAddress = Object.values(address).every((value) => String(value).trim().length > 0);
    const hasItems = Array.isArray(cart) && cart.length > 0;

    const handleBack = () => {
        setActiveStep((prevStep) => prevStep - 1);
    };

    const handleNext = () => {
        if(activeStep === 0 && !hasAddress) {
            toast.error("Please complete the shipping address before proceeding.");
            return;
        }

        if(activeStep === 1 && !paymentMethod) {
            toast.error("Please select a payment method before proceeding.");
            return;
        }
        
        setActiveStep((prevStep) => prevStep + 1);
    };

    const placeOrderHandler = async () => {
        if (!hasItems) {
            toast.error("Your cart is empty.");
            return;
        }

        const orderPayload = {
            items: cart.map((item) => ({
                productId: item.productId,
                quantity: Number(item.quantity) || 1,
                unitPrice: Number(item.specialPrice ?? item.price ?? 0),
            })),
            shippingAddress: {
                buildingName: address.buildingName,
                street: address.street,
                city: address.city,
                state: address.state,
                pincode: address.pincode,
                country: address.country,
            },
            paymentMethod,
            totalAmount: Number(totalPrice),
            currency: import.meta.env.VITE_ORDER_CURRENCY || 'USD',
        };

        setIsPlacingOrder(true);
        try {
            const orderResponse = await orderService.createOrder(orderPayload);
            const orderId = orderResponse?.orderId || orderResponse?.id || orderResponse?.data?.orderId || null;

            localStorage.setItem("LAST_ORDER_SUMMARY", JSON.stringify({
                orderId,
                totalPrice,
                paymentMethod,
                itemCount: cart.length,
            }));

            dispatch(clearCart());
            toast.success("Order placed successfully!");
            navigate("/order-confirm");
        } catch (error) {
            const message =
                error?.response?.data?.message ||
                error?.response?.data?.error ||
                error?.message ||
                'Failed to place order. Please try again.';
            toast.error(message);
        } finally {
            setIsPlacingOrder(false);
        }
    };

    const onAddressChange = (event) => {
        const { name, value } = event.target;
        setAddress((prev) => ({ ...prev, [name]: value }));
    };

    const steps = [
        "Address",
        "Payment Method",
        "Order Summary",
    ];

    if (!isAuthenticated) {
        return (
            <div className='py-14 min-h-[calc(100vh-100px)] flex items-center justify-center'>
                <div className='max-w-md w-full p-6 border rounded-md text-center shadow-sm'>
                    <h2 className='text-2xl font-semibold text-slate-800'>Login Required</h2>
                    <p className='text-slate-600 mt-2'>Please login to continue checkout.</p>
                    <Link to='/login' className='inline-block mt-4 px-4 py-2 rounded-md bg-custom-blue text-white font-semibold'>
                        Go to Login
                    </Link>
                </div>
            </div>
        );
    }

    if (!hasItems) {
        return (
            <div className='py-14 min-h-[calc(100vh-100px)] flex items-center justify-center'>
                <div className='max-w-md w-full p-6 border rounded-md text-center shadow-sm'>
                    <h2 className='text-2xl font-semibold text-slate-800'>Your cart is empty</h2>
                    <p className='text-slate-600 mt-2'>Add items to cart before checkout.</p>
                    <Link to='/products' className='inline-block mt-4 px-4 py-2 rounded-md bg-custom-blue text-white font-semibold'>
                        Browse Products
                    </Link>
                </div>
            </div>
        );
    }

  return (
    <div className='py-14 min-h-[calc(100vh-100px)]'>
        <Stepper activeStep={activeStep} alternativeLabel>
            {steps.map((label, index) => (
                <Step key={index}>
                    <StepLabel>{label}</StepLabel>
                </Step>
            ))}
        </Stepper>

        <div className='mt-5'>
                {activeStep === 0 && (
                    <div className='max-w-2xl mx-auto p-5 bg-white shadow-md rounded-lg border'>
                        <h1 className='text-2xl font-semibold mb-4'>Shipping Address</h1>
                        <div className='grid sm:grid-cols-2 grid-cols-1 gap-4'>
                            <input name='buildingName' value={address.buildingName} onChange={onAddressChange} placeholder='Building Name' className='border rounded-md px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500' />
                            <input name='street' value={address.street} onChange={onAddressChange} placeholder='Street' className='border rounded-md px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500' />
                            <input name='city' value={address.city} onChange={onAddressChange} placeholder='City' className='border rounded-md px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500' />
                            <input name='state' value={address.state} onChange={onAddressChange} placeholder='State' className='border rounded-md px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500' />
                            <input name='pincode' value={address.pincode} onChange={onAddressChange} placeholder='Pincode' className='border rounded-md px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500' />
                            <input name='country' value={address.country} onChange={onAddressChange} placeholder='Country' className='border rounded-md px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500' />
                        </div>
                    </div>
                )}
                {activeStep === 1 && (
                    <PaymentMethod
                        paymentMethod={paymentMethod}
                        onChange={setPaymentMethod}
                    />
                )}
                {activeStep === 2 && <OrderSummary 
                                        totalPrice={totalPrice}
                                        cart={cart}
                                        address={address}
                                        paymentMethod={paymentMethod}/>}
            </div>
        

        <div
            className='flex justify-between items-center px-4 fixed z-50 h-24 bottom-0 bg-white left-0 w-full py-4 border-slate-200'
            style={{ boxShadow: "0 -2px 4px rgba(100, 100, 100, 0.15)" }}>
            <Button
                variant='outlined'
                disabled={activeStep === 0}
                onClick={handleBack}>
                    Back
            </Button>

            {activeStep !== steps.length - 1 ? (
                <button
                    disabled={
                        (activeStep === 0 ? !hasAddress
                            : activeStep === 1 ? !paymentMethod
                            : false
                        )
                    }
                    className={`bg-custom-blue font-semibold px-6 h-10 rounded-md text-white
                       ${
                        (activeStep === 0 && !hasAddress) ||
                        (activeStep === 1 && !paymentMethod)
                        ? "opacity-60"
                        : ""
                       }`}
                       onClick={handleNext}>
                    Proceed
                </button>
            ) : (
                <button
                    disabled={isPlacingOrder}
                    className='bg-custom-blue font-semibold px-6 h-10 rounded-md text-white disabled:opacity-60'
                    onClick={placeOrderHandler}>
                    {isPlacingOrder ? 'Placing...' : 'Place Order'}
                </button>
            )} 
        </div>

    </div>
  );
}

export default Checkout;