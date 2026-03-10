const TextTruncate = ({ text = "", maxLength = 50, className = "" }) => {
    const normalized = typeof text === "string" ? text : String(text ?? "");

    if (normalized.length <= maxLength) {
        return <span className={className}>{normalized}</span>;
    }

    const truncated = normalized.slice(0, Math.max(0, maxLength - 3)).trimEnd();
    return (
        <span className={className} title={normalized}>
            {truncated}...
        </span>
    );
};

export default TextTruncate;
