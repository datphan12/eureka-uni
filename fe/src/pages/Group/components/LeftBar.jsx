import { useEffect, useState } from "react";
import { Title } from "@components";
import { useGroupStore, useRecommend, useAuthStore } from "@store";
import GroupList from "./GroupList/GroupList";
import { API } from "@utils";
import { SquareArrowLeftIcon, XIcon, Users, ChevronDown, RotateCcw } from "lucide-react";

const LeftBar = ({ onClickJoin, onClickNew, onShow }) => {
    const [showGroupRecommend, setShowGroupRecommend] = useState(true);
    const [isMobileOpen, setIsMobileOpen] = useState(false);

    const user = useAuthStore((state) => state.user);
    const { groups, fetchGroups, selectedGroupId, setSelectedGroupId } = useGroupStore();
    const { groupRecommend, setGroupRecommend, fetchedGroups, setFetchedGroups } = useRecommend();

    // lấy dữ liệu nhóm học tập đề xuất
    useEffect(() => {
        const fetchGroupRecommend = async () => {
            const name = user?.khoaHocDangKys.map((kh) => kh.tenKhoaHoc).join("-");
            if (!name) return;
            try {
                const res = await API.get(`/ai/recommend-groups?name=${name}`);
                setFetchedGroups(true);
                setGroupRecommend(res.data.nhomHocTap);
            } catch (error) {
                console.log(error);
            }
        };

        if (!fetchedGroups) {
            fetchGroupRecommend();
        }
    }, [groups]);

    useEffect(() => {
        fetchGroups();
    }, []);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (isMobileOpen && !event.target.closest(".mobile-sidebar") && !event.target.closest(".mobile-toggle")) {
                setIsMobileOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [isMobileOpen]);

    const handleGroupSelect = (id) => {
        setSelectedGroupId(id);
        setIsMobileOpen(false);
    };

    const LeftBarContent = () => (
        <>
            <div className="flex items-center gap-x-2">
                <div className="flex-1 flex justify-between items-center bg-blue-500 px-3 py-2.5 rounded-lg shadow-md">
                    <Title value="Nhóm học tập của tôi" className="text-sm font-bold text-white" />
                    <div className="flex items-center cursor-pointer" onClick={fetchGroups}>
                        <RotateCcw size={18} className="text-white" />
                    </div>
                </div>
                <button
                    className="hidden lg:flex items-center justify-center w-10 h-10 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md hover:bg-gray-50 transition-all duration-200"
                    onClick={onShow}
                >
                    <SquareArrowLeftIcon size={20} color="#6B7280" />
                </button>
                <button
                    className="lg:hidden flex items-center justify-center w-10 h-10 bg-red-100 border border-red-200 rounded-lg hover:bg-red-100 transition-all duration-200"
                    onClick={() => setIsMobileOpen(false)}
                >
                    <XIcon size={20} color="#EF4444" />
                </button>
            </div>

            {/* Groups List*/}
            <div className="flex-1 relative">
                <ul className="relative h-full overflow-y-auto space-y-1.5 no-scrollbar">
                    {groups.length > 0 ? (
                        groups.map((group) => (
                            <li
                                key={group.id}
                                className={`group relative px-3 py-3 rounded-xl cursor-pointer transition-all duration-200 border ${
                                    selectedGroupId === group.id
                                        ? "bg-blue-50 border-blue-200 shadow-sm"
                                        : "bg-white border-gray-200 hover:border-blue-200 hover:shadow-sm"
                                }`}
                                onClick={() => handleGroupSelect(group.id)}
                            >
                                <div className="flex items-center gap-3">
                                    <div
                                        className={`w-3 h-3 rounded-full ${
                                            selectedGroupId === group.id
                                                ? "bg-blue-500"
                                                : "bg-gray-300 group-hover:bg-blue-400"
                                        } transition-colors duration-200`}
                                    ></div>
                                    <p className="line-clamp-1 text-sm font-medium text-gray-700 group-hover:text-blue-700 transition-colors duration-200">
                                        {group.tenNhom}
                                    </p>
                                </div>
                            </li>
                        ))
                    ) : (
                        <div className="flex flex-col items-center justify-center h-16 text-gray-400">
                            <p className="text-sm">Chưa có nhóm nào</p>
                        </div>
                    )}
                </ul>
            </div>

            {/* Recommended Groups */}
            {groupRecommend.length > 0 && (
                <div className="mt-2">
                    <button
                        onClick={() => setShowGroupRecommend(!showGroupRecommend)}
                        className="w-full flex items-center justify-between bg-teal-500 px-3 py-2.5 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 group"
                    >
                        <Title value="Nhóm được đề xuất" className="text-sm font-bold text-white" />
                        <div
                            className={`transform transition-transform duration-200 ${
                                showGroupRecommend ? "" : "rotate-180"
                            }`}
                        >
                            <ChevronDown className="w-4 h-4 text-white" />
                        </div>
                    </button>
                    {showGroupRecommend && (
                        <div className="">
                            <ul className="max-h-[250px] overflow-y-auto space-y-1 no-scrollbar">
                                <GroupList
                                    groups={groupRecommend}
                                    onClose={() => {
                                        return;
                                    }}
                                />
                            </ul>
                        </div>
                    )}
                </div>
            )}

            <div className="flex gap-2">
                {[
                    {
                        text: "Tham gia",
                        event: onClickJoin,
                        background: "bg-blue-500",
                        hover: "hover:from-blue-600 hover:to-blue-700",
                    },
                    {
                        text: "Tạo nhóm",
                        event: onClickNew,
                        background: "bg-green-500",
                        hover: "hover:from-emerald-600 hover:to-emerald-700",
                    },
                ].map((item, index) => (
                    <button
                        key={index}
                        onClick={() => item.event()}
                        className={`flex-1 ${item.background} ${item.hover} text-white py-2 px-3 rounded-lg font-semibold text-sm shadow-md hover:shadow-lg transform hover:scale-[1.02] transition-all duration-200 flex items-center justify-center gap-2`}
                    >
                        {item.text}
                    </button>
                ))}
            </div>
        </>
    );

    return (
        <>
            {/* Desktop*/}
            <div className="hidden lg:flex w-[350px] p-2 flex-col gap-y-3 bg-white rounded-lg shadow border border-gray-300">
                <LeftBarContent />
            </div>

            <button
                className="mobile-toggle lg:hidden fixed top-32 left-4 z-50 bg-teal-500 text-white p-3 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                onClick={() => setIsMobileOpen(true)}
            >
                <Users size={20} />
            </button>

            {/* Mobile Overlay */}
            {isMobileOpen && <div className="lg:hidden fixed inset-0 bg-black/50 z-40" />}

            {/* Mobile Sidebar */}
            <div
                className={`mobile-sidebar lg:hidden fixed top-0 left-0 h-full w-[300px] md:w-[400px] bg-white z-50 transform transition-all duration-300 ${
                    isMobileOpen ? "translate-x-0" : "-translate-x-full"
                }`}
            >
                <div className="p-2 flex flex-col gap-y-3 h-full">
                    <LeftBarContent />
                </div>
            </div>
        </>
    );
};

export default LeftBar;
