import { useEffect, useRef, useState } from "react";
import { uploadFileToCloudinary, deleteFileFromCloudinary } from "@utils";
import { useGroupStore, useAuthStore, useSocketChatStore } from "@store";
import { Loading } from "@components";
import { toast } from "react-toastify";
import { Send, Paperclip } from "lucide-react";

const MAX_IMAGE_COUNT = 3;
const VALID_IMAGE_TYPES = ["image/jpeg", "image/png"];

const MessageInput = () => {
    const { selectedGroupId } = useGroupStore();
    const { user } = useAuthStore();
    const { sendMessage } = useSocketChatStore();

    const [content, setContent] = useState("");
    const [imageUrls, setImagesUrls] = useState([]);
    const [loading, setLoading] = useState(false);
    const textareaRef = useRef(null);

    const handleSubmit = () => {
        if (selectedGroupId && user && (content.trim() || imageUrls.length > 0)) {
            sendMessage({
                maNhom: selectedGroupId,
                maNguoiDung: user.id,
                noiDung: content,
                dinhKem: imageUrls,
            });
            setContent("");
            setImagesUrls([]);
        }
    };

    const handleDeleteImage = async (index) => {
        const imageToRemove = imageUrls[index];
        try {
            setLoading(true);
            await deleteFileFromCloudinary(imageToRemove.imageUrl);
            setImagesUrls((prev) => prev.filter((_, i) => i !== index));
        } catch (error) {
            console.error("Không thể xóa ảnh:", error);
            toast.error("Không thể xóa ảnh. Vui lòng thử lại sau.");
        } finally {
            setLoading(false);
        }
    };

    const uploadImage = async (file) => {
        if (imageUrls.length >= MAX_IMAGE_COUNT) {
            toast.error("Bạn chỉ có thể chọn tối đa 3 ảnh.");
            return;
        }

        if (!VALID_IMAGE_TYPES.includes(file.type)) {
            toast.error("Loại file không được hỗ trợ. Vui lòng chọn ảnh JPEG hoặc PNG.");
            return;
        }

        try {
            setLoading(true);
            const imageUrl = await uploadFileToCloudinary(file);
            setImagesUrls((prev) => [...prev, { name: file.name, imageUrl }]);
        } catch (error) {
            console.error("Lỗi khi upload file:", error);
            toast.error("Không thể tải file lên. Vui lòng thử lại sau.");
        } finally {
            setLoading(false);
        }
    };

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        await uploadImage(file);
        e.target.value = null;
    };

    const handlePaste = async (e) => {
        const items = e.clipboardData?.items;
        if (!items) return;

        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            if (item.type.indexOf("image") === 0) {
                e.preventDefault();
                const file = item.getAsFile();
                if (file) {
                    await uploadImage(file);
                }
                break;
            }
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
        }
    };

    useEffect(() => {
        const textarea = textareaRef.current;
        if (textarea) {
            textarea.style.height = "auto";
            textarea.style.height = content.trim() === "" ? "36px" : `${textarea.scrollHeight}px`;
        }
    }, [content]);

    const isSubmitDisabled = loading || (!content.trim() && imageUrls.length === 0);

    return (
        <div className="absolute px-2 bottom-1 right-0 left-0 bg-white flex gap-x-2 items-center">
            <div>
                <label htmlFor="fileInput" className="cursor-pointer">
                    <Paperclip size={20} />
                </label>
                <input
                    type="file"
                    id="fileInput"
                    className="hidden"
                    onChange={handleFileChange}
                    accept="image/jpeg,image/png"
                />
            </div>

            <div className="flex-1 flex flex-col border border-[#ccc] rounded-lg px-1">
                <textarea
                    ref={textareaRef}
                    className="w-full rounded-lg px-3 py-1.5 outline-none resize-none"
                    placeholder="Nhập nội dung tin nhắn..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    onPaste={handlePaste}
                    onKeyDown={handleKeyDown}
                    style={{ minHeight: "36px", overflow: "hidden" }}
                />

                {imageUrls.length > 0 && (
                    <div className="flex items-center gap-1 flex-wrap border-t border-[#ccc] pt-1 px-2">
                        {imageUrls.map((file, index) => (
                            <div key={index} className="relative rounded-lg border border-[#ccc]">
                                <img
                                    src={file.imageUrl}
                                    alt={file.name || "image"}
                                    className="max-w-32 max-h-32 rounded-lg object-contain"
                                />
                                <button
                                    onClick={() => handleDeleteImage(index)}
                                    className="absolute top-0.5 right-1 text-white bg-black rounded-full px-1.5 text-sm"
                                >
                                    ×
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <button
                onClick={handleSubmit}
                disabled={isSubmitDisabled}
                className={`p-3 rounded-full cursor-pointer disabled:cursor-not-allowed ${
                    isSubmitDisabled ? "bg-gray-200 text-gray-500" : "bg-blue-700 text-white"
                }`}
            >
                {loading ? <Loading className="w-5 h-5" /> : <Send size={20} />}
            </button>
        </div>
    );
};

export default MessageInput;
