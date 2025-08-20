import { io } from "socket.io-client";
import { create } from "zustand";
import useGroupStore from "./useGroupStore";

const useSocketChatStore = create((set, get) => ({
    /*--- socket chat: dùng cho chức năng nhắn tin trong nhóm học tập ---*/
    socketChat: null,
    isConnected: false,

    connectSocketChat: () => {
        if (get().socketChat) return;
        const apiUrl = `${import.meta.env.VITE_NESTJS_API_URL}/chat`;
        const socketChat = io(apiUrl);

        socketChat.off("new_message");
        socketChat.on("new_message", (data) => {
            useGroupStore.getState().addMessage(data);
        });

        socketChat.on("connect", () => {
            console.log("SocketChat connected:", socketChat.id);
            set({ socketChat, isConnected: true, error: null });
        });
    },

    joinGroup: (maNhom) => {
        const { socketChat, isConnected } = get();
        if (socketChat && isConnected && maNhom) {
            socketChat.off("tin_nhan_nhom");

            socketChat.emit("join_group", maNhom);
        } else {
            const errorMsg = !maNhom ? "Mã nhóm không hợp lệ" : "Không có socketChat";
            console.error(errorMsg);
        }
    },

    leaveGroup: (maNhom) => {
        const { socketChat } = get();
        if (socketChat && maNhom) {
            socketChat.emit("leave_group", maNhom);
        }
    },

    sendMessage: ({ maNhom, maNguoiDung, noiDung, dinhKem }) => {
        const { socketChat, isConnected } = get();
        if (socketChat && isConnected) {
            socketChat.emit("send_message", { maNhom, maNguoiDung, noiDung, dinhKem });
            socketChat.off("error");
        } else {
            const errorMsg = "Không có socketChat";
            console.error(errorMsg);
        }
    },

    disconnectSocketChat: () => {
        const { socketChat } = get();
        if (socketChat) {
            socketChat.off();
            socketChat.disconnect();
            set({ socketChat: null, isConnected: false, error: null });
        }
    },
}));

export default useSocketChatStore;
