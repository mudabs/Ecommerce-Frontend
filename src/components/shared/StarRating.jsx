import { FaStar, FaStarHalfAlt, FaRegStar } from "react-icons/fa";

const StarRating = ({ rating = 0, count = null, size = "text-base", showCount = true }) => {
    const stars = Array.from({ length: 5 }, (_, i) => {
        const filled = i + 1 <= Math.floor(rating);
        const half = !filled && i < rating;
        return { filled, half };
    });

    return (
        <span className="inline-flex items-center gap-1">
            <span className={`flex items-center gap-0.5 ${size}`}>
                {stars.map(({ filled, half }, i) =>
                    filled ? (
                        <FaStar key={i} className="text-yellow-400" />
                    ) : half ? (
                        <FaStarHalfAlt key={i} className="text-yellow-400" />
                    ) : (
                        <FaRegStar key={i} className="text-yellow-400" />
                    )
                )}
            </span>
            {showCount && count !== null && (
                <span className="text-sm text-slate-500 ml-1">({count})</span>
            )}
        </span>
    );
};

export default StarRating;
