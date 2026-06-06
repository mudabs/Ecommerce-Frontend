import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FaCheckCircle, FaFileInvoice } from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom'
import { stripePaymentConfirmation } from '../../store/actions';
import toast from 'react-hot-toast';
import Skeleton from '../shared/Skeleton';
import { generateInvoice } from '../../utils/generateInvoice';

const CHECKOUT_INVOICE_SNAPSHOT_KEY = "CHECKOUT_INVOICE_SNAPSHOT";

const PaymentConfirmation = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const searchParams = new URLSearchParams(location.search);
    const dispatch = useDispatch();
    const [errorMessage, setErrorMessage] = useState("");
    const [countdown, setCountdown] = useState(5);
    const [orderData, setOrderData] = useState(null);
    const { cart } = useSelector((state) => state.carts);
    const { user } = useSelector((state) => state.auth);

    const checkoutSessionId = searchParams.get("session_id");
    const paymentIntent = searchParams.get("payment_intent");
    const clientSecret = searchParams.get("payment_intent_client_secret");
    const redirectStatus = searchParams.get("redirect_status");

    // Snapshot cart and address at mount, before stripePaymentConfirmation clears them
    const cartSnapshotRef = useRef(null);
    const addressSnapshotRef = useRef(null);
    const userSnapshotRef = useRef(null);
    const invoiceSnapshotRef = useRef(null);
    if (!invoiceSnapshotRef.current) {
        try {
            invoiceSnapshotRef.current = JSON.parse(
                sessionStorage.getItem(CHECKOUT_INVOICE_SNAPSHOT_KEY) || "null"
            );
        } catch (error) {
            invoiceSnapshotRef.current = null;
        }
    }
    if (!cartSnapshotRef.current) {
        const storedCart = localStorage.getItem("cartItems");
        cartSnapshotRef.current = invoiceSnapshotRef.current?.cartItems
            || (storedCart ? JSON.parse(storedCart) : cart);
    }
    if (!addressSnapshotRef.current) {
        const storedAddress = localStorage.getItem("CHECKOUT_ADDRESS");
        addressSnapshotRef.current = invoiceSnapshotRef.current?.address
            || (storedAddress ? JSON.parse(storedAddress) : null);
    }
    if (!userSnapshotRef.current) {
        const storedAuth = localStorage.getItem("auth");
        userSnapshotRef.current = invoiceSnapshotRef.current?.user
            || user
            || (storedAuth ? JSON.parse(storedAuth) : null);
    }

    const selectedUserCheckoutAddress = localStorage.getItem("CHECKOUT_ADDRESS")
        ? JSON.parse(localStorage.getItem("CHECKOUT_ADDRESS"))
        : [];
    const checkoutAddressId = selectedUserCheckoutAddress?.addressId
        || addressSnapshotRef.current?.addressId;

    const confirmationStarted = useRef(false);

    const [loading, setLoading] = useState(() =>
        Boolean(
            searchParams.get("session_id") ||
                (searchParams.get("payment_intent") &&
                    searchParams.get("payment_intent_client_secret") &&
                    searchParams.get("redirect_status"))
        )
    );

    const hasStripeReturn =
        checkoutSessionId ||
        (paymentIntent && clientSecret && redirectStatus);

    const handleDownloadInvoice = (order) => {
        const resolvedOrder = order || orderData;
        const invoiceItems = (resolvedOrder?.orderItems || []).map((item) => ({
            productName: item?.product?.productName || item?.productName,
            quantity: item?.quantity,
            specialPrice: item?.orderedProductPrice,
            price: item?.orderedProductPrice,
        }));
        generateInvoice({
            order: resolvedOrder,
            address: addressSnapshotRef.current,
            cartItems: invoiceItems.length > 0 ? invoiceItems : (cartSnapshotRef.current || []),
            user: userSnapshotRef.current,
            sessionId: checkoutSessionId || paymentIntent,
        });
    };

    useEffect(() => {
        if (confirmationStarted.current) return;
        if (!hasStripeReturn) return;

        if (!checkoutAddressId) {
            setErrorMessage(
                "Checkout address not found. Open checkout again and complete payment from this app."
            );
            setLoading(false);
            return;
        }

        const onSuccess = (data) => {
            setOrderData(data);
            // Use order items from the backend response (cart may be empty after Stripe redirect)
            const invoiceItems = (data?.orderItems || []).map((item) => ({
                productName: item?.product?.productName || item?.productName,
                quantity: item?.quantity,
                specialPrice: item?.orderedProductPrice,
                price: item?.orderedProductPrice,
            }));
            // Auto-download invoice
            generateInvoice({
                order: data,
                address: addressSnapshotRef.current,
                cartItems: invoiceItems.length > 0 ? invoiceItems : (cartSnapshotRef.current || []),
                user: userSnapshotRef.current,
                sessionId: checkoutSessionId || paymentIntent,
            });
        };

        // Stripe Checkout Session return URL (?session_id=cs_...)
        if (checkoutSessionId) {
            confirmationStarted.current = true;
            setLoading(true);
            const sendData = {
                addressId: checkoutAddressId,
                pgName: "Stripe",
                pgPaymentId: checkoutSessionId,
                pgStatus: "succeeded",
                pgResponseMessage: "Payment successful",
            };
            dispatch(stripePaymentConfirmation(sendData, setErrorMessage, setLoading, toast, onSuccess));
            return;
        }

        // Legacy Payment Element flow (?payment_intent=...)
        if (paymentIntent && clientSecret && redirectStatus) {
            if (!cart?.length && !cartSnapshotRef.current?.length) {
                setErrorMessage(
                    "Cart was empty. If you were charged, contact support with your payment receipt."
                );
                setLoading(false);
                return;
            }
            confirmationStarted.current = true;
            setLoading(true);
            const sendData = {
                addressId: checkoutAddressId,
                pgName: "Stripe",
                pgPaymentId: paymentIntent,
                pgStatus: "succeeded",
                pgResponseMessage: "Payment successful",
            };
            dispatch(stripePaymentConfirmation(sendData, setErrorMessage, setLoading, toast, onSuccess));
        }
    }, [
        checkoutSessionId,
        paymentIntent,
        clientSecret,
        redirectStatus,
        cart,
        checkoutAddressId,
        hasStripeReturn,
        dispatch,
    ]);

    // Countdown redirect once payment is confirmed
    useEffect(() => {
        if (loading || errorMessage || !hasStripeReturn) return;

        if (countdown <= 0) {
            sessionStorage.removeItem(CHECKOUT_INVOICE_SNAPSHOT_KEY);
            navigate("/");
            return;
        }

        const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
        return () => clearTimeout(timer);
    }, [loading, errorMessage, hasStripeReturn, countdown, navigate]);

    if (!hasStripeReturn) {
        return (
            <div className="min-h-screen flex items-center justify-center px-4">
                <p className="text-gray-600 text-center max-w-md">
                    No payment confirmation in this link. Use the checkout flow to pay, or check
                    your order history.
                </p>
            </div>
        );
    }

    if (errorMessage) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center px-4 gap-4">
                <p className="text-red-600 text-center max-w-md">{errorMessage}</p>
                <Link to="/checkout" className="text-blue-600 underline text-sm">
                    Return to checkout
                </Link>
            </div>
        );
    }

    return (
        <div className='min-h-screen flex items-center justify-center'>
            {loading ? (
                <div className='max-w-xl mx-auto'>
                    <Skeleton />
                </div>
            ) : (
                <div className="p-8 rounded-lg shadow-lg text-center max-w-md mx-auto border border-gray-200">
                    <div className="text-green-500 mb-4 flex justify-center">
                        <FaCheckCircle size={64} />
                    </div>
                    <h2 className='text-3xl font-bold text-gray-800 mb-2'>Payment Successful!</h2>
                    <p className="text-gray-600 mb-4">
                        Thank you for your purchase! Your payment was successful, and we're
                        processing your order.
                    </p>
                    <p className="text-sm text-gray-400 mb-6">
                        Your invoice has been downloaded automatically.
                    </p>
                    <button
                        onClick={() => handleDownloadInvoice(null)}
                        className="flex items-center gap-2 mx-auto px-4 py-2 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50 transition mb-6"
                    >
                        <FaFileInvoice size={16} />
                        Download Invoice Again
                    </button>
                    <p className="text-sm text-gray-400">
                        Redirecting to home in {countdown}s…
                    </p>
                </div>
            )}
        </div>
    );
}

export default PaymentConfirmation
