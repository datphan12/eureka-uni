import { useSocketChatStore, useAuthStore } from "@store";
import { useEffect } from "react";

const withSocketChat = (Component) => {
    const ComponentWithSocketChat = () => {
        const { socketChat, connectSocketChat, disconnectSocketChat } = useSocketChatStore();
        const { user } = useAuthStore();

        useEffect(() => {
            if (user && !socketChat) {
                connectSocketChat();
            }

            return () => {
                if (socketChat) {
                    disconnectSocketChat();
                }
            };
        }, [user, socketChat, connectSocketChat, disconnectSocketChat]);

        return <Component />;
    };

    return ComponentWithSocketChat;
};

export default withSocketChat;
