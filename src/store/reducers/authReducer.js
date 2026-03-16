const storedUser = (() => {
    try {
        const raw = localStorage.getItem("user");
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
})();

const initialState = {
    user: storedUser,
    isAuthenticated: !!storedUser,
    roles: storedUser?.roles ?? [],
};

export const AuthReducer = (state = initialState, action) => {
    switch (action.type) {
        case "AUTH_LOGIN_SUCCESS":
            return {
                ...state,
                user: action.payload,
                isAuthenticated: true,
                roles: action.payload?.roles ?? [],
            };
        case "AUTH_LOGOUT":
            return {
                ...state,
                user: null,
                isAuthenticated: false,
                roles: [],
            };
        default:
            return state;
    }
};
