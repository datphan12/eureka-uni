import React from "react";
import { useGroupStore } from "@store";
import { API } from "@utils";
import { toast } from "react-toastify";
import useClickOutside from "@hooks/useClickOutside";

const LeaveGroup = ({ onClose }) => {
    const { selectedGroupId, fetchGroups, setSelectedGroupId } = useGroupStore();
    const modalRef = useClickOutside(() => onClose());

    const handleLeaveGroup = async () => {
        try {
            const res = await API.post("/nhom-hoc-tap/me/leave", { maNhom: selectedGroupId });
            toast.success(res.data.message);
            setSelectedGroupId(null);
            fetchGroups();
            onClose();
        } catch (error) {
            console.error("Error leaving group:", error);
            toast.error("Lỗi rời khỏi nhóm");
        }
    };

    return (
        <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/50">
            <div ref={modalRef} className="bg-white rounded-xl shadow-lg p-6 md:min-w-[300px] max-w-[90%] relative">
                <button onClick={onClose} className="absolute top-2 right-3 text-2xl cursor-pointer font-bold">
                    &times;
                </button>

                <p className="text-center">Xác nhận hành động?</p>

                <button
                    onClick={handleLeaveGroup}
                    className=" bg-red-500 text-white rounded-lg px-2 py-1.5 mt-4 cursor-pointer hover:bg-red-600 w-full"
                >
                    Rời khỏi nhóm
                </button>
            </div>
        </div>
    );
};

export default LeaveGroup;
