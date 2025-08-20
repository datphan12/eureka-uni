import React, { useState, useEffect } from "react";
import { API } from "@utils";
import { useGroupStore } from "@store";
import useDebounce from "@hooks/useDebounce";
import GroupList from "../components/GroupList/GroupList";
import { Loading } from "@components";
import useClickOutside from "@hooks/useClickOutside";

const JoinGroup = ({ onClose }) => {
    const [tenNhom, setTenNhom] = useState("");
    const [loading, setLoading] = useState(false);
    const [groupFound, setGroupFound] = useState([]);
    const { setError } = useGroupStore();

    const modalRef = useClickOutside(() => onClose());

    const debouncedTenNhom = useDebounce(tenNhom, 500);

    const handleSearch = async () => {
        if (!debouncedTenNhom.trim()) {
            setGroupFound([]);
            return;
        }
        try {
            setLoading(true);
            const res = await API.get(`/nhom-hoc-tap/search?tenNhom=${debouncedTenNhom}`);
            setGroupFound(res.data || []);
        } catch (error) {
            setError(error.response?.data?.message || "Đã xảy ra lỗi");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        handleSearch();
    }, [debouncedTenNhom]);

    return (
        <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/50">
            <div ref={modalRef} className="bg-white rounded-xl shadow-lg p-6 md:min-w-[600px] max-w-[90%] relative">
                <button onClick={onClose} className="absolute top-2 right-3 text-2xl cursor-pointer font-bold">
                    &times;
                </button>

                <h2 className="text-xl font-semibold mb-4 text-center">Tham gia nhóm</h2>

                <input
                    type="text"
                    value={tenNhom}
                    onChange={(e) => {
                        setTenNhom(e.target.value);
                        setError(null);
                    }}
                    autoFocus
                    placeholder="Nhập tên nhóm"
                    className="w-full px-4 py-2 rounded-md outline-gray-300 border border-gray-300 mb-2 focus:outline-primary"
                />

                <div className="h-[400px]">
                    {loading ? <Loading /> : <GroupList groups={groupFound} onClose={onClose} />}
                </div>
            </div>
        </div>
    );
};

export default JoinGroup;
