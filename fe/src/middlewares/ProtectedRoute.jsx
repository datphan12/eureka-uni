import { useAuthStore } from "@store";
import { Navigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";

export const RequireAuth = ({ children }) => {
    const user = useAuthStore((state) => state.user);
    const accessToken = localStorage.getItem("accessToken");
    const location = useLocation();

    if (!user || !accessToken) {
        return <Navigate to="/dang-nhap" state={{ from: location }} replace />;
    }

    return children;
};

export const RequireAdmin = ({ children }) => {
    const { user, hasRole } = useAuthStore();
    const accessToken = localStorage.getItem("accessToken");
    const location = useLocation();

    if (!user || !accessToken) {
        return <Navigate to="/dang-nhap" state={{ from: location }} replace />;
    }

    if (!hasRole("Admin")) {
        return <Navigate to="/" replace />;
    }

    return children;
};

export const RequireGuest = ({ children }) => {
    const { user, hasRole } = useAuthStore();
    const accessToken = localStorage.getItem("accessToken");
    const location = useLocation();

    if (user && accessToken) {
        if (hasRole("Admin")) {
            return <Navigate to="/admin" replace />;
        }

        const from = location.state?.from?.pathname || "/";
        return <Navigate to={from} replace />;
    }

    return children;
};
