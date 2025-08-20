import { create } from "zustand";
import API from "../common/utils/axios";
import useRecommend from "./useRecommend";
import useGroupStore from "./useGroupStore";
import { toast } from "react-toastify";

const useAuthStore = create((set, get) => {
    const savedUser = JSON.parse(localStorage.getItem("user"));

    return {
        user: savedUser || null,

        addKhoaHocDangKy: (khDK) => {
            const currentUser = get().user || {};
            const currentKH = currentUser.khoaHocDangKys || [];
            const updatedUser = {
                ...currentUser,
                khoaHocDangKys: [...currentKH, khDK],
            };
            set({ user: updatedUser });
            localStorage.setItem("user", JSON.stringify(updatedUser));
        },

        setUser: (user) => {
            const { matKhau, ...safeUser } = user;
            localStorage.setItem("user", JSON.stringify(safeUser));
            set({ user: safeUser });
        },

        login: async (data) => {
            try {
                const res = await API.post("/auth/login", data);
                if (!res.data.success) {
                    if (res.data.daKichHoat && !res.data.daKichHoat) {
                        toast.error("Vui lòng kiểm tra email để kích hoạt tài khoản!", { autoClose: 3000 });
                        return { success: false, error: "Email chưa được kích hoạt" };
                    } else if (res.data.deletedAt !== null) {
                        toast.error("Tài khoản đã bị xóa", { autoClose: 3000 });
                        return { success: false, error: "Tài khoản đã bị xóa" };
                    }
                } else if (res.data.success) {
                    const { user, accessToken } = res.data;
                    const currentUser = await API.post("/nguoidung/email", { email: user.email });
                    get().setUser(currentUser.data);
                    localStorage.setItem("accessToken", accessToken);

                    return { success: true, vaiTro: user.vaiTro };
                }
            } catch (error) {
                const errorMsg = error.response?.data?.message || {};
                return { success: false, error: errorMsg };
            }
        },

        signUp: async (data) => {
            try {
                const res = await API.post("/auth/sign-up", data);
                return {
                    success: res.data.success,
                };
            } catch (error) {
                const errorMsg = error.response?.data?.message || {};
                return { success: false, error: errorMsg };
            }
        },

        loginWithGoogle: async () => {
            window.location.href = `${import.meta.env.VITE_NESTJS_API_URL}/auth/google`;
        },

        loginWithFacebook: async () => {
            window.location.href = `${import.meta.env.VITE_NESTJS_API_URL}/auth/facebook`;
        },

        logout: () => {
            localStorage.removeItem("user");
            localStorage.removeItem("accessToken");
            set({ user: null });
            useRecommend.getState().clearRecommendations();
            useGroupStore.getState().clearGroup();
        },

        hasRole: (role) => {
            return get().user?.vaiTro === role;
        },
    };
});

export default useAuthStore;
