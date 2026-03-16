const InputField = ({
    label,
    id,
    type = "text",
    placeholder,
    register,
    errors,
    required = false,
    message,
    min,
}) => {
    return (
        <div className="flex flex-col gap-1">
            <label
                htmlFor={id}
                className="text-sm font-semibold text-slate-700"
            >
                {label}
                {required && <span className="text-red-500 ml-0.5">*</span>}
            </label>
            <input
                id={id}
                type={type}
                placeholder={placeholder}
                {...register(id, {
                    required: required ? message : false,
                    ...(min ? { minLength: { value: min, message: `*Minimum ${min} characters required` } } : {}),
                    ...(type === "email"
                        ? {
                              pattern: {
                                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                                  message: "*Enter a valid email address",
                              },
                          }
                        : {}),
                })}
                className={`border rounded-md px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                    errors[id]
                        ? "border-red-400 focus:ring-red-400"
                        : "border-gray-300"
                }`}
            />
            {errors[id] && (
                <span className="text-xs text-red-500">{errors[id].message}</span>
            )}
        </div>
    );
};

export default InputField;
