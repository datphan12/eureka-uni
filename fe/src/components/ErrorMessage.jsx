import { twMerge } from "tailwind-merge";

const ErrorMessage = ({ value, className }) => {
    return <span className={twMerge("text-sm text-red-500 italic", className)}>{value}</span>;
};

export default ErrorMessage;
