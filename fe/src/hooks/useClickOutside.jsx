import { useEffect, useRef } from "react";

const useClickOutside = (callback, isActive = true) => {
    const ref = useRef(null);

    useEffect(() => {
        if (!isActive) return;

        const handleClickOutside = (event) => {
            event.stopPropagation();
            if (ref.current && !ref.current.contains(event.target)) {
                callback();
            }
        };

        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [callback, isActive]);

    return ref;
};

export default useClickOutside;
