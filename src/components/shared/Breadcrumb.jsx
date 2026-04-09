import { Link, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { FiChevronRight, FiHome } from "react-icons/fi";

const SEGMENT_LABELS = {
    products: "Products",
    about: "About",
    contact: "Contact",
    cart: "Cart",
    checkout: "Checkout",
    "order-confirm": "Order Confirmation",
    profile: "Profile",
    orders: "Orders",
    account: "Account Info",
    addresses: "Addresses",
    payments: "Payment Methods",
    admin: "Admin",
    sellers: "Sellers",
    categories: "Categories",
};

// Paths where the breadcrumb should never appear
const HIDDEN_PATHS = new Set(["/", "/login", "/register"]);

/**
 * Breadcrumb navigation bar.
 *
 * Props:
 *   adminStyle {boolean} — uses admin content padding (px-4 sm:px-6 xl:px-8) instead of
 *                          the default page padding (lg:px-14 sm:px-8 px-4).
 *                          When false (default), also suppresses rendering on /admin/* paths
 *                          so AdminLayout can render its own breadcrumb with correct indentation.
 */
const Breadcrumb = ({ adminStyle = false }) => {
    const location = useLocation();
    const selectedProduct = useSelector((state) => state.products?.selectedProduct);

    const path = location.pathname;

    if (HIDDEN_PATHS.has(path)) return null;
    if (!adminStyle && path.startsWith("/admin")) return null;

    const segments = path.split("/").filter(Boolean);
    if (segments.length === 0) return null;

    const crumbs = [];
    let accumulated = "";

    for (let i = 0; i < segments.length; i++) {
        const seg = segments[i];
        accumulated += `/${seg}`;
        const isId = /^\d+$/.test(seg);
        const isLast = i === segments.length - 1;

        if (isId) {
            const prev = i > 0 ? segments[i - 1] : null;
            let label;
            if (prev === "products" && selectedProduct?.productName) {
                label = selectedProduct.productName;
            } else if (prev === "orders") {
                label = `Order #${seg}`;
            } else {
                label = `#${seg}`;
            }
            crumbs.push({ label, href: accumulated, current: true });
        } else {
            // /admin alone (no sub-path) is the Dashboard
            const label =
                seg === "admin" && isLast
                    ? "Dashboard"
                    : SEGMENT_LABELS[seg] ||
                      seg.charAt(0).toUpperCase() + seg.slice(1).replace(/-/g, " ");
            crumbs.push({ label, href: accumulated, current: isLast });
        }
    }

    const containerClass = adminStyle
        ? "px-4 sm:px-6 xl:px-8 py-3 border-b border-slate-200 bg-slate-50"
        : "lg:px-14 sm:px-8 px-4 py-2.5 border-b border-slate-200 bg-slate-50";

    return (
        <nav aria-label="Breadcrumb" className={containerClass}>
            <ol className="flex items-center gap-1 flex-wrap">
                <li>
                    <Link
                        to="/"
                        className="flex items-center text-slate-500 hover:text-custom-blue transition-colors"
                        aria-label="Home"
                    >
                        <FiHome size={14} />
                    </Link>
                </li>
                {crumbs.map((crumb) => (
                    <li key={crumb.href} className="flex items-center gap-1">
                        <FiChevronRight size={14} className="text-slate-400 shrink-0" />
                        {crumb.current ? (
                            <span className="text-sm text-slate-700 font-medium truncate max-w-xs">
                                {crumb.label}
                            </span>
                        ) : (
                            <Link
                                to={crumb.href}
                                className="text-sm text-slate-500 hover:text-custom-blue transition-colors truncate max-w-xs"
                            >
                                {crumb.label}
                            </Link>
                        )}
                    </li>
                ))}
            </ol>
        </nav>
    );
};

export default Breadcrumb;
