const initialState = {
    messages: [],
    isLoading: false,
    isOpen: false,
};

export const chatReducer = (state = initialState, action) => {
    switch (action.type) {
        case "LOGIN_USER":
        case "LOG_OUT":
            return { ...initialState };
        case "CHAT_TOGGLE":
            return { ...state, isOpen: !state.isOpen };
        case "CHAT_OPEN":
            return { ...state, isOpen: true };
        case "CHAT_CLOSE":
            return { ...state, isOpen: false };
        case "CHAT_ADD_USER_MESSAGE":
            return {
                ...state,
                messages: [
                    ...state.messages,
                    { role: "user", content: action.payload, timestamp: Date.now() },
                ],
            };
        case "CHAT_LOADING":
            return { ...state, isLoading: true };
        case "CHAT_RESPONSE":
            return {
                ...state,
                isLoading: false,
                messages: [
                    ...state.messages,
                    {
                        role: "assistant",
                        content: action.payload.message,
                        products: action.payload.products || null,
                        toolsUsed: action.payload.toolsUsed || null,
                        timestamp: Date.now(),
                    },
                ],
            };
        case "CHAT_ERROR":
            return {
                ...state,
                isLoading: false,
                messages: [
                    ...state.messages,
                    {
                        role: "assistant",
                        content: action.payload || "Sorry, something went wrong. Please try again.",
                        isError: true,
                        timestamp: Date.now(),
                    },
                ],
            };
        case "CHAT_CLEAR":
            return { ...state, messages: [], isLoading: false };
        default:
            return state;
    }
};
