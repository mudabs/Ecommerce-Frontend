import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FaArrowLeft, FaBoxOpen, FaFileInvoice, FaLocationDot, FaReceipt } from 'react-icons/fa6';
import Loader from '../shared/Loader';
import ErrorPage from '../shared/ErrorPage';
import { clearUserOrderDetail, getUserOrderById, reorderItems } from '../../store/actions';
import { formatPrice } from '../../utils';
import { getBackendImageUrl } from '../../utils/env';
import { generateInvoice } from '../../utils/generateInvoice';

const UserOrderDetails = () => {
    const { orderId } = useParams();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { selectedUserOrder } = useSelector((state) => state.order);
    const { user } = useSelector((state) => state.auth);
    const { isLoading, errorMessage } = useSelector((state) => state.errors);

    useEffect(() => {
        if (!orderId) {
            return undefined;
        }

        dispatch(getUserOrderById(orderId));

        return () => {
            dispatch(clearUserOrderDetail());
        };
    }, [dispatch, orderId]);

    const handleReorder = () => {
        if (!selectedUserOrder?.orderId) {
            return;
        }

        dispatch(reorderItems(selectedUserOrder.orderId, navigate, toast));
    };

    const handleDownloadInvoice = () => {
        if (!selectedUserOrder) {
            return;
        }

        const invoiceItems = (selectedUserOrder.orderItems || []).map((item) => ({
            productName: item.product?.productName,
            quantity: item.quantity,
            specialPrice: item.orderedProductPrice,
            price: item.orderedProductPrice,
        }));

        generateInvoice({
            order: selectedUserOrder,
            address: selectedUserOrder.address,
            cartItems: invoiceItems,
            user,
            sessionId: selectedUserOrder.payment?.pgPaymentId,
        });
    };

    if (isLoading && !selectedUserOrder) {
        return <Loader text="Loading order details..." />;
    }

    if (errorMessage && !selectedUserOrder) {
        return <ErrorPage message={errorMessage} />;
    }

    if (!selectedUserOrder) {
        return <ErrorPage message="Order not found." />;
    }

    const shippingAddress = [
        selectedUserOrder.address?.buildingName,
        selectedUserOrder.address?.street,
        selectedUserOrder.address?.city,
        selectedUserOrder.address?.state,
        selectedUserOrder.address?.pincode,
        selectedUserOrder.address?.country,
    ].filter(Boolean);

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
                <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <Link to="/profile/orders" className="inline-flex items-center gap-2 text-sm font-medium text-orange-600 hover:text-orange-700">
                            <FaArrowLeft />
                            Back to orders
                        </Link>
                        <h1 className="mt-3 text-3xl font-bold text-gray-900">Order #{selectedUserOrder.orderId}</h1>
                        <p className="mt-2 text-sm text-gray-600">
                            Placed on {new Date(selectedUserOrder.orderDate).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                            })}
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-3">
                        <button
                            type="button"
                            onClick={handleReorder}
                            className="rounded-md bg-orange-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-orange-600"
                        >
                            Reorder Items
                        </button>
                        <button
                            type="button"
                            onClick={handleDownloadInvoice}
                            className="inline-flex items-center gap-2 rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
                        >
                            <FaFileInvoice />
                            Download Invoice
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    <div className="space-y-6 lg:col-span-2">
                        <section className="rounded-xl border border-gray-200 bg-white shadow-sm">
                            <div className="border-b border-gray-200 px-6 py-4">
                                <h2 className="text-lg font-semibold text-gray-900">Items in this order</h2>
                            </div>
                            <div className="divide-y divide-gray-100">
                                {(selectedUserOrder.orderItems || []).map((item, index) => (
                                    <div key={item.orderItemId || index} className="flex flex-col gap-4 p-6 sm:flex-row">
                                        <div className="shrink-0">
                                            <img
                                                src={getBackendImageUrl(item.product?.image)}
                                                alt={item.product?.productName || 'Product'}
                                                className="h-24 w-24 rounded-lg border object-cover"
                                                onError={(event) => {
                                                    event.target.src = '/image-placeholder.svg';
                                                }}
                                            />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <h3 className="text-lg font-semibold text-gray-900">
                                                {item.product?.productName || 'Product'}
                                            </h3>
                                            <p className="mt-2 text-sm text-gray-600">
                                                Quantity: {item.quantity}
                                            </p>
                                            <p className="mt-1 text-sm text-gray-600">
                                                Unit total: {formatPrice(item.orderedProductPrice)}
                                            </p>
                                            {item.product?.description ? (
                                                <p className="mt-3 line-clamp-3 text-sm text-gray-500">
                                                    {item.product.description}
                                                </p>
                                            ) : null}
                                        </div>
                                        <div className="sm:text-right">
                                            <p className="text-sm text-gray-500">Line total</p>
                                            <p className="mt-1 text-lg font-semibold text-gray-900">
                                                {formatPrice(Number(item.orderedProductPrice || 0) * Number(item.quantity || 0))}
                                            </p>
                                            {item.product?.productId ? (
                                                <button
                                                    type="button"
                                                    onClick={() => navigate(`/products/${item.product.productId}`)}
                                                    className="mt-3 text-sm font-medium text-orange-600 hover:text-orange-700"
                                                >
                                                    View product
                                                </button>
                                            ) : null}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </div>

                    <div className="space-y-6">
                        <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                            <div className="flex items-center gap-3">
                                <FaReceipt className="text-orange-500" />
                                <h2 className="text-lg font-semibold text-gray-900">Order Summary</h2>
                            </div>
                            <dl className="mt-5 space-y-4 text-sm">
                                <div className="flex items-start justify-between gap-4">
                                    <dt className="text-gray-500">Status</dt>
                                    <dd className="font-medium text-gray-900">{selectedUserOrder.orderStatus}</dd>
                                </div>
                                <div className="flex items-start justify-between gap-4">
                                    <dt className="text-gray-500">Payment</dt>
                                    <dd className="text-right font-medium text-gray-900">{selectedUserOrder.payment?.pgName || selectedUserOrder.payment?.paymentMethod || 'N/A'}</dd>
                                </div>
                                <div className="flex items-start justify-between gap-4">
                                    <dt className="text-gray-500">Payment status</dt>
                                    <dd className="text-right font-medium text-gray-900">{selectedUserOrder.payment?.pgStatus || 'N/A'}</dd>
                                </div>
                                <div className="flex items-start justify-between gap-4 border-t border-gray-100 pt-4">
                                    <dt className="text-gray-900 font-semibold">Total</dt>
                                    <dd className="text-right text-lg font-bold text-gray-900">{formatPrice(selectedUserOrder.totalAmount)}</dd>
                                </div>
                            </dl>
                        </section>

                        <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                            <div className="flex items-center gap-3">
                                <FaLocationDot className="text-orange-500" />
                                <h2 className="text-lg font-semibold text-gray-900">Shipping Address</h2>
                            </div>
                            {shippingAddress.length > 0 ? (
                                <div className="mt-5 space-y-2 text-sm text-gray-700">
                                    {shippingAddress.map((line) => (
                                        <p key={line}>{line}</p>
                                    ))}
                                </div>
                            ) : (
                                <p className="mt-5 text-sm text-gray-500">Shipping address unavailable for this order.</p>
                            )}
                        </section>

                        <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                            <div className="flex items-center gap-3">
                                <FaBoxOpen className="text-orange-500" />
                                <h2 className="text-lg font-semibold text-gray-900">Need Help?</h2>
                            </div>
                            <p className="mt-4 text-sm text-gray-600">
                                If there is an issue with this order, return to your orders list and contact support with the order number above.
                            </p>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserOrderDetails;