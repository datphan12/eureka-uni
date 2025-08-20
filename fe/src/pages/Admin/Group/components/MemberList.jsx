import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { API } from "@utils";
import { toast } from "react-toastify";
import { Loading } from "@components";
import { Trash2 } from "lucide-react";

const MemberList = ({ mode }) => {
    const { id } = useParams();
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchMembersOfGroup = async (groupId) => {
        setLoading(true);
        try {
            const res = await API.get(`/nhom-hoc-tap/thanh-vien?maNhom=${groupId}`);
            setMembers(res.data);
            console.log("members:", res.data);
        } catch (error) {
            console.error("Error fetching group members:", error);
            toast.error("Lỗi khi tải danh sách thành viên");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (id) {
            fetchMembersOfGroup(id);
        }
    }, [id]);

    const handleDeleteUser = async (e, groupId, user) => {
        e.preventDefault();
        if (window.confirm(`Bạn có chắc chắn muốn xóa ${user.hoTen} khỏi nhóm?`)) {
            try {
                const res = await API.delete(`/nhom-hoc-tap/thanh-vien?maNhom=${groupId}&maNguoiDung=${user.id}`);
                toast.success(res.data.message);
                fetchMembersOfGroup(groupId);
            } catch (error) {
                console.error("Error deleting user:", error);
                toast.error(error?.response?.data?.message || "Lỗi khi xóa thành viên");
            }
        }
    };

    return (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
            {loading ? (
                <div className="flex items-center justify-center gap-2 p-8">
                    <Loading className="w-6 h-6" />
                    <p className="text-sm text-gray-500">Đang tải danh sách thành viên...</p>
                </div>
            ) : members && members.length === 0 ? (
                <div className="p-8 text-center">
                    <p className="text-sm italic text-gray-500">Không có thành viên trong nhóm này</p>
                </div>
            ) : (
                <div className="max-h-[400px] overflow-x-auto relative">
                    <table className="w-full">
                        <thead className="sticky top-0 z-10 bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    STT
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Thành viên
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Vai trò
                                </th>
                                {mode === "edit" && (
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"></th>
                                )}
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {members.map((member, idx) => (
                                <tr key={idx}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{idx + 1}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center gap-x-3">
                                            <img
                                                src={member.hinhAnh}
                                                alt={`Ảnh của ${member.hoTen}`}
                                                className="w-10 h-10 rounded-full object-cover border-2 border-gray-200"
                                            />
                                            <div>
                                                <p className="text-sm font-medium text-gray-900 line-clamp-1">
                                                    {member.hoTen}
                                                </p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span
                                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                member.vaiTro === "Chủ phòng"
                                                    ? "bg-green-100 text-green-800"
                                                    : "bg-blue-100 text-blue-800"
                                            }`}
                                        >
                                            {member.vaiTro}
                                        </span>
                                    </td>
                                    {mode === "edit" && member.vaiTro !== "Chủ phòng" && (
                                        <td>
                                            <button
                                                onClick={(e) => handleDeleteUser(e, id, member)}
                                                className="text-red-600 hover:text-red-700 cursor-pointer flex items-center gap-2"
                                                title="Xóa khỏi nhóm"
                                            >
                                                <Trash2 size={18} /> <span>Xóa khỏi nhóm</span>
                                            </button>
                                        </td>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default MemberList;
