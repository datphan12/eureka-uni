import React, { useEffect, useRef, useState } from "react";
import { Paperclip, Send, X } from "lucide-react";
import { API, uploadFileToCloudinary, deleteFileFromCloudinary } from "@utils";
import { useAuthStore } from "@store";
import { Loading } from "@components";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";

const MAX_IMAGE_COUNT = 3;
const VALID_IMAGE_TYPES = ["image/jpeg", "image/png"];

const CommentInput = ({ setComments }) => {
    const { id } = useParams();
    const { user } = useAuthStore();

    const [content, setContent] = useState("");
    const [imageUrls, setImageUrls] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const textareaRef = useRef(null);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!content.trim() && imageUrls.length === 0) return;

        const payload = {
            noiDung: content,
            dinhKem: imageUrls,
            maBaiDang: id,
            maNguoiDung: user?.id,
        };

        try {
            setIsLoading(true);
            const res = await API.post("/bai-dang/phan-hoi", payload);

            if (res?.data) {
                setComments((prev) => [
                    ...prev,
                    {
                        ...res.data,
                        hinhAnh: user?.hinhAnh,
                        hoTen: user?.hoTen,
                    },
                ]);
                setContent("");
                setImageUrls([]);
            }
        } catch (error) {
            console.error("Lỗi đăng bình luận:", error);
            toast.error("Không thể đăng bình luận. Vui lòng thử lại sau.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteImage = async (index) => {
        const imageToRemove = imageUrls[index];
        try {
            setIsLoading(true);
            await deleteFileFromCloudinary(imageToRemove);
            setImageUrls((prev) => prev.filter((_, i) => i !== index));
        } catch (error) {
            console.error("Không thể xóa ảnh:", error);
            toast.error("Không thể xóa ảnh. Vui lòng thử lại sau.");
        } finally {
            setIsLoading(false);
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
            setIsLoading(true);
            const imageUrl = await uploadFileToCloudinary(file);
            setImageUrls((prev) => [...prev, imageUrl]);
        } catch (error) {
            console.error("Lỗi khi upload ảnh:", error);
            toast.error("Không thể tải ảnh lên. Vui lòng thử lại sau.");
        } finally {
            setIsLoading(false);
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
            handleSubmit(e);
        }
    };

    useEffect(() => {
        const textarea = textareaRef.current;
        if (textarea) {
            textarea.style.height = "auto";
            textarea.style.height = content.trim() === "" ? "36px" : `${textarea.scrollHeight}px`;
        }
    }, [content]);

    const isSubmitDisabled = isLoading || (!content.trim() && imageUrls.length === 0);

    return (
        <div className="absolute px-2 bottom-2 right-0 left-0 bg-white flex gap-x-2 items-center">
            <div>
                <label
                    htmlFor="fileInput"
                    className="cursor-pointer p-1 rounded-full hover:bg-gray-100 transition-colors"
                >
                    <Paperclip className="w-5 h-5 text-gray-600" />
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
                    placeholder="Nhập bình luận tại đây..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    onPaste={handlePaste}
                    onKeyDown={handleKeyDown}
                    style={{ minHeight: "36px", overflow: "hidden" }}
                />

                {imageUrls.length > 0 && (
                    <div className="flex items-center gap-1 flex-wrap border-t px-2 border-[#ccc] pt-1">
                        {imageUrls.map((imageUrl, index) => (
                            <div key={index} className="relative rounded-lg border border-[#ccc]">
                                <img
                                    src={imageUrl}
                                    alt="image"
                                    className="max-w-32 max-h-32 rounded-lg object-contain"
                                />
                                <button
                                    onClick={() => handleDeleteImage(index)}
                                    className="absolute top-0.5 right-0.5 text-white bg-black/70 hover:bg-black rounded-full p-0.5 transition-colors"
                                >
                                    <X className="w-3 h-3" />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <button
                onClick={handleSubmit}
                disabled={isSubmitDisabled}
                className={`p-2 rounded-full transition-colors ${
                    isSubmitDisabled ? "opacity-50 cursor-not-allowed" : "hover:bg-[#2563eb]/20 text-[#2563eb]"
                }`}
            >
                {isLoading ? <Loading className="w-5 h-5" /> : <Send className="w-5 h-5" />}
            </button>
        </div>
    );
};

export default CommentInput;
