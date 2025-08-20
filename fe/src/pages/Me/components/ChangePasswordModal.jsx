import React, { useState } from "react";
import { Loading } from "@components";
import useClickOutside from "@hooks/useClickOutside";

const ChangePasswordModal = ({ onSubmit, loading, onClickOutside, onResetPassword }) => {
    const [data, setData] = useState({ oldPassword: "", newPassword: "", confirmPassword: "", showPassword: false });
    const boxRef = useClickOutside(onClickOutside);

    const handleSubmit = async () => {
        await onSubmit(data.oldPassword, data.newPassword, data.confirmPassword);
    };
    return (
        <>
            <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50">
                <div ref={boxRef} className="bg-white rounded-xl shadow-lg p-6 max-w-[90%] md:w-[500px] relative">
                    <p className="text-center mb-4 text-lg font-semibold">Thay đổi mật khẩu</p>

                    <div className="flex flex-col gap-y-2">
                        <div className="flex flex-col gap-y-1">
                            <span className="italic">Nhập mật khẩu cũ</span>
                            <input
                                type={data.showPassword ? "text" : "password"}
                                value={data.oldPassword}
                                onChange={(e) => setData({ ...data, oldPassword: e.target.value })}
                                className="border-2 border-gray-300 rounded-lg p-2"
                            />
                        </div>

                        <div className="flex flex-col gap-y-1">
                            <span className="italic">Nhập mật khẩu mới</span>
                            <input
                                type={data.showPassword ? "text" : "password"}
                                value={data.newPassword}
                                onChange={(e) => setData({ ...data, newPassword: e.target.value })}
                                className="border-2 border-gray-300 rounded-lg p-2"
                            />
                        </div>

                        <div className="flex flex-col gap-y-1">
                            <span className="italic">Xác nhận lại mật khẩu mới</span>
                            <input
                                type={data.showPassword ? "text" : "password"}
                                value={data.confirmPassword}
                                onChange={(e) => setData({ ...data, confirmPassword: e.target.value })}
                                className="border-2 border-gray-300 rounded-lg p-2"
                            />
                        </div>
                        <div className="flex items-center justify-between">
                            <div
                                className="flex items-center w-fit cursor-pointer"
                                onClick={() => setData({ ...data, showPassword: !data.showPassword })}
                            >
                                <input type="checkbox" checked={data.showPassword} className="mr-2" />
                                <span className="text-sm">Hiển thị mật khẩu</span>
                            </div>

                            <p onClick={onResetPassword} className="underline text-sm text-primary cursor-pointer">
                                Quên mật khẩu?
                            </p>
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
        </>
    );
};

export default ChangePasswordModal;
