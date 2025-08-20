import React, { useEffect, useState, useRef } from "react";
import { Loading, ImageViewer, Avatar } from "@components";
import { API, uploadFileToCloudinary, deleteFileFromCloudinary, formatDate } from "@utils";
import { useAuthStore } from "@store";
import { toast } from "react-toastify";
import { Image, Trash2 } from "lucide-react";

const CommentArea = ({ lessonId }) => {
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState("");
    const [attachments, setAttachments] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [error, setError] = useState(null);
    const { user } = useAuthStore();
    const fileInputRef = useRef(null);

    useEffect(() => {
        if (lessonId) {
            fetchComments();
        }
    }, [lessonId]);

    const fetchComments = async () => {
        try {
            setIsLoading(true);
            const response = await API.get(`/bai-giang/binh-luan?maBaiGiang=${lessonId}`);
            setComments(response.data);
            setError(null);
        } catch (err) {
            console.error("Error fetching comments:", err);
            setError("Không thể tải bình luận. Vui lòng thử lại sau.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmitComment = async (e) => {
        e.preventDefault();
        if (!newComment.trim() && attachments.length === 0) return;

        try {
            setIsLoading(true);

            const attachmentUrls = [];
            if (attachments.length > 0) {
                setIsUploading(true);
                for (let i = 0; i < attachments.length; i++) {
                    const file = attachments[i];
                    try {
                        const imageUrl = await uploadFileToCloudinary(file);
                        attachmentUrls.push(imageUrl);
                        setUploadProgress(Math.round(((i + 1) / attachments.length) * 100));
                    } catch (uploadErr) {
                        console.error(`Error uploading file ${file.name}:`, uploadErr);
                    }
                }
                setIsUploading(false);
                setUploadProgress(0);
            }

            await API.post("/bai-giang/binh-luan", {
                maBaiGiang: lessonId,
                noiDung: newComment.trim() || null,
                dinhKem: attachmentUrls.length > 0 ? attachmentUrls : undefined,
            });

            setNewComment("");
            setAttachments([]);
            await fetchComments();
            setError(null);
        } catch (err) {
            console.error("Error posting comment:", err);
            setError("Không thể đăng bình luận. Vui lòng thử lại sau.");
        } finally {
            setIsLoading(false);
            setIsUploading(false);
        }
    };

    const handleDeleteComment = async (commentId, attachmentUrls) => {
        if (window.confirm("Bạn có chắc chắn muốn xóa bình luận này không?")) {
            try {
                setIsLoading(true);

                if (attachmentUrls && attachmentUrls.length > 0) {
                    for (const imageUrl of attachmentUrls) {
                        try {
                            await deleteFileFromCloudinary(imageUrl);
                        } catch (deleteErr) {
                            console.error(`Error deleting attachment ${imageUrl}:`, deleteErr);
                        }
                    }
                }

                await API.delete(`/bai-giang/binh-luan/${commentId}`);
                toast.success("Bình luận đã được xóa!");
                await fetchComments();
                setError(null);
            } catch (err) {
                console.error("Error deleting comment:", err);
                setError("Không thể xóa bình luận. Vui lòng thử lại sau.");
            } finally {
                setIsLoading(false);
            }
        }
    };

    const handleFileChange = (e) => {
        if (e.target.files) {
            const validFiles = Array.from(e.target.files).filter((file) => file.type.startsWith("image/"));

            if (validFiles.length !== e.target.files.length) {
                setError("Chỉ hỗ trợ tệp hình ảnh. Một số tệp đã bị bỏ qua.");
            }

            setAttachments([...attachments, ...validFiles]);
        }
    };

    const removeAttachment = (index) => {
        setAttachments(attachments.filter((_, i) => i !== index));
    };

    const isImageUrl = (url) => {
        return /\.(jpg|jpeg|png|gif|bmp|svg|webp)(\?.*)?$/i.test(url);
    };

    return (
        <div className="flex flex-col h-full p-3">
            {error && <div className="text-red-500 mb-4 p-2 bg-red-50 rounded">{error}</div>}

            <div className="flex-1 overflow-y-auto">
                {isLoading && comments.length === 0 ? (
                    <div className="text-center py-4">Đang tải bình luận...</div>
                ) : comments.length === 0 ? (
                    <div className="text-center py-4 text-gray-500">Chưa có bình luận nào.</div>
                ) : (
                    <div className="space-y-4 rounded-md pr-2">
                        {comments.map((comment) => {
                            const isOwnComment = user && comment.maNguoiDung === user.id;

                            return (
                                <div
                                    key={comment.id}
                                    className={`flex flex-col ${isOwnComment ? "items-end" : "items-start"}`}
                                >
                                    <div
                                        className={`flex items-center gap-x-2 mb-1 ${
                                            isOwnComment ? "" : "flex-row-reverse"
                                        }`}
                                    >
                                        <p className="text-gray-500 font-semibold">{comment.hoTen}</p>
                                        <Avatar src={comment.hinhAnh} className="w-7 h-7" />
                                    </div>

                                    <div
                                        className={`max-w-[80%] min-w-[20%] p-3 rounded-lg relative ${
                                            isOwnComment
                                                ? "bg-blue-600 text-white"
                                                : "bg-white border border-gray-200 shadow"
                                        }`}
                                    >
                                        {comment.noiDung && <div className="">{comment.noiDung}</div>}

                                        {comment.dinhKem && comment.dinhKem.length > 0 && (
                                            <div className="mt-2">
                                                <div className="flex flex-wrap gap-2 mt-1">
                                                    {comment.dinhKem.map((attachment, idx) => (
                                                        <ImageViewer src={attachment} key={idx} className="w-20 h-20" />
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        <div className="text-xs text-right text-black mt-1">
                                            {formatDate(comment.createdAt)}
                                        </div>

                                        {isOwnComment && (
                                            <button
                                                onClick={() => handleDeleteComment(comment.id, comment.dinhKem)}
                                                className="absolute bottom-1 -left-5 text-red-500 hover:text-red-700 text-sm"
                                                title="Xóa bình luận"
                                                disabled={isLoading}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            <form onSubmit={handleSubmitComment} className="mt-4">
                <div className="flex gap-x-2">
                    <div className="flex flex-col mb-2 flex-1">
                        <textarea
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder="Nhập bình luận của bạn..."
                            className="border border-gray-400 rounded-md p-2 min-h-[80px] focus:outline-none focus:ring-1 focus:ring-primary"
                            disabled={isLoading || isUploading}
                            rows="2"
                        />
                    </div>

                    <div className="flex flex-col items-center gap-y-2">
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="text-sm ml-2 px-3 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 flex items-center"
                            disabled={isLoading || isUploading}
                        >
                            <Image className="w-5 h-5" />
                            Tải lên ảnh
                        </button>

                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            className="hidden"
                            multiple
                            accept="image/*"
                        />

                        <button
                            type="submit"
                            disabled={isLoading || isUploading || (!newComment.trim() && attachments.length === 0)}
                            className={`text-sm px-4 py-2 rounded-md text-white ${
                                isLoading || isUploading || (!newComment.trim() && attachments.length === 0)
                                    ? "bg-gray-400"
                                    : "bg-primary hover:bg-primary/80"
                            }`}
                        >
                            {isLoading ? <Loading className="w-6 h-6" /> : isUploading ? <Loading /> : "Gửi bình luận"}
                        </button>
                    </div>
                </div>

                <div className="flex items-start justify-end">
                    {attachments.length > 0 && (
                        <div className="mb-3 flex-1">
                            <h3 className="text-sm font-medium mb-2">Tệp đính kèm:</h3>
                            <div className="flex flex-wrap gap-2">
                                {attachments.map((file, index) => (
                                    <div
                                        key={index}
                                        className="flex flex-col items-center bg-gray-100 p-2 rounded w-24"
                                    >
                                        {file.type.startsWith("image/") ? (
                                            <div className="h-16 w-16 mb-1 overflow-hidden flex items-center justify-center">
                                                <img
                                                    src={URL.createObjectURL(file)}
                                                    alt={file.name}
                                                    className="h-full w-full object-cover rounded"
                                                />
                                            </div>
                                        ) : (
                                            <div className="h-16 w-16 mb-1 flex items-center justify-center bg-gray-200 rounded">
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    className="h-8 w-8 text-gray-500"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    stroke="currentColor"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                                    />
                                                </svg>
                                            </div>
                                        )}
                                        <span className="text-xs truncate max-w-full">
                                            {file.name.length > 12 ? `${file.name.slice(0, 10)}...` : file.name}
                                        </span>
                                        <button
                                            type="button"
                                            onClick={() => removeAttachment(index)}
                                            className="mt-1 text-red-500 hover:text-red-700 text-xs"
                                            disabled={isUploading}
                                        >
                                            Xóa
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {isUploading && (
                    <div className="mb-3">
                        <div className="flex items-center gap-x-2">
                            <Loading className="w-5 h-5" />
                            <div className="w-full bg-gray-200 rounded-full h-2.5">
                                <div
                                    className="bg-primary h-2.5 rounded-full transition-all duration-300"
                                    style={{ width: `${uploadProgress}%` }}
                                ></div>
                            </div>
                            <span className="ml-2 text-sm text-gray-600">{uploadProgress}%</span>
                        </div>
                    </div>
                )}
            </form>
        </div>
    );
};

export default CommentArea;
