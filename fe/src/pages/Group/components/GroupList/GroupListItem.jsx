import React, { useState } from "react";
import { useGroupStore, useRecommend } from "@store";
import { Loading, Avatar } from "@components";
import { toast } from "react-toastify";
import { API } from "@utils";

const GroupListItem = ({ group, onClose, openGroupId, setOpenGroupId }) => {
    const isOpen = openGroupId === group.id;

    const [joining, setJoining] = useState(false);

    const { fetchGroups, setError } = useGroupStore();
    const { setFetchedGroups } = useRecommend();

    const handleJoinGroup = async (e) => {
        e.stopPropagation();
        try {
            setJoining(true);
            await API.post("/nhom-hoc-tap/yeu-cau-tham-gia", { maNhom: group.id });
            toast.success("Đã gửi yêu cầu tham gia!");
            fetchGroups();
            setFetchedGroups(false);
            onClose();
        } catch (error) {
            setError(error.response?.data?.message);
        } finally {
            setJoining(false);
        }
    };

    return (
        <>
            <li
                className="border border-gray-400 rounded-md p-2 flex flex-col gap-x-2 cursor-pointer"
                onClick={() => setOpenGroupId(isOpen ? null : group.id)}
            >
                <div className="flex items-center">
                    <div className="flex flex-col flex-1 ">
                        <p className="text-base line-clamp-2">{group.tenNhom}</p>
                        <span className="text-sm italic">
                            Số lượng thành viên: {group.soLuongThanhVien}/{group.gioiHanThanhVien}
                        </span>
                    </div>

                    <div>
                        <button
                            onClick={handleJoinGroup}
                            className="bg-blue-500 text-white px-2 text-sm py-1 rounded hover:bg-blue-600"
                            disabled={joining}
                        >
                            {joining ? isOpen ? <Loading /> : "Tham gia" : "Tham gia"}
                        </button>
                    </div>
                </div>
                {isOpen && (
                    <div className="mt-2 text-sm">
                        <p>Thành viên nhóm</p>
                        <ul className="space-y-1">
                            {group.thanhVien.map((member, idx) => (
                                <li key={idx} className="flex items-center gap-x-2">
                                    <div className="flex items-center gap-x-2 flex-1">
                                        <Avatar src={member.hinhAnh} className="w-6 h-6" />
                                        <p className="line-clamp-1">{member.hoTen}</p>
                                    </div>
                                    <p className="mr-2 italic text-sm">{member.vaiTro}</p>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </li>
        </>
    );
};

export default GroupListItem;
