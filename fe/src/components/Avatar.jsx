import { twMerge } from "tailwind-merge";
import { avatar } from "@assets";

const Avatar = ({ src, className }) => {
    return (
        <div className={twMerge("w-8 h-8 overflow-hidden flex-center border border-gray-300 rounded-full", className)}>
            <img
                src={src ? src : avatar}
                alt="avatar"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover rounded-full"
                onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = avatar;
                }}
            />
        </div>
    );
};

export default Avatar;
