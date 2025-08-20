import React, { useState } from "react";
import { API } from "@utils";
import { useAuthStore, useGroupStore } from "@store";
import { toast } from "react-toastify";
import useClickOutside from "@hooks/useClickOutside";

const NewGroup = ({ onClose }) => {
    const [tenNhom, setTenNhom] = useState("");
    const [error, setError] = useState(null);

    const { user } = useAuthStore();
    const { fetchGroups } = useGroupStore();

    const modalRef = useClickOutside(() => onClose());

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (tenNhom.trim() === "") {
            toast.error("Vui lòng nhập tên nhóm.");
            return;
        }

        try {
            const res = await API.post("/nhom-hoc-tap", { tenNhom, maNguoiDung: user.id });

            if (res.data) {
                await fetchGroups();
                toast.success("Nhóm mới đã được tạo thành công!");
                onClose();
            }
        } catch (error) {
            setError(error.response.data.message);
        }
    };

    return (
        <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/50">
            <div ref={modalRef} className="bg-white rounded-xl shadow-lg p-6 md:min-w-[500px] max-w-[90%] relative">
                <button onClick={onClose} className="absolute top-2 right-3 text-2xl cursor-pointer font-bold">
                    &times;
                </button>

                <h2 className="text-xl font-semibold mb-4 text-center">Tạo nhóm mới</h2>

                <input
                    type="text"
                    value={tenNhom}
                    autoFocus
                    onChange={(e) => {
                        setTenNhom(e.target.value);
                        setError(null);
                    }}
                    placeholder="Nhập tên nhóm"
                    className="w-full px-4 py-1.5 rounded-md outline-gray-300 border border-gray-300 focus:outline-primary"
                />
                {error && <p className="text-red-500 text-sm">{error}</p>}

                <button
                    onClick={handleSubmit}
                    className="float-right bg-green-500 text-white rounded-lg px-2 py-1.5 mt-4 cursor-pointer hover:bg-green-600"
                >
                    Tạo nhóm
                </button>
            </div>
        </div>
    );
};

export default NewGroup;
