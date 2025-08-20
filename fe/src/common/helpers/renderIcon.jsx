import React from "react";

export const renderIcon = (icon) => {
    if (React.isValidElement(icon)) {
        return icon;
    }
};
