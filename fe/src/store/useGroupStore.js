import { create } from "zustand";
import API from "../common/utils/axios";
import { toast } from "react-toastify";

const useGroupStore = create((set, get) => ({
    groups: [],
    selectedGroupId: null,
    messages: [],
    setMessages: (messages) => {
        set({ messages });
    },

    addMessage: (message) => {
        set({ messages: [...get().messages, message] });
    },

    meetingRooms: [],

    setMeetingRooms: (meetingRooms) => {
        set({ meetingRooms });
    },

    setGroups: (groups) => {
        set({ groups });
    },
    setSelectedGroupId: (id) => {
        set({ selectedGroupId: id });
    },

    // Lấy các nhóm học tập của người dùng
    fetchGroups: async () => {
        try {
            const res = await API.get(`/nhom-hoc-tap/me`);
            const groups = res.data;
            set({ groups: groups });
            if (groups.length > 0) {
                if (!get().selectedGroupId) {
                    get().setSelectedGroupId(groups[0].id);
                }
            }
        } catch (error) {
            console.error("Error fetching groups:", error);
        }
    },

    // Xử lý tham gia nhóm
    error: null,
    setError: (error) => {
        set({ error });
    },
}));

export default useGroupStore;
