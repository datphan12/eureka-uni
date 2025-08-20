import React, { useEffect } from "react";
import { Loading } from "@components";
import { useLocation } from "react-router-dom";
import { API } from "@utils";
import { useAuthStore } from "@store";

const PaymentSuccess = () => {
    const location = useLocation();
    const { addKhoaHocDangKy } = useAuthStore();
    useEffect(() => {
        const query = new URLSearchParams(location.search);
        const vnp_PayDate = query.get("vnp_PayDate");
        const vnp_ResponseCode = query.get("vnp_ResponseCode");
        const vnp_TxnRef = query.get("vnp_TxnRef");
        const vnp_CardType = query.get("vnp_CardType");

        const handlePaymentReturn = async () => {
            try {
                const coursePaying = JSON.parse(localStorage.getItem("coursePaying"));
                const res = await API.post("/payment/return", {
                    vnp_PayDate,
                    vnp_ResponseCode,
                    vnp_TxnRef,
                    vnp_CardType,
                });

                console.log(res);
                console.log(res.data.redirectUrl);
                if (res.data.status === "success") {
                    addKhoaHocDangKy(coursePaying);
                    localStorage.removeItem("coursePaying");

                    window.location.href = `http://localhost:5173/${res.data.redirectUrl}`;
                } else {
                    window.location.href = `http://localhost:5173/${res.data.redirectUrl}`;
                }
            } catch (error) {
                console.log(error);
            }
        };

        handlePaymentReturn();
    }, []);
    return (
        <div className="w-full h-screen flex items-center justify-center">
            <Loading className="w-14 h-14 mr-6" />
            <p>Đang xử lý giao dịch. Vui lòng chờ trong giây lát!</p>
        </div>
    );
};

export default PaymentSuccess;
