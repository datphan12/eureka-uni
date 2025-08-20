import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuthStore } from "@store";
import { vaiTro } from "../../common/types/role.enum";
import { API } from "@utils";

const Google = () => {
    const { setUser } = useAuthStore();
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const query = new URLSearchParams(location.search);
        const accessToken = query.get("accessToken");
        const email = query.get("email");

        const fetchUser = async () => {
            if (accessToken) {
                localStorage.setItem("accessToken", accessToken);

                try {
                    const res = await API.post("/nguoidung/email", { email });
                    setUser(res.data);

                    if (res.data.vaiTro === vaiTro.ADMIN) navigate("/admin");
                    else navigate("/");
                } catch (error) {
                    console.log("Lỗi khi lấy user:", error);
                    navigate("/dang-nhap");
                }
            }
        };

        fetchUser();
    }, []);

    return <p>Đang đăng nhập...</p>;
};

export default Google;
