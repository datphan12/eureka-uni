import React, { useEffect, useState } from "react";
import useClickOutside from "@hooks/useClickOutside";
import { API } from "@utils";
import { useGroupStore } from "@store";

const Requests = ({ onClose, requests, setRequests }) => {
    const modalRef = useClickOutside(() => onClose());
    const [loading, setLoading] = useState(false);

    const { selectedGroupId, fetchGroups } = useGroupStore();

    const handleAccept = async (approve, userId) => {
        setLoading(true);
        try {
            await API.post("/nhom-hoc-tap/xu-ly-yeu-cau-tham-gia", {
                maNhom: selectedGroupId,
                maNguoiDung: userId,
                approve,
            });

            setRequests((prev) => prev.filter((req) => req.id !== userId));
            fetchGroups();
        } catch (error) {
            console.error("Error accepting request:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/50">
            <div
                ref={modalRef}
                className="bg-white rounded-xl shadow-lg p-6 md:min-w-[700px] max-w-[90%] max-h-[80vh] overflow-y-auto relative"
            >
                <button
                    onClick={onClose}
                    className="absolute top-2 right-3 text-2xl cursor-pointer font-bold hover:text-red-500 transition-colors"
                >
                    &times;
                </button>

                <h2 className="text-xl font-semibold mb-6 text-center text-gray-800">Yêu cầu tham gia nhóm</h2>

                <div className="space-y-4">
                    {requests.length === 0 ? (
                        <div className="text-center text-gray-500">
                            <p>Không có yêu cầu nào</p>
                        </div>
                    ) : (
                        requests.map((request) => (
                            <div
                                key={request.id}
                                className="flex items-center justify-between p-3 bg-gradient-to-r from-gray-100 to-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                <div className="flex items-center space-x-3">
                                    <img
                                        src={request.hinhAnh}
                                        alt={request.hoTen}
                                        className="w-10 h-10 rounded-full object-cover border-2 border-gray-100"
                                    />
                                    <div>
                                        <h3 className="font-medium text-gray-800">{request.hoTen}</h3>
                                        <p className="text-sm text-gray-500">Yêu cầu tham gia nhóm</p>
                                    </div>
                                </div>

                                <div className="flex space-x-2">
                                    <button
                                        onClick={() => handleAccept(false, request.id)}
                                        disabled={loading}
                                        className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-1 cursor-pointer"
                                    >
                                        <span>✕</span>
                                        <span>Từ chối</span>
                                    </button>
                                    <button
                                        onClick={() => handleAccept(true, request.id)}
                                        disabled={loading}
                                        className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-1 cursor-pointer"
                                    >
                                        <span>✓</span>
                                        <span>Chấp nhận</span>
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {requests.length > 0 && (
                    <div className="mt-6 text-center text-sm text-gray-500">Tổng cộng: {requests.length} yêu cầu</div>
                )}
            </div>
        </div>
    );
};

export default Requests;
