const RenderStatus = ({ data, trueValue, falseValue }) => {
    return (
        <span
            className={`px-2 py-1 rounded-full text-xs ${
                data ? "bg-green-100 text-green-900" : "bg-red-100 text-red-800"
            }`}
        >
            {data ? trueValue : falseValue}
        </span>
    );
};

export default RenderStatus;
