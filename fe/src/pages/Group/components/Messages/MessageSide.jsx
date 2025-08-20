import React, { useState, useEffect, useRef } from "react";
import { useGroupStore, useAuthStore } from "@store";
import { Loading } from "@components";
import MessageCard from "./MessageCard";
import { API } from "@utils";

const MessageSide = () => {
    const { selectedGroupId, messages, setMessages } = useGroupStore();
    const [loading, setLoading] = useState(false);
    const { user } = useAuthStore();

    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const fetchMessages = async () => {
        try {
            setLoading(true);
            const res = await API.get(`/nhom-hoc-tap/tin-nhan-nhom?maNhom=${selectedGroupId}`);
            const data = res.data;
            setMessages(data);
        } catch (error) {
            console.error("Error fetching messages:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMessages();
    }, [selectedGroupId]);

    useEffect(() => {
        setTimeout(() => {
            scrollToBottom();
        }, 0);
    }, [messages, selectedGroupId]);

    return (
        <div className="flex-1 flex flex-col gap-y-2 max-h-[calc(100vh-220px)] overflow-y-auto px-3 pt-3">
            {loading && (
                <div className="flex justify-center">
                    <Loading className="w-6 h-6" />
                </div>
            )}
            {messages.length === 0 && <div className="py-2 text-center text-gray-600">Không có tin nhắn nào</div>}
            {messages.map((message, index) => (
                <MessageCard key={message.id || index} message={message} owner={message.maNguoiDung === user.id} />
            ))}
            <div ref={messagesEndRef} />
        </div>
    );
};

export default MessageSide;
