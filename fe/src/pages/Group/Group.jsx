import { useEffect, useState } from "react";
import { useGroupStore, useSocketChatStore } from "@store";
import NewGroup from "./modals/NewGroup";
import JoinGroup from "./modals/JoinGroup";
import LeaveGroup from "./modals/LeaveGroup";
import LeftBar from "./components/LeftBar";
import Center from "./components/Center";
import RightBar from "./components/RightBar";
import { SquareArrowLeftIcon } from "lucide-react";
import withSocketChat from "../../common/hoc/withSocketChat";
import Requests from "./modals/Requests";
import { API } from "@utils";

const Group = () => {
    const [showLeftBar, setShowLeftBar] = useState(true);
    const [showRightBar, setShowRightBar] = useState(false);
    const [showNewGroup, setShowNewGroup] = useState(false);
    const [showJoinGroup, setShowJoinGroup] = useState(false);
    const [showLeaveGroup, setShowLeaveGroup] = useState(false);
    const [showRequests, setShowRequests] = useState(false);
    const [requests, setRequests] = useState([]);
    const [group, setGroup] = useState();

    const { selectedGroupId, groups, setMeetingRooms, meetingRooms } = useGroupStore();
    const { joinGroup, isConnected, leaveGroup, socketChat } = useSocketChatStore();

    useEffect(() => {
        if (socketChat) {
            socketChat.on("notification", (data) => {
                if (data.type === "created_room") {
                    setMeetingRooms([...meetingRooms, data.roomId]);
                } else if (data.type === "closed_room") {
                    setMeetingRooms(meetingRooms.filter((roomId) => roomId !== data.roomId));
                }
            });
        }

        return () => {
            if (socketChat) {
                socketChat.off("notification");
            }
        };
    }, [socketChat, selectedGroupId]);

    useEffect(() => {
        if (isConnected && selectedGroupId) {
            joinGroup(selectedGroupId);

            return () => {
                leaveGroup(selectedGroupId);
            };
        }
    }, [isConnected, selectedGroupId]);

    const fetchGroupById = async (id) => {
        try {
            const res = await API.get(`/nhom-hoc-tap/${id}`);
            const data = res.data;
            setGroup(data);
        } catch (error) {
            console.error("Error fetching group messages:", error);
        }
    };

    const fetchJoinRequests = async () => {
        try {
            const res = await API.get(`/nhom-hoc-tap/yeu-cau-tham-gia?maNhom=${selectedGroupId}`);
            setRequests(res.data);
        } catch (error) {
            console.error("Error fetching join requests:", error);
        }
    };

    useEffect(() => {
        if (selectedGroupId) {
            fetchGroupById(selectedGroupId);
            fetchJoinRequests();
        }
    }, [selectedGroupId, groups]);

    return (
        <section className="flex-1 p-2">
            {showNewGroup && <NewGroup onClose={() => setShowNewGroup(false)} />}
            {showJoinGroup && <JoinGroup onClose={() => setShowJoinGroup(false)} />}
            {showLeaveGroup && <LeaveGroup onClose={() => setShowLeaveGroup(false)} />}
            {showRequests && (
                <Requests onClose={() => setShowRequests(false)} requests={requests} setRequests={setRequests} />
            )}

            <div className="flex h-full gap-x-2">
                {/* leftbar */}
                {showLeftBar ? (
                    <LeftBar
                        onClickJoin={() => setShowJoinGroup(true)}
                        onClickNew={() => setShowNewGroup(true)}
                        onShow={() => setShowLeftBar(false)}
                    />
                ) : (
                    <button
                        className="hidden lg:flex items-center justify-center w-10 h-10 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md hover:bg-gray-50 transition-all duration-200 rotate-180 mt-2"
                        onClick={() => setShowLeftBar(true)}
                    >
                        <SquareArrowLeftIcon size={20} color="#6B7280" />
                    </button>
                )}

                {/* center */}
                <Center
                    onShowRightBar={() => setShowRightBar(!showRightBar)}
                    onShowRequests={() => setShowRequests(true)}
                    requests={requests}
                    group={group}
                />

                {/* rightbar */}
                {showRightBar && selectedGroupId && (
                    <RightBar
                        onShowLeaveGroup={() => setShowLeaveGroup(true)}
                        onShowRightBar={() => setShowRightBar(!showRightBar)}
                        group={group}
                    />
                )}
            </div>
        </section>
    );
};

export default withSocketChat(Group);
