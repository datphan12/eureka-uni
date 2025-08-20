import { formatDate } from "@utils";
import { ImageViewer, Avatar } from "@components";

const MessageCard = ({ message, owner = false }) => {
    return (
        <div className={`flex gap-3 mb-4 ${owner ? "flex-row-reverse" : "flex-row"}`}>
            <div className="flex-shrink-0">
                <Avatar src={message.hinhAnh} className="w-8 h-8" />
            </div>

            <div className={`flex flex-col ${owner ? "items-end" : "items-start"}`}>
                {!owner && <span className="text-sm text-gray-500 mb-1 px-2">{message.hoTen}</span>}

                <div
                    className={`px-4 py-2 rounded-2xl shadow-sm ${
                        owner ? "bg-blue-500 text-white" : "bg-white border border-gray-200 text-gray-800"
                    }`}
                >
                    {message.noiDung && <p className="text-sm leading-relaxed">{message.noiDung}</p>}

                    {message.dinhKem && message.dinhKem.length > 0 && (
                        <div className="mt-2 space-y-2">
                            {message.dinhKem.map((file, index) => (
                                <div key={index} className="rounded-md overflow-hidden">
                                    <ImageViewer src={file.imageUrl} className="max-w-[180px] h-auto" />
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <span className="text-xs text-gray-400 mt-1 px-2">{formatDate(message.createdAt)}</span>
            </div>
        </div>
    );
};

export default MessageCard;
