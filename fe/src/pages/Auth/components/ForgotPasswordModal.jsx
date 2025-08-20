import React, { useEffect, useRef, useState } from "react";
import { API } from "@utils";
import { toast } from "react-toastify";
import { Loading } from "@components";
import useClickOutside from "@hooks/useClickOutside";

const ForgotPasswordModal = ({ onClose }) => {
    const boxRef = useClickOutside(() => onClose());
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (email.trim() === "") {
            toast.error("Email không được bỏ trống");
            return;
        }
        try {
            setLoading(true);
            const res = await API.get(`/auth/send-email-reset-password?email=${email}`);
            console.log("res", res);
            if (res.data.success) {
                toast.success(res.data.message);
                onClose();
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div ref={boxRef} className="bg-white rounded-xl shadow-lg p-6 min-w-[90%] md:min-w-[500px] relative">
                <button onClick={onClose} className="absolute top-2 right-3 text-2xl cursor-pointer font-bold">
                    &times;
                </button>

                <p className="text-center mb-4 text-lg font-semibold">Đặt lại mật khẩu</p>
                <div className="flex flex-col gap-y-2">
                    <span className="italic">Nhập email của bạn</span>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="border-2 border-gray-300 rounded-lg p-2"
                    />
                    <button
                        onClick={handleSubmit}
                        className="bg-blue-500 text-white rounded-lg px-2 py-1.5 cursor-pointer hover:bg-blue-400 flex justify-center"
                    >
                        {loading ? <Loading className="w-6 h-6" /> : "Gửi mã reset"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ForgotPasswordModal;
