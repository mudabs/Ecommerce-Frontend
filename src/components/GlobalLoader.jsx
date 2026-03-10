import { useContext } from "react";
import { useSelector } from "react-redux";
import Loader from "./shared/Loader";
import { AuthContext } from "../context/AuthContext";

const GlobalLoader = () => {
    const { isLoading } = useSelector((state) => state.errors);
    const { loading: productLoading } = useSelector((state) => state.product);
    const authContext = useContext(AuthContext);
    const authLoading = authContext?.loading ?? false;

    const showLoader = isLoading || productLoading || authLoading;

    if (!showLoader) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-[1px]">
            <div className="rounded-xl bg-white/90 px-6 py-4 shadow-lg">
                <Loader text="Please Wait" height={36} width={36} color="#1c64f2" ariaLabel="global-loading" />
            </div>
        </div>
    );
};

export default GlobalLoader;
