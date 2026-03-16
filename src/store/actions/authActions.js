import authService from "../../services/authService";

export const authenticateSignInUser =
    (data, toast, reset, navigate, setLoader) => async (dispatch) => {
        setLoader(true);
        try {
            const response = await authService.signin(data);
            const user = response?.user ?? response;

            localStorage.setItem("user", JSON.stringify(user));
            dispatch({ type: "AUTH_LOGIN_SUCCESS", payload: user });

            toast.success("Logged in successfully!");
            reset();
            navigate("/");
        } catch (error) {
            const message =
                (typeof error === "string" ? error : error?.message || error?.error) ||
                "Invalid username or password";
            toast.error(message);
        } finally {
            setLoader(false);
        }
    };

export const registerNewUser =
    (data, toast, reset, navigate, setLoader) => async (_dispatch) => {
        setLoader(true);
        try {
            await authService.signup(data);

            toast.success("Account created! Please log in.");
            reset();
            navigate("/login");
        } catch (error) {
            const message =
                (typeof error === "string" ? error : error?.message || error?.error) ||
                "Registration failed. Please try again.";
            toast.error(message);
        } finally {
            setLoader(false);
        }
    };

export const logoutUser = (navigate) => async (dispatch) => {
    try {
        await authService.signout();
    } catch {
        // ignore server errors on logout
    } finally {
        localStorage.removeItem("user");
        dispatch({ type: "AUTH_LOGOUT" });
        navigate("/login");
    }
};
