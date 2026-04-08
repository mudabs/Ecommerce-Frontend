import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import {
    fetchProductById,
    fetchProductReviews,
    addProductReview,
    deleteProductReview,
    fetchSimilarProducts,
    addToCart,
} from "../../store/actions";
import StarRating from "../shared/StarRating";
import ProductCard from "../shared/ProductCard";
import { formatPrice } from "../../utils/formatPrice";
import { getBackendImageUrl, handleImageLoadError } from "../../utils/env";

const RATING_LABELS = ["Terrible", "Poor", "Fair", "Good", "Excellent"];

const ReviewForm = ({ productId, onClose }) => {
    const dispatch = useDispatch();
    const [rating, setRating] = useState(0);
    const [hovered, setHovered] = useState(0);
    const [title, setTitle] = useState("");
    const [comment, setComment] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (rating < 1) { toast.error("Please select a star rating."); return; }
        if (title.trim().length < 3) { toast.error("Title must be at least 3 characters."); return; }
        if (comment.trim().length < 10) { toast.error("Comment must be at least 10 characters."); return; }
        setSubmitting(true);
        await dispatch(addProductReview(productId, { rating, title: title.trim(), comment: comment.trim() }, toast, onClose));
        setSubmitting(false);
    };

    return (
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-5 mt-4">
            <h3 className="text-base font-semibold text-slate-800 mb-3">Write a Customer Review</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Star picker */}
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Overall rating</label>
                    <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <button
                                key={star}
                                type="button"
                                className="text-2xl focus:outline-none"
                                onMouseEnter={() => setHovered(star)}
                                onMouseLeave={() => setHovered(0)}
                                onClick={() => setRating(star)}
                                aria-label={`Rate ${star} star${star > 1 ? "s" : ""}`}
                            >
                                <span className={(hovered || rating) >= star ? "text-yellow-400" : "text-slate-300"}>★</span>
                            </button>
                        ))}
                        {(hovered || rating) > 0 && (
                            <span className="ml-2 text-sm text-slate-600 self-center">
                                {RATING_LABELS[(hovered || rating) - 1]}
                            </span>
                        )}
                    </div>
                </div>

                <div>
                    <label htmlFor="review-title" className="block text-sm font-medium text-slate-700 mb-1">
                        Review title
                    </label>
                    <input
                        id="review-title"
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        maxLength={120}
                        placeholder="Summarize your review in a few words"
                        className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                <div>
                    <label htmlFor="review-comment" className="block text-sm font-medium text-slate-700 mb-1">
                        Review body
                    </label>
                    <textarea
                        id="review-comment"
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        maxLength={2000}
                        rows={4}
                        placeholder="What did you like or dislike about this product?"
                        className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    />
                </div>

                <div className="flex gap-3">
                    <button
                        type="submit"
                        disabled={submitting}
                        className="bg-custom-blue text-white px-5 py-2 rounded-md text-sm font-medium hover:brightness-95 disabled:opacity-60"
                    >
                        {submitting ? "Submitting…" : "Submit review"}
                    </button>
                    <button
                        type="button"
                        onClick={onClose}
                        className="border border-slate-300 px-5 py-2 rounded-md text-sm font-medium text-slate-700 hover:bg-slate-100"
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
};

const RatingBar = ({ star, count, total }) => {
    const pct = total > 0 ? Math.round((count / total) * 100) : 0;
    return (
        <div className="flex items-center gap-2 text-sm">
            <span className="w-12 text-right text-slate-600">{star} star</span>
            <div className="flex-1 bg-slate-200 rounded-full h-2.5 overflow-hidden">
                <div className="bg-yellow-400 h-2.5 rounded-full" style={{ width: `${pct}%` }} />
            </div>
            <span className="w-8 text-slate-500">{pct}%</span>
        </div>
    );
};

const ProductDetail = () => {
    const { productId } = useParams();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { selectedProduct, reviews, averageRating, reviewCount, reviewsPagination, similarProducts } =
        useSelector((state) => state.products);
    const { user } = useSelector((state) => state.auth);
    const [showReviewForm, setShowReviewForm] = useState(false);
    const [quantity, setQuantity] = useState(1);

    useEffect(() => {
        if (!productId) return;
        dispatch(fetchProductById(Number(productId)));
        dispatch(fetchProductReviews(Number(productId)));
    }, [dispatch, productId]);

    useEffect(() => {
        if (selectedProduct?.categoryName) {
            dispatch(fetchSimilarProducts(selectedProduct.categoryName, Number(productId)));
        }
    }, [dispatch, selectedProduct?.categoryName, productId]);

    if (!selectedProduct) {
        return (
            <div className="min-h-screen flex items-center justify-center text-slate-500">
                Loading…
            </div>
        );
    }

    const {
        productName,
        image,
        description,
        price,
        specialPrice,
        discount,
        quantity: stock,
        categoryName,
    } = selectedProduct;

    const isAvailable = stock && Number(stock) > 0;
    const displayPrice = specialPrice && specialPrice < price ? specialPrice : price;

    const handleAddToCart = () => {
        dispatch(addToCart({ ...selectedProduct, productId: Number(productId) }, quantity, toast));
    };

    // Rating breakdown (rough approximation from available data)
    const starCounts = reviews.reduce((acc, r) => {
        acc[r.rating] = (acc[r.rating] || 0) + 1;
        return acc;
    }, {});

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            {/* Breadcrumb */}
            <nav className="text-sm text-slate-500 mb-6 flex items-center gap-1">
                <button onClick={() => navigate("/")} className="hover:text-blue-600">Home</button>
                <span>/</span>
                <button onClick={() => navigate("/products")} className="hover:text-blue-600">Products</button>
                {categoryName && (
                    <>
                        <span>/</span>
                        <button
                            onClick={() => navigate(`/products?category=${encodeURIComponent(categoryName)}`)}
                            className="hover:text-blue-600"
                        >
                            {categoryName}
                        </button>
                    </>
                )}
                <span>/</span>
                <span className="text-slate-700 truncate max-w-[200px]">{productName}</span>
            </nav>

            {/* Main product layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
                {/* Left — Product image */}
                <div className="lg:col-span-4">
                    <div className="border border-slate-200 rounded-lg overflow-hidden bg-white flex items-center justify-center p-6 h-96">
                        <img
                            src={getBackendImageUrl(image)}
                            onError={handleImageLoadError}
                            alt={productName}
                            className="max-h-full max-w-full object-contain"
                        />
                    </div>
                </div>

                {/* Center — Product info */}
                <div className="lg:col-span-5 space-y-4">
                    <h1 className="text-2xl font-bold text-slate-900 leading-tight">{productName}</h1>

                    {/* Rating summary */}
                    <div className="flex items-center gap-2">
                        <StarRating rating={averageRating || 0} count={reviewCount} />
                        {reviewCount > 0 && (
                            <span className="text-sm text-blue-600 hover:underline cursor-pointer" onClick={() => document.getElementById("reviews-section")?.scrollIntoView({ behavior: "smooth" })}>
                                {reviewCount} {reviewCount === 1 ? "rating" : "ratings"}
                            </span>
                        )}
                    </div>

                    <hr className="border-slate-200" />

                    {/* Price */}
                    <div className="space-y-1">
                        {specialPrice && specialPrice < price ? (
                            <>
                                <p className="text-sm text-slate-500">
                                    List price: <span className="line-through">{formatPrice(price)}</span>
                                </p>
                                <p className="text-3xl font-bold text-slate-900">{formatPrice(specialPrice)}</p>
                                <p className="text-sm text-green-600 font-medium">
                                    Save {formatPrice(price - specialPrice)} ({discount}% off)
                                </p>
                            </>
                        ) : (
                            <p className="text-3xl font-bold text-slate-900">{formatPrice(price)}</p>
                        )}
                    </div>

                    <hr className="border-slate-200" />

                    {/* Description */}
                    <div>
                        <h2 className="text-sm font-semibold text-slate-700 mb-1">About this item</h2>
                        <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-line">{description}</p>
                    </div>
                </div>

                {/* Right — Buy box */}
                <div className="lg:col-span-3">
                    <div className="border border-slate-200 rounded-lg p-5 shadow-sm space-y-4 sticky top-24">
                        <p className="text-2xl font-bold text-slate-900">{formatPrice(displayPrice)}</p>

                        <p className={`text-sm font-semibold ${isAvailable ? "text-green-600" : "text-red-500"}`}>
                            {isAvailable ? `In Stock (${stock} available)` : "Out of Stock"}
                        </p>

                        {isAvailable && (
                            <div className="flex items-center gap-2">
                                <label className="text-sm text-slate-700">Qty:</label>
                                <select
                                    value={quantity}
                                    onChange={(e) => setQuantity(Number(e.target.value))}
                                    className="border border-slate-300 rounded-md px-2 py-1 text-sm"
                                >
                                    {Array.from({ length: Math.min(stock, 10) }, (_, i) => (
                                        <option key={i + 1} value={i + 1}>{i + 1}</option>
                                    ))}
                                </select>
                            </div>
                        )}

                        <button
                            onClick={handleAddToCart}
                            disabled={!isAvailable}
                            className={`w-full bg-custom-blue text-white py-2.5 rounded-full font-medium text-sm
                                ${isAvailable ? "hover:brightness-95" : "opacity-60 cursor-not-allowed"}`}
                        >
                            Add to Cart
                        </button>

                        <div className="text-xs text-slate-500 space-y-1 pt-1">
                            <p>✓ Secure transaction</p>
                            <p>✓ Ships within 2–5 business days</p>
                            <p>✓ 30-day return policy</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Reviews section */}
            <section id="reviews-section" className="border-t border-slate-200 pt-8 mb-12">
                <h2 className="text-xl font-bold text-slate-900 mb-6">Customer Reviews</h2>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                    {/* Rating summary panel */}
                    <div className="md:col-span-3 space-y-3">
                        <div className="flex items-baseline gap-2">
                            <span className="text-5xl font-bold text-slate-900">
                                {reviewCount > 0 ? (averageRating || 0).toFixed(1) : "—"}
                            </span>
                            <span className="text-slate-500">/ 5</span>
                        </div>
                        {reviewCount > 0 && <StarRating rating={averageRating || 0} showCount={false} size="text-xl" />}
                        <p className="text-sm text-slate-500">{reviewCount} {reviewCount === 1 ? "review" : "reviews"}</p>

                        {/* Rating breakdown bars */}
                        {reviewCount > 0 && (
                            <div className="space-y-1.5 mt-2">
                                {[5, 4, 3, 2, 1].map((star) => (
                                    <RatingBar key={star} star={star} count={starCounts[star] || 0} total={reviewCount} />
                                ))}
                            </div>
                        )}

                        {/* Write review CTA */}
                        <div className="mt-4">
                            <p className="text-sm font-semibold text-slate-700 mb-2">Review this product</p>
                            <p className="text-xs text-slate-500 mb-3">Share your thoughts with other customers</p>
                            {user ? (
                                <button
                                    onClick={() => setShowReviewForm((v) => !v)}
                                    className="w-full border border-slate-300 text-sm text-slate-800 py-2 px-4 rounded-md hover:bg-slate-100 font-medium"
                                >
                                    {showReviewForm ? "Cancel" : "Write a customer review"}
                                </button>
                            ) : (
                                <button
                                    onClick={() => navigate("/login")}
                                    className="w-full bg-custom-blue text-white text-sm py-2 px-4 rounded-md hover:brightness-95 font-medium"
                                >
                                    Log in to review
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Review list */}
                    <div className="md:col-span-9">
                        {showReviewForm && (
                            <ReviewForm productId={Number(productId)} onClose={() => setShowReviewForm(false)} />
                        )}

                        {reviews.length === 0 ? (
                            <div className="text-center py-12 text-slate-500">
                                <p className="text-4xl mb-3">📝</p>
                                <p className="text-base font-medium">No reviews yet</p>
                                <p className="text-sm mt-1">Be the first to review this product!</p>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {reviews.map((review) => (
                                    <div
                                        key={review.reviewId}
                                        className="border-b border-slate-100 pb-5 last:border-0"
                                    >
                                        <div className="flex items-start justify-between mb-1">
                                            <div>
                                                <p className="font-semibold text-slate-800 text-sm">{review.username}</p>
                                                <StarRating rating={review.rating} showCount={false} size="text-sm" />
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs text-slate-400">
                                                    {new Date(review.createdAt).toLocaleDateString("en-US", {
                                                        year: "numeric", month: "long", day: "numeric",
                                                    })}
                                                </span>
                                                {user && (user.userId === review.userId || user.roles?.includes?.("ROLE_ADMIN")) && (
                                                    <button
                                                        onClick={() => dispatch(deleteProductReview(Number(productId), review.reviewId, toast))}
                                                        className="text-xs text-red-500 hover:underline"
                                                    >
                                                        Delete
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                        <p className="text-sm font-semibold text-slate-700 mt-2">{review.title}</p>
                                        <p className="text-sm text-slate-600 mt-1 leading-relaxed">{review.comment}</p>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Load more */}
                        {!reviewsPagination?.lastPage && (
                            <button
                                onClick={() => dispatch(fetchProductReviews(Number(productId), (reviewsPagination?.pageNumber || 0) + 1))}
                                className="mt-4 text-sm text-blue-600 hover:underline"
                            >
                                Load more reviews
                            </button>
                        )}
                    </div>
                </div>
            </section>

            {/* Similar products */}
            {similarProducts.length > 0 && (
                <section className="border-t border-slate-200 pt-8">
                    <h2 className="text-xl font-bold text-slate-900 mb-6">Similar Products</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {similarProducts.slice(0, 4).map((p) => (
                            <ProductCard
                                key={p.productId}
                                productId={p.productId}
                                productName={p.productName}
                                image={p.image}
                                description={p.description}
                                quantity={p.quantity}
                                price={p.price}
                                discount={p.discount}
                                specialPrice={p.specialPrice}
                            />
                        ))}
                    </div>
                </section>
            )}
        </div>
    );
};

export default ProductDetail;
