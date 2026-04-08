import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { getUserAddresses, getUserOrders, reorderItems } from '../../store/actions';
import toast from 'react-hot-toast';
import { formatPrice } from '../../utils';
import { getBackendImageUrl } from '../../utils/env';
import useAuth from '../../hooks/useAuth';

const UserOrders = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();
    const [loading, setLoading] = useState(true);
    const [selectedTimeFrame, setSelectedTimeFrame] = useState('all');
    const [currentPage, setCurrentPage] = useState(0);

    const { userOrders, userPagination } = useSelector(state => state.order);
    const { address } = useSelector(state => state.auth);
    const { errorMessage } = useSelector(state => state.errors || {});

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }

        fetchOrders();
        dispatch(getUserAddresses());
    }, [isAuthenticated, navigate, currentPage, selectedTimeFrame]);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            let queryString = `pageNumber=${currentPage}&pageSize=10&sortBy=orderDate&sortOrder=desc`;
            
            // Add time frame filtering if needed (would require backend support)
            if (selectedTimeFrame !== 'all') {
                queryString += `&timeFrame=${selectedTimeFrame}`;
            }
            
            console.log('Fetching orders with query:', queryString);
            const result = await dispatch(getUserOrders(queryString));
            console.log('Orders API result:', result);
        } catch (error) {
            console.error('Failed to fetch orders:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleReorder = (orderId) => {
        dispatch(reorderItems(orderId, navigate, toast));
    };

    const handleViewOrderDetails = (orderId) => {
        // Navigate to order details page (to be implemented)
        navigate(`/profile/orders/${orderId}`);
    };

    const getOrderStatusBadge = (status) => {
        const statusColors = {
            'Pending': 'bg-yellow-100 text-yellow-800 border-yellow-200',
            'Accepted': 'bg-blue-100 text-blue-800 border-blue-200',
            'Processing': 'bg-indigo-100 text-indigo-800 border-indigo-200',
            'Shipped': 'bg-purple-100 text-purple-800 border-purple-200',
            'Out for Delivery': 'bg-orange-100 text-orange-800 border-orange-200',
            'Delivered': 'bg-green-100 text-green-800 border-green-200',
            'Cancelled': 'bg-red-100 text-red-800 border-red-200',
            'Returned': 'bg-gray-100 text-gray-800 border-gray-200',
        };

        return statusColors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
    };

    const formatOrderDate = (dateString) => {
        const options = { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        };
        return new Date(dateString).toLocaleDateString('en-US', options);
    };

    const getShippingAddress = (order) => {
        const matchedAddress = Array.isArray(address)
            ? address.find((item) => item.addressId === order.addressId)
            : null;

        const addressSource = order.address || matchedAddress;

        if (!addressSource) {
            return order.addressId ? `Address #${order.addressId}` : 'Address unavailable';
        }

        const compactAddress = [
            addressSource.buildingName,
            addressSource.street,
            addressSource.city,
            addressSource.state,
            addressSource.pincode,
            addressSource.country,
        ]
            .filter(Boolean)
            .join(', ');

        return compactAddress || (order.addressId ? `Address #${order.addressId}` : 'Address unavailable');
    };

    const timeFrameOptions = [
        { value: 'all', label: 'All Orders' },
        { value: '30days', label: 'Last 30 days' },
        { value: '3months', label: 'Last 3 months' },
        { value: '2023', label: '2023' },
        { value: '2022', label: '2022' },
    ];

    if (loading && (!userOrders || currentPage === 0)) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">Your Orders</h1>
                    
                    {/* Time Frame Filter */}
                    <div className="flex flex-wrap gap-2 mb-6">
                        {timeFrameOptions.map((option) => (
                            <button
                                key={option.value}
                                onClick={() => {
                                    setSelectedTimeFrame(option.value);
                                    setCurrentPage(0);
                                }}
                                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                                    selectedTimeFrame === option.value
                                        ? 'bg-orange-500 text-white'
                                        : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                                }`}
                            >
                                {option.label}
                            </button>
                        ))}
                    </div>

                    {/* Results Summary */}
                    {userPagination?.totalElements !== undefined ? (
                        <p className="text-gray-600">
                            {userPagination.totalElements} order{userPagination.totalElements !== 1 ? 's' : ''} found
                        </p>
                    ) : (
                        <p className="text-gray-600">
                            Loading order count...
                        </p>
                    )}
                    
                    {/* Debug Information (remove in production) */}
                    {process.env.NODE_ENV === 'development' && (
                        <div className="mt-4 p-4 bg-gray-100 rounded-lg text-sm">
                            <strong>Debug Info:</strong>
                            <br />Loading: {loading ? 'true' : 'false'}
                            <br />UserOrders: {userOrders ? `Array with ${userOrders.length} items` : 'null/undefined'}
                            <br />Error: {errorMessage || 'none'}
                            <br />IsAuthenticated: {isAuthenticated ? 'true' : 'false'}
                        </div>
                    )}
                </div>

                {/* Orders List */}
                {!loading && userOrders && userOrders.length > 0 ? (
                    <div className="space-y-6">
                        {userOrders.map((order) => (
                            <div key={order.orderId} className="bg-white border border-gray-200 rounded-lg shadow-sm">
                                {/* Order Header */}
                                <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 rounded-t-lg">
                                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                                        <div className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2 lg:grid-cols-4">
                                            <div className="min-w-0">
                                                <span className="text-gray-500">Order placed</span>
                                                <p className="font-medium text-gray-900 truncate">
                                                    {formatOrderDate(order.orderDate)}
                                                </p>
                                            </div>
                                            <div className="min-w-0">
                                                <span className="text-gray-500">Total</span>
                                                <p className="font-medium text-gray-900 truncate">
                                                    {formatPrice(order.totalAmount)}
                                                </p>
                                            </div>
                                            <div className="min-w-0">
                                                <span className="text-gray-500">Ship to</span>
                                                <p className="font-medium text-gray-900 truncate">
                                                    {getShippingAddress(order)}
                                                </p>
                                            </div>
                                            <div className="min-w-0">
                                                <span className="text-gray-500">Order #</span>
                                                <p className="font-medium text-gray-900 truncate">
                                                    #{order.orderId}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getOrderStatusBadge(order.orderStatus)}`}>
                                                {order.orderStatus}
                                            </span>
                                            <button
                                                onClick={() => handleViewOrderDetails(order.orderId)}
                                                className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                                            >
                                                Order details
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Order Items */}
                                <div className="p-6">
                                    <div className="space-y-4">
                                        {order.orderItems && order.orderItems.map((item, index) => (
                                            <div key={index} className="flex items-start space-x-4 pb-4 border-b border-gray-100 last:border-b-0">
                                                <div className="shrink-0">
                                                    <img
                                                        src={getBackendImageUrl(item.product?.image)}
                                                        alt={item.product?.productName || 'Product'}
                                                        className="w-20 h-20 object-cover rounded-lg border"
                                                        onError={(e) => {
                                                            e.target.src = '/image-placeholder.svg';
                                                        }}
                                                    />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="text-lg font-medium text-gray-900 mb-1">
                                                        {item.product?.productName || 'Product Name'}
                                                    </h4>
                                                    <p className="text-gray-600 text-sm mb-2">
                                                        Quantity: {item.quantity} | Price: {formatPrice(item.orderedProductPrice)}
                                                    </p>
                                                    {item.product?.description && (
                                                        <p className="text-gray-500 text-sm line-clamp-2">
                                                            {item.product.description}
                                                        </p>
                                                    )}
                                                </div>
                                                <div className="flex flex-col gap-2">
                                                    <button
                                                        onClick={() => handleReorder(order.orderId)}
                                                        className="px-4 py-2 bg-yellow-400 hover:bg-yellow-500 text-gray-900 text-sm font-medium rounded-md transition-colors"
                                                    >
                                                        Buy it again
                                                    </button>
                                                    <button
                                                        onClick={() => navigate(`/products/${item.product?.productId}`)}
                                                        className="px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 text-sm font-medium rounded-md transition-colors"
                                                    >
                                                        View product
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Order Actions */}
                                    <div className="mt-6 pt-4 border-t border-gray-200">
                                        <div className="flex flex-wrap gap-3">
                                            <button
                                                onClick={() => handleViewOrderDetails(order.orderId)}
                                                className="px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 text-sm font-medium rounded-md transition-colors"
                                            >
                                                Track package
                                            </button>
                                            <button
                                                onClick={() => handleReorder(order.orderId)}
                                                className="px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 text-sm font-medium rounded-md transition-colors"
                                            >
                                                Reorder all items
                                            </button>
                                            {order.orderStatus === 'Delivered' && (
                                                <button className="px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 text-sm font-medium rounded-md transition-colors">
                                                    Leave a review
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : !loading ? (
                    <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
                        <div className="mx-auto h-24 w-24 text-gray-400 mb-4">
                            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-full h-full">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No orders found</h3>
                        <p className="text-gray-600 mb-6">
                            {errorMessage ? 'There was an error loading your orders.' : "You haven't placed any orders yet."}
                        </p>
                        <div className="space-x-3">
                            <button
                                onClick={() => navigate('/products')}
                                className="inline-flex items-center px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-md transition-colors"
                            >
                                Start shopping
                            </button>
                            {errorMessage && (
                                <button
                                    onClick={() => fetchOrders()}
                                    className="inline-flex items-center px-6 py-3 border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium rounded-md transition-colors"
                                >
                                    Retry
                                </button>
                            )}
                        </div>
                    </div>
                ) : null}

                {/* Pagination */}
                {userPagination && userPagination.totalPages > 1 && (
                    <div className="mt-8 flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6 rounded-lg">
                        <div className="flex flex-1 justify-between sm:hidden">
                            <button
                                onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                                disabled={currentPage === 0}
                                className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                            >
                                Previous
                            </button>
                            <button
                                onClick={() => setCurrentPage(Math.min(userPagination.totalPages - 1, currentPage + 1))}
                                disabled={userPagination.lastPage}
                                className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                            >
                                Next
                            </button>
                        </div>
                        <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                            <div>
                                <p className="text-sm text-gray-700">
                                    Showing <span className="font-medium">{currentPage * 10 + 1}</span> to{' '}
                                    <span className="font-medium">
                                        {Math.min((currentPage + 1) * 10, userPagination.totalElements)}
                                    </span>{' '}
                                    of <span className="font-medium">{userPagination.totalElements}</span> results
                                </p>
                            </div>
                            <div>
                                <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                                    <button
                                        onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                                        disabled={currentPage === 0}
                                        className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
                                    >
                                        <span className="sr-only">Previous</span>
                                        <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                            <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clipRule="evenodd" />
                                        </svg>
                                    </button>
                                    
                                    {/* Page numbers */}
                                    {Array.from({ length: Math.min(5, userPagination.totalPages) }, (_, i) => {
                                        const pageNum = Math.max(0, Math.min(userPagination.totalPages - 5, currentPage - 2)) + i;
                                        return (
                                            <button
                                                key={pageNum}
                                                onClick={() => setCurrentPage(pageNum)}
                                                className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${
                                                    pageNum === currentPage
                                                        ? 'z-10 bg-orange-600 text-white focus:z-20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-600'
                                                        : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0'
                                                }`}
                                            >
                                                {pageNum + 1}
                                            </button>
                                        );
                                    })}

                                    <button
                                        onClick={() => setCurrentPage(Math.min(userPagination.totalPages - 1, currentPage + 1))}
                                        disabled={userPagination.lastPage}
                                        className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
                                    >
                                        <span className="sr-only">Next</span>
                                        <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                            <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
                                        </svg>
                                    </button>
                                </nav>
                            </div>
                        </div>
                    </div>
                )}

                {errorMessage && (
                    <div className="mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
                        {errorMessage}
                    </div>
                )}
            </div>
        </div>
    );
};

export default UserOrders;
