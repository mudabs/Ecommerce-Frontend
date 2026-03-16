import { useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { AuthContext } from './AuthContextObject';
import { logoutUser } from '../store/actions';

export { AuthContext } from './AuthContextObject';

/**
 * AuthProvider is a thin bridge that exposes the Redux auth slice
 * through React Context, so both useAuth() and any direct useSelector()
 * calls see the same single source of truth.
 */
export const AuthProvider = ({ children }) => {
    const dispatch = useDispatch();
    const { user, isAuthenticated, roles } = useSelector((state) => state.auth);

    const signout = useCallback(
        (navigate) => dispatch(logoutUser(navigate)),
        [dispatch]
    );

    const value = {
        user,
        isAuthenticated,
        roles,
        loading: false,   // loading is handled per-action via local setLoader
        signout,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
