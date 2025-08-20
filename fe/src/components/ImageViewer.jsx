import React, { useState } from "react";
import { twMerge } from "tailwind-merge";
import ReactDOM from "react-dom";
import { cancel_icon } from "@assets";

const ImageViewer = ({ src, className }) => {
    const [isFullScreen, setIsFullScreen] = useState(false);

    const handleImageClick = () => {
        setIsFullScreen(!isFullScreen);
    };

    return (
        <span className="relative flex justify-center">
            <img
                src={src}
                alt="image"
                className={twMerge("max-w-[200px] cursor-pointer object-cover", className)}
                onClick={handleImageClick}
            />

            {isFullScreen &&
                ReactDOM.createPortal(
                    <span
                        className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center"
                        onClick={handleImageClick}
                    >
                        <img
                            src={src}
                            alt="image"
                            className="max-w-full max-h-full object-contain"
                            loading="lazy"
                            onClick={(e) => e.stopPropagation()}
                        />

                        <button
                            className="absolute top-8 right-8 text-white text-4xl w-10 h-10 flex items-center justify-center rounded-full bg-primary/60 hover:bg-white"
                            onClick={handleImageClick}
                        >
                            <img src={cancel_icon} alt="icon" className="w-6 h-6" />
                        </button>
                    </span>,
                    document.body
                )}
        </span>
    );
};

export default ImageViewer;
