import { Title, Avatar } from "@components";
import { useAuthStore } from "@store";
import { X, LogOut, Users, Crown, User } from "lucide-react";

const RightBar = ({ onShowLeaveGroup, onShowRightBar, isOpen = true, group }) => {
    const { user } = useAuthStore();

    const members = group?.thanhViens;
    const isAdmin = group.maNguoiDung === user.id;

    return (
        <>
            {/* Overlay cho mobile */}
            <div
                className={`lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-50 transition-opacity duration-300 ${
                    isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
                }`}
                onClick={onShowRightBar}
            />

            {/* RightBar */}
            <div
                className={`border border-gray-300 shadow w-[350px] flex flex-col lg:relative fixed right-0 top-0 h-full z-50 bg-white rounded-lg ${
                    isOpen ? "translate-x-0" : "translate-x-full"
                }
            `}
            >
                {/* Header */}
                <div className="bg-blue-600 text-white p-4 rounded-t-lg">
                    <Title value="Thông tin nhóm" className="text-lg font-bold text-center" />

                    <button
                        onClick={onShowRightBar}
                        className="absolute top-3 right-2 p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors duration-200"
                    >
                        <X size={18} className="text-white" strokeWidth={2.5} />
                    </button>
                </div>

                <div className="flex-1 flex flex-col h-full">
                    {/* Group Info */}
                    <div className="p-2">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 bg-teal-500 rounded-full flex items-center justify-center">
                                <Users size={20} className="text-white" />
                            </div>
                            <div className="flex-1">
                                <h3 className="font-semibold text-gray-800 text-lg line-clamp-3 text-wrap">
                                    {group.tenNhom}
                                </h3>
                                <p className="text-sm text-gray-500 flex items-center gap-1">
                                    <User size={14} />
                                    {members.length} thành viên
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Members List */}
                    <div className="flex-1 h-full overflow-hidden px-2 flex flex-col">
                        <h4 className="font-semibold text-gray-800 flex items-center gap-2">
                            <Users size={18} />
                            Danh sách thành viên
                        </h4>

                        <div className="overflow-y-hidden space-y-3">
                            {members.map((member, index) => (
                                <div key={index} className="group flex items-center gap-3 px-2 bg-white">
                                    <div className="relative">
                                        <Avatar
                                            src={member.nguoiDung.hinhAnh}
                                            className="w-8 h-8 ring-2 ring-gray-100 group-hover:ring-blue-200 transition-all duration-200"
                                        />
                                        {member.vaiTro === "admin" && (
                                            <div className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-400 rounded-full flex items-center justify-center">
                                                <Crown size={12} className="text-white" />
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-gray-800 truncate">{member.nguoiDung.hoTen}</p>
                                        <p className="text-sm text-gray-500 capitalize">{member.vaiTro}</p>
                                    </div>

                                    {member.vaiTro === "admin" && (
                                        <div className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs font-medium rounded-full">
                                            Quản trị
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    <button
                        onClick={onShowLeaveGroup}
                        className={`
                                w-full flex items-center justify-center gap-3 py-2 px-4 rounded-b-lg
                                font-semibold bg-red-500 text-white shadow-lg hover:bg-red-600 cursor-pointer
                            `}
                    >
                        <LogOut size={20} />
                        {isAdmin ? "Giải tán nhóm" : "Rời khỏi nhóm"}
                    </button>
                </div>
            </div>
        </>
    );
};

export default RightBar;
