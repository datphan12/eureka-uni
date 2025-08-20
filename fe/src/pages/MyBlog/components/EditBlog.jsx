import React, { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@store";
import { uploadFileToCloudinary, API } from "@utils";
import MDEditor, { commands } from "@uiw/react-md-editor";
import { marked } from "marked";
import { toast } from "react-toastify";
import { Edit3, Save, X, Image, FileText, Clock } from "lucide-react";

const customImageCommand = (onImageUpload) => ({
    name: "image",
    keyCommand: "image",
    buttonProps: { "aria-label": "Insert image" },
    icon: <Image size={14} />,
    execute: (state, api) => {
        onImageUpload();
    },
});

const EditBlog = ({ data, onCancel }) => {
    const [title, setTitle] = useState(data.tieuDe);
    const [markdownContent, setMarkdownContent] = useState(data.noiDungMarkdown);
    const [imageUrls, setImageUrls] = useState([...data.hinhAnh]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const navigate = useNavigate();
    const { user } = useAuthStore();
    const fileInputRef = useRef(null);

    const handleImageChange = async (e) => {
        const file = e.target.files[0];
        if (file) {
            const uploadingText = `![Uploading ${file.name}...]()`;
            setMarkdownContent((prevContent) => `${prevContent}\n${uploadingText}\n`);

            try {
                const imageUrl = await uploadFileToCloudinary(file);
                setMarkdownContent((prevContent) => prevContent.replace(uploadingText, `![${file.name}](${imageUrl})`));
                setImageUrls((prev) => [...prev, imageUrl]);
                e.target.value = null;
            } catch (error) {
                console.error("Lỗi khi upload ảnh:", error);
                setMarkdownContent((prevContent) =>
                    prevContent.replace(uploadingText, `❌ Upload failed for ${file.name}`)
                );
            }
        }
    };

    const triggerFileInput = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    const customToolbar = [
        commands.bold,
        commands.italic,
        commands.strikethrough,
        commands.hr,
        commands.title,
        commands.link,
        commands.quote,
        commands.code,
        commands.codeBlock,
        customImageCommand(triggerFileInput),
        commands.table,
        commands.orderedListCommand,
        commands.unorderedListCommand,
        commands.checkedListCommand,
        commands.group([], {
            name: "more",
            groupName: "more",
            buttonProps: { "aria-label": "More options" },
            children: [],
        }),
    ];

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!title || !markdownContent || !user?.id) {
            toast.error("Vui lòng nhập đầy đủ tiêu đề và nội dung.");
            return;
        }

        setIsSubmitting(true);

        const payload = {
            tieuDe: title,
            noiDungMarkdown: markdownContent,
            noiDungHTML: marked(markdownContent),
            hinhAnh: imageUrls,
            maNguoiDung: user?.id,
        };

        try {
            const res = await API.put(`/bai-dang/${data.id}`, payload);

            if (res?.data) {
                toast.success("Cập nhật bài viết thành công!");
                navigate("/me/bai-viet");
            }
        } catch (error) {
            console.error("Lỗi đăng bài:", error);
            toast.error("Đã xảy ra lỗi khi cập nhật.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="h-calc(100vh-100px) overflow-hidden flex flex-col p-2">
            <div className="flex-1 flex flex-col">
                <div className="mb-2">
                    <div className="flex items-center gap-2 mb-1">
                        <div className="p-1.5 bg-gradient-to-r from-orange-500 to-amber-600 rounded-lg">
                            <Edit3 className="w-4 h-4 text-white" />
                        </div>
                        <h1 className="text-xl font-bold">Chỉnh sửa bài viết</h1>
                    </div>
                </div>

                {/* Main */}
                <div className="flex-1 bg-white rounded-xl border border-gray-300 overflow-hidden flex flex-col">
                    {/* Title */}
                    <div className="p-4 pb-0">
                        <div className="flex items-center gap-4">
                            <div className="flex-1">
                                <input
                                    type="text"
                                    id="tieuDe"
                                    className="w-full px-4 py-1.5 text-base font-medium bg-white border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent  placeholder:text-gray-400"
                                    placeholder="Nhập tiêu đề bài viết..."
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Editor */}
                    <div className="flex-1 p-4 overflow-hidden flex flex-col">
                        <div className="flex-1 max-h-[calc(100vh-280px)] border border-gray-200 rounded-lg overflow-hidden">
                            <input
                                type="file"
                                id="image-upload"
                                accept="image/*"
                                onChange={handleImageChange}
                                className="hidden"
                                ref={fileInputRef}
                            />
                            <MDEditor
                                value={markdownContent}
                                onChange={setMarkdownContent}
                                hideToolbar={false}
                                height="100%"
                                commands={customToolbar}
                                data-color-mode="light"
                            />
                        </div>
                    </div>

                    {/* Action */}
                    <div className="px-4 py-2">
                        <div className="flex justify-between items-center">
                            <div className="hidden md:flex items-center gap-2 text-xs text-gray-600">
                                <span>ID: {data.id}</span>
                                <span>•</span>
                                <span>Chế độ chỉnh sửa</span>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    className="group px-4 py-1.5 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all duration-200"
                                    onClick={onCancel}
                                    disabled={isSubmitting}
                                >
                                    <div className="flex items-center gap-1.5">
                                        <X className="w-3 h-3" />
                                        <span className="text-sm">Hủy</span>
                                    </div>
                                </button>

                                <button
                                    type="submit"
                                    onClick={handleSubmit}
                                    disabled={isSubmitting || !title.trim() || !markdownContent.trim()}
                                    className="group relative px-4 py-1.5 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold rounded-lg transition-all duration-200 disabled:cursor-not-allowed"
                                >
                                    <div className="flex items-center gap-1.5">
                                        {isSubmitting ? (
                                            <>
                                                <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                <span className="text-sm">Đang cập nhật...</span>
                                            </>
                                        ) : (
                                            <>
                                                <Save className="w-3 h-3" />
                                                <span className="text-sm">Cập nhật</span>
                                            </>
                                        )}
                                    </div>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EditBlog;
