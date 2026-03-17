import { Skeleton } from '@mui/material'
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import React, { useEffect, useState } from 'react'
import PaymentForm from './PaymentForm';
import paymentService from '../../services/paymentService';
import toast from 'react-hot-toast';

const StripePayment = ({ totalPrice, address, onSuccess }) => {
  const [clientSecret, setClientSecret] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const stripePublishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
  const stripePromise = stripePublishableKey ? loadStripe(stripePublishableKey) : null;

  useEffect(() => {
    const createIntent = async () => {
      if (!stripePublishableKey) return;
      if (!totalPrice || Number(totalPrice) <= 0) return;
      setIsLoading(true);
      try {
        const intentPayload = {
          amount: Math.round(Number(totalPrice) * 100),
          currency: paymentService.getCheckoutCurrency().toLowerCase(),
          shippingAddress: address,
          description: `SmartCart order for ${formatAddressLine(address)}`,
        };
        const response = await paymentService.createStripePaymentIntent(intentPayload);
        const receivedClientSecret = response?.clientSecret || response?.data?.clientSecret;
        if (!receivedClientSecret) {
          throw new Error('Stripe client secret missing from payment intent response.');
        }
        setClientSecret(receivedClientSecret);
      } catch (error) {
        const message = error?.response?.data?.message || error?.message || 'Failed to initialize Stripe payment.';
        toast.error(message);
      } finally {
        setIsLoading(false);
      }
    };

    createIntent();
  }, [address, totalPrice, stripePublishableKey]);

  if (!stripePublishableKey) {
    return (
      <div className='max-w-xl mx-auto p-6 bg-white border rounded-lg shadow-sm'>
        <h2 className='text-xl font-semibold mb-2 text-slate-900'>Test Checkout Mode</h2>
        <p className='text-slate-600 mb-4'>
          Stripe is not configured in this environment. You can still continue checkout for testing.
        </p>
        <button
          type='button'
          onClick={() => onSuccess({
            provider: 'BYPASS',
            id: `bypass_${Date.now()}`,
            status: 'SUCCEEDED',
            details: { message: 'Stripe key missing, test checkout used.' },
          })}
          className='bg-custom-blue text-white font-semibold px-6 py-2.5 rounded-md hover:opacity-90 transition-opacity'>
          Complete Test Checkout
        </button>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className='max-w-lg mx-auto'>
        <Skeleton />
      </div>
    )
  }


  return (
    <>
      {clientSecret && (
        <Elements stripe={stripePromise} options={{ clientSecret }}>
          <PaymentForm clientSecret={clientSecret} totalPrice={totalPrice} onSuccess={onSuccess} />
        </Elements>
      )}
    </>
  )
}

const formatAddressLine = (address) => {
  if (!address) return 'customer';
  return [address?.buildingName, address?.city, address?.country].filter(Boolean).join(', ') || 'customer';
};

export default StripePayment