import { RotatingLines } from "react-loader-spinner";

const Loader = ({
    text = "Loading...",
    height = 20,
    width = 20,
    color = "#00BFFF",
    strokeWidth = 4,
    animationDuration = 0.75,
    ariaLabel = "loading",
    className = "",
}) => {
    return (
        <div className={`inline-flex items-center gap-2 ${className}`.trim()}>
            <RotatingLines
                height={height}
                width={width}
                color={color}
                strokeColor={color}
                strokeWidth={strokeWidth}
                animationDuration={animationDuration}
                ariaLabel={ariaLabel}
            />
            <span>{text}</span>
        </div>
    );
};

export default Loader;
