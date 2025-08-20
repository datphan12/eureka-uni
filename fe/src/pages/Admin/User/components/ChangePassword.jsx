import React, { useState } from "react";
import { Loading } from "@components";
import { toast } from "react-toastify";
import { API } from "@utils";

const ChangePassword = ({ labelButton, userId }) => {
    const [showModal, setShowModal] = useState(false);
    const [data, setData] = useState({ password: "", confirmPassword: "", showPassword: false });
    const [loading, setLoading] = useState(false);

    console.log("userId", userId);

    const handleClickButton = (e) => {
        e.preventDefault();
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setData({ password: "", confirmPassword: "", showPassword: false });
        setShowModal(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
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
            const res = await API.post(`/nguoidung/reset-password`, {
                password: data.password,
                confirmPassword: data.confirmPassword,
                maNguoiDung: userId,
            });
            if (res.data.success) {
                toast.success(res.data.message);
                handleCloseModal();
            } else {
                toast.error(res.data.message);
            }
        } catch (error) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <button
                onClick={handleClickButton}
                className="border border-gray-400 rounded-md px-4 py-1 text-sm cursor-pointer hover:bg-gray-100"
            >
                {labelButton}
            </button>

            {showModal && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
                    onClick={handleCloseModal}
                >
                    <div
                        className="bg-white rounded-xl shadow-lg p-6 min-w-[90%] md:min-w-[500px] relative"
                        onClick={(e) => e.stopPropagation()}
                    >
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

export default ChangePassword;
