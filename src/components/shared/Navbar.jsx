import { Badge } from "@mui/material";
import { useEffect, useState } from "react";
import { FaShoppingCart, FaSignInAlt, FaStore } from "react-icons/fa";
import { FiSearch } from "react-icons/fi";
import { IoIosMenu } from "react-icons/io";
import { RxCross2 } from "react-icons/rx";
import { useSelector } from "react-redux";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import UserMenu from "../UserMenu";

const Navbar = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const path = location.pathname;
    const [navbarOpen, setNavbarOpen] = useState(false);
    const [searchValue, setSearchValue] = useState("");
    const { cart } = useSelector((state) => state.carts);
    const { user } = useSelector((state) => state.auth);
    const isAuthenticated = Boolean(user && (user?.id || user?.username || user?.email));

    useEffect(() => {
        if (path === "/products") {
            setSearchValue(searchParams.get("keyword") || "");
        } else {
            setSearchValue("");
        }
    }, [path, searchParams]);

    const clearSearch = () => {
        setSearchValue("");

        const params = new URLSearchParams(searchParams);
        params.delete("keyword");
        params.delete("page");

        const queryString = params.toString();
        navigate(queryString ? `/products?${queryString}` : "/products");
        setNavbarOpen(false);
    };

    const handleSearchSubmit = (event) => {
        event.preventDefault();

        const params = path === "/products"
            ? new URLSearchParams(searchParams)
            : new URLSearchParams();

        params.delete("page");

        const normalizedSearch = searchValue.trim();
        if (normalizedSearch) {
            params.set("keyword", normalizedSearch);
        } else {
            params.delete("keyword");
        }

        const queryString = params.toString();
        navigate(queryString ? `/products?${queryString}` : "/products");
        setNavbarOpen(false);
    };
    
    return (
        <div className="h-17.5 bg-custom-gradient text-white z-50 flex items-center sticky top-0">
            <div className="lg:px-14 sm:px-8 px-4 w-full flex items-center gap-4 justify-between">
                <Link to="/" className="flex items-center text-2xl font-bold">
                    <FaStore className="mr-2 text-3xl" />
                    <span className="font-[Poppins]">Smartcart</span>
                </Link>

                <form
                    onSubmit={handleSearchSubmit}
                    className="hidden md:flex flex-1 max-w-2xl items-center"
                >
                    <div className="flex w-full overflow-hidden rounded-md border border-white/20 bg-white">
                        <div className="flex items-center px-3 text-slate-500">
                            <FiSearch size={18} />
                        </div>
                        <input
                            type="text"
                            value={searchValue}
                            onChange={(event) => setSearchValue(event.target.value)}
                            placeholder="Search products"
                            className="w-full bg-transparent px-2 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none"
                        />
                        {searchValue ? (
                            <button
                                type="button"
                                onClick={clearSearch}
                                aria-label="Clear search"
                                className="px-3 text-slate-500 transition-colors hover:text-slate-800"
                            >
                                <RxCross2 size={18} />
                            </button>
                        ) : null}
                        <button
                            type="submit"
                            className="bg-slate-900 px-4 text-sm font-semibold text-white transition-colors hover:bg-slate-800"
                        >
                            Search
                        </button>
                    </div>
                </form>

                        <ul className={`flex sm:gap-10 gap-4 sm:items-center  text-slate-800 sm:static absolute left-0 top-17.5 sm:shadow-none shadow-md ${
            navbarOpen ? "h-fit sm:pb-0 pb-5" : "h-0 overflow-hidden"
          }  transition-all duration-100 sm:h-fit sm:bg-none bg-custom-gradient   text-white sm:w-fit w-full sm:flex-row flex-col px-4 sm:px-0`}>
                <li className="md:hidden block pt-3">
                    <form onSubmit={handleSearchSubmit} className="flex items-center gap-2">
                        <div className="flex w-full items-center rounded-md bg-white px-3">
                            <FiSearch className="text-slate-500" size={18} />
                            <input
                                type="text"
                                value={searchValue}
                                onChange={(event) => setSearchValue(event.target.value)}
                                placeholder="Search products"
                                className="w-full bg-transparent px-3 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none"
                            />
                            {searchValue ? (
                                <button
                                    type="button"
                                    onClick={clearSearch}
                                    aria-label="Clear search"
                                    className="text-slate-500 transition-colors hover:text-slate-800"
                                >
                                    <RxCross2 size={18} />
                                </button>
                            ) : null}
                        </div>
                        <button
                            type="submit"
                            className="rounded-md bg-slate-900 px-3 py-2.5 text-sm font-semibold text-white"
                        >
                            Go
                        </button>
                    </form>
                </li>
                <li className="font-medium transition-all duration-150">
                   <Link className={`${
                    path === "/" ? "text-white font-semibold" : "text-gray-200"
                   }`}
                    to="/">
                        Home
                   </Link> 
                </li>

                <li className="font-medium transition-all duration-150">
                   <Link className={`${
                    path === "/products" ? "text-white font-semibold" : "text-gray-200"
                   }`}
                    to="/products">
                        Products
                   </Link> 
                </li>


                <li className="font-medium transition-all duration-150">
                   <Link className={`${
                    path === "/about" ? "text-white font-semibold" : "text-gray-200"
                   }`}
                    to="/about">
                        About
                   </Link> 
                </li>

                <li className="font-medium transition-all duration-150">
                   <Link className={`${
                    path === "/contact" ? "text-white font-semibold" : "text-gray-200"
                   }`}
                    to="/contact">
                        Contact
                   </Link> 
                </li>

                <li className="font-medium transition-all duration-150">
                   <Link className={`${
                    path === "/cart" ? "text-white font-semibold" : "text-gray-200"
                   }`}
                    to="/cart">
                        <Badge
                            showZero
                            badgeContent={cart?.length || 0}
                            color="primary"
                            overlap="circular"
                            anchorOrigin={{ vertical: 'top', horizontal: 'right', }}>
                                <FaShoppingCart size={25} />
                        </Badge>
                   </Link> 
                </li>

                {isAuthenticated ? (
                    <li className="font-medium transition-all duration-150">
                        <UserMenu />
                    </li>
                ) : (
                <li className="font-medium transition-all duration-150">
                   <Link className="flex items-center space-x-2 px-4 py-1.5 
                            bg-linear-to-r from-purple-600 to-red-500 
                            text-white font-semibold rounded-md shadow-lg 
                            hover:from-purple-500 hover:to-red-400 transition 
                            duration-300 ease-in-out transform "
                    to="/login">
                        <FaSignInAlt />
                        <span>Login</span>
                   </Link> 
                </li>
                )}
            </ul>

            <button
                onClick={() => setNavbarOpen(!navbarOpen)}
                className="sm:hidden flex items-center sm:mt-0 mt-2">
                    {navbarOpen ? (
                        <RxCross2 className="text-white text-3xl" />
                    ) : (
                        <IoIosMenu className="text-white text-3xl" />
                    )}
            </button>
            </div>
        </div>
    )
}

export default Navbar;