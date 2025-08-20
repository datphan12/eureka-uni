import React, { useState } from "react";
import { Loading } from "@components";
import { useLocation, useNavigate } from "react-router-dom";
import { API } from "@utils";
import { toast } from "react-toastify";

const ResetPassword = () => {
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState({ password: "", confirmPassword: "", showPassword: false });
    const [success, setSuccess] = useState(false);

    const navigate = useNavigate();
    const location = useLocation();
    const query = new URLSearchParams(location.search);
    const token = query.get("token");

    const handleSubmit = async () => {
        if (
            data.password.trim() === "" ||
            data.confirmPassword.trim() === "" ||
            data.password !== data.confirmPassword
        ) {
            toast.error("Mật khẩu và xác nhận mật khẩu không chính xác");
            return;
        }

        if (data.password.length < 8) {
            toast.error("Mật khẩu phải có ít nhất 8 ký tự");
            return;
        }
        try {
            setLoading(true);
            const res = await API.get(`/auth/reset-password?token=${token}&password=${data.password}`);
            if (res.data.success) {
                toast.success(res.data.message);
                setSuccess(true);
            } else {
                toast.error(res.data.message);
                setSuccess(false);
            }
        } catch (error) {
            toast.error(error.message);
            setSuccess(false);
        } finally {
            setLoading(false);
        }
    };
    return (
        <>
            {success && (
                <div className="fixed left-0 right-0 flex justify-center p-6">
                    <div className="flex items-center">
                        <p>Đã đặt lại mật khẩu thành công! Bạn có thể đóng trang này.</p>
                        <p></p>
                        <button
                            className="border border-gray-300 rounded-md px-2 py-1 ml-4 hover:bg-gray-200"
                            onClick={() => navigate("/dang-nhap")}
                        >
                            Quay lại
                        </button>
                    </div>
                </div>
            )}

            {!success && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <div className="bg-white rounded-xl shadow-lg p-6 min-w-[90%] md:min-w-[500px] relative">
                        <p className="text-center mb-4 text-lg font-semibold">Đặt lại mật khẩu mới</p>
                        <div className="flex flex-col gap-y-2">
                            <div className="flex flex-col gap-y-1">
                                <span className="italic">Nhập mật khẩu mới</span>
                                <input
                                    type={data.showPassword ? "text" : "password"}
                                    value={data.password}
                                    onChange={(e) => setData({ ...data, password: e.target.value })}
                                    className="border-2 border-gray-300 rounded-lg p-2"
                                />
                            </div>

                            <div className="flex flex-col gap-y-1">
                                <span className="italic">Xác nhận lại mật khẩu</span>
                                <input
                                    type={data.showPassword ? "text" : "password"}
                                    value={data.confirmPassword}
                                    onChange={(e) => setData({ ...data, confirmPassword: e.target.value })}
                                    className="border-2 border-gray-300 rounded-lg p-2"
                                />
                            </div>
                            <div
                                className="flex items-center w-fit cursor-pointer"
                                onClick={() => setData({ ...data, showPassword: !data.showPassword })}
                            >
                                <input type="checkbox" checked={data.showPassword} className="mr-2" />
                                <span className="text-sm">Hiển thị mật khẩu</span>
                            </div>
                            <button
                                onClick={handleSubmit}
                                className="bg-blue-500 mt-4 text-white rounded-lg px-2 py-1.5 cursor-pointer hover:bg-blue-400 flex justify-center"
                            >
                                {loading ? <Loading className="w-6 h-6" /> : "Đặt lại mật khẩu"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default ResetPassword;
