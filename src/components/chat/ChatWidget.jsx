import { useState, useRef, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { sendChatMessage, clearChatHistory, toggleChat } from "../../store/actions";
import { IoMdSend, IoMdClose } from "react-icons/io";
import { BsChatDotsFill, BsTrash } from "react-icons/bs";
import { FiShoppingBag } from "react-icons/fi";
import ChatProductCard from "./ChatProductCard";

const ChatWidget = () => {
    const dispatch = useDispatch();
    const { messages, isLoading, isOpen } = useSelector((state) => state.chat);
    const { user } = useSelector((state) => state.auth);
    const [input, setInput] = useState("");
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, isLoading]);

    useEffect(() => {
        if (isOpen && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isOpen]);

    const handleSend = () => {
        const trimmed = input.trim();
        if (!trimmed || isLoading) return;
        setInput("");
        dispatch(sendChatMessage(trimmed));
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const handleClear = () => {
        dispatch(clearChatHistory());
    };

    if (!user) return null;

    return (
        <>
            {/* Floating toggle button */}
            {!isOpen && (
                <button
                    onClick={() => dispatch(toggleChat())}
                    className="fixed bottom-6 right-6 z-50 bg-custom-blue text-white p-4 rounded-full shadow-lg hover:scale-105 transition-transform duration-200"
                    aria-label="Open AI Assistant"
                >
                    <BsChatDotsFill size={24} />
                </button>
            )}

            {/* Chat panel */}
            {isOpen && (
                <div className="fixed bottom-6 right-6 z-50 w-[400px] max-w-[calc(100vw-2rem)] h-[600px] max-h-[calc(100vh-4rem)] bg-white rounded-2xl shadow-2xl flex flex-col border border-gray-200 overflow-hidden">
                    {/* Header */}
                    <div className="bg-custom-blue text-white px-4 py-3 flex items-center justify-between flex-shrink-0">
                        <div className="flex items-center gap-2">
                            <FiShoppingBag size={20} />
                            <div>
                                <h3 className="font-semibold text-sm">SmartCart AI</h3>
                                <p className="text-xs text-blue-100">Shopping Assistant</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={handleClear}
                                className="p-1.5 hover:bg-white/20 rounded-md transition"
                                title="Clear conversation"
                            >
                                <BsTrash size={14} />
                            </button>
                            <button
                                onClick={() => dispatch(toggleChat())}
                                className="p-1.5 hover:bg-white/20 rounded-md transition"
                            >
                                <IoMdClose size={18} />
                            </button>
                        </div>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 bg-gray-50">
                        {messages.length === 0 && !isLoading && (
                            <div className="text-center text-gray-400 mt-8">
                                <FiShoppingBag size={40} className="mx-auto mb-3 text-gray-300" />
                                <p className="text-sm font-medium">Hi! I&apos;m SmartCart AI</p>
                                <p className="text-xs mt-1">Ask me about products, your cart, or get recommendations.</p>
                                <div className="mt-4 space-y-2">
                                    {[
                                        "Find me a laptop under $800",
                                        "What's in my cart?",
                                        "Recommend something for me",
                                    ].map((suggestion) => (
                                        <button
                                            key={suggestion}
                                            onClick={() => {
                                                setInput(suggestion);
                                                dispatch(sendChatMessage(suggestion));
                                            }}
                                            className="block w-full text-left text-xs px-3 py-2 bg-white border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition"
                                        >
                                            {suggestion}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {messages.map((msg, idx) => (
                            <div key={idx} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                                <div className={`max-w-[85%] ${msg.role === "user" ? "" : ""}`}>
                                    <div
                                        className={`px-3 py-2 rounded-xl text-sm leading-relaxed whitespace-pre-wrap ${
                                            msg.role === "user"
                                                ? "bg-custom-blue text-white rounded-br-sm"
                                                : msg.isError
                                                ? "bg-red-50 text-red-700 border border-red-200 rounded-bl-sm"
                                                : "bg-white text-gray-800 border border-gray-200 rounded-bl-sm shadow-sm"
                                        }`}
                                    >
                                        {msg.content}
                                    </div>

                                    {/* Inline product cards */}
                                    {msg.products && msg.products.length > 0 && (
                                        <div className="mt-2 space-y-2">
                                            {msg.products.slice(0, 5).map((product) => (
                                                <ChatProductCard key={product.productId} product={product} />
                                            ))}
                                            {msg.products.length > 5 && (
                                                <p className="text-xs text-gray-400 pl-1">
                                                    +{msg.products.length - 5} more products
                                                </p>
                                            )}
                                        </div>
                                    )}

                                    {/* Tools used indicator */}
                                    {msg.toolsUsed && msg.toolsUsed.length > 0 && (
                                        <div className="flex flex-wrap gap-1 mt-1.5">
                                            {msg.toolsUsed.map((tool, i) => (
                                                <span
                                                    key={i}
                                                    className="text-[10px] px-1.5 py-0.5 bg-blue-50 text-blue-500 rounded-full border border-blue-100"
                                                >
                                                    {tool}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}

                        {/* Loading indicator */}
                        {isLoading && (
                            <div className="flex justify-start">
                                <div className="bg-white border border-gray-200 rounded-xl rounded-bl-sm px-4 py-3 shadow-sm">
                                    <div className="flex gap-1.5">
                                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <div className="px-3 py-3 bg-white border-t border-gray-200 flex-shrink-0">
                        <div className="flex items-center gap-2">
                            <input
                                ref={inputRef}
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="Ask about products, cart, or recommendations..."
                                className="flex-1 text-sm px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400"
                                disabled={isLoading}
                                maxLength={2000}
                            />
                            <button
                                onClick={handleSend}
                                disabled={!input.trim() || isLoading}
                                className="p-2 bg-custom-blue text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                            >
                                <IoMdSend size={18} />
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default ChatWidget;
