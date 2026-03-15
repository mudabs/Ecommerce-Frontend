const truncateText = (text = '', maxLength = 50) => {
    const normalized = typeof text === 'string' ? text : String(text ?? '');

    if (normalized.length <= maxLength) {
        return normalized;
    }

    return `${normalized.slice(0, Math.max(maxLength - 3, 0)).trimEnd()}...`;
};

export default truncateText;
