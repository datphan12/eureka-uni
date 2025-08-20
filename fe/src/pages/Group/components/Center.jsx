import { Title } from "@components";
import MessageSide from "./Messages/MessageSide";
import MessageInput from "./Messages/MessageInput";
import { useGroupStore, useAuthStore } from "@store";
import { Info, Video, Bell, Users } from "lucide-react";
import "../css/Center.css";

const Center = ({ onShowRightBar, onShowRequests, requests, group }) => {
    const { selectedGroupId, meetingRooms } = useGroupStore();
    const user = useAuthStore((state) => state.user);

    const isVideoActive = selectedGroupId && meetingRooms.includes(selectedGroupId);
    const isOwner = group?.maNguoiDung === user?.id;
    const requestsCount = requests && requests.length;

    const handleJoinRoomVideo = () => {
        if (selectedGroupId) {
            const videoRoomUrl = `/video-call?roomId=${selectedGroupId}`;
            window.open(videoRoomUrl, "_blank", "width=1000,height=600");
        }
    };

    if (!group) return null;

    return (
        <div className="flex flex-col flex-1 bg-white rounded-xl shadow border border-gray-300">
            {/* header */}
            <div className="flex justify-between items-center px-4 py-2 border-b border-[#ccc]/80 shadow-xs">
                <div>
                    {selectedGroupId && (
                        <>
                            <Title value={group.tenNhom} className="text-2xl font-medium text-gray-600 line-clamp-1" />

                            <div className="flex items-center gap-1 text-sm text-gray-500 mt-1">
                                <Users size={16} />
                                <span>Số lượng thành viên: {group.thanhViens.length}</span>
                            </div>
                        </>
                    )}
                </div>
                <div className="flex items-center md:gap-1">
                    {isOwner && (
                        <button
                            onClick={onShowRequests}
                            className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors relative"
                        >
                            <Bell size={24} />
                            {requestsCount > 0 && (
                                <span className="absolute top-1 right-0 w-3 h-3 bg-red-500 rounded-full"></span>
                            )}
                        </button>
                    )}

                    <button
                        onClick={handleJoinRoomVideo}
                        className={`p-2 rounded-full transition-colors relative ${
                            isVideoActive
                                ? "text-green-600 bg-green-50 hover:bg-green-100"
                                : "text-gray-600 hover:text-blue-600 hover:bg-blue-50"
                        }`}
                        title="Phòng họp online"
                    >
                        <Video size={24} />
                        {isVideoActive && (
                            <span className="absolute top-0 right-0 w-3 h-3 bg-green-500 rounded-full animate-pulse"></span>
                        )}
                    </button>

                    <button
                        onClick={onShowRightBar}
                        className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                    >
                        <Info size={24} />
                    </button>
                </div>
            </div>
            {/* main */}
            <div className="flex flex-1 flex-col gap-y-2 relative">
                <MessageSide />
                <MessageInput />
            </div>
        </div>
    );
};

export default Center;
