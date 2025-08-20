import { useEffect, useState } from "react";
import { API } from "@utils";
import { useLocation, useNavigate } from "react-router-dom";
import { Loading } from "@components";
import { toast } from "react-toastify";

const VerifyEmail = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const query = new URLSearchParams(location.search);
    const token = query.get("token");
    const email = query.get("email");
    const [message, setMessage] = useState();
    const [disableResend, setDisableResend] = useState(false);
    const [verified, setVerified] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const verifyEmail = async () => {
            try {
                const res = await API.get(`/auth/verify-email?token=${token}`);
                if (!res.data.success) {
                    setMessage(res.data.message);
                } else {
                    setMessage(res.data.message);
                    setVerified(true);
                    toast.success("Tài khoản đã được kích hoạt!");
                    navigate("/dang-nhap");
                }
            } catch (error) {
                setMessage(error.message);
            }
        };

        verifyEmail();
    }, []);

    const handleReSendVerifyEmail = async () => {
        try {
            setLoading(true);
            const res = await API.get(`/auth/resend-verify-email?email=${email}`);
            console.log("res", res);
            if (!res.data.success) {
                setMessage(res.data.message);
            } else {
                setMessage(res.data.message);
                setDisableResend(true);
            }
        } catch (error) {
            console.log("error", error);
            setMessage(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed left-0 right-0 flex justify-center p-6">
            {!message ? (
                <div className="flex items-center">
                    <Loading />
                    <p>Đang kích hoạt tài khoản</p>
                </div>
            ) : (
                <div className="flex gap-x-4 items-center">
                    <p>{message}</p>
                    <div>
                        {!verified && (
                            <button
                                disabled={disableResend}
                                onClick={handleReSendVerifyEmail}
                                className="bg-primary text-white rounded-lg px-2 py-1.5 cursor-pointer hover:bg-primary/90"
                            >
                                {loading ? "Đang gửi lại mã" : "Gửi lại mã"}
                            </button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default VerifyEmail;
