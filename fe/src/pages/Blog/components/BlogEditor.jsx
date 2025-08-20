import React, { useRef, useState } from "react";
import MDEditor, { commands } from "@uiw/react-md-editor";
import { marked } from "marked";
import { useAuthStore } from "@store";
import { API, uploadFileToCloudinary } from "@utils";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { Image, Send, FileText } from "lucide-react";

const customImageCommand = (onImageUpload) => ({
    name: "image",
    keyCommand: "image",
    buttonProps: { "aria-label": "Insert image" },
    icon: <Image size={14} />,
    execute: (state, api) => {
        onImageUpload();
    },
});

const BlogEditor = () => {
    const [title, setTitle] = useState("");
    const [markdownContent, setMarkdownContent] = useState("");
    const [imageUrls, setImageUrls] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const navigate = useNavigate();
    const { user } = useAuthStore();
    const fileInputRef = useRef(null);

    const uploadImage = async (file, fileName = null) => {
        const displayName = fileName || file.name;
        const uploadingText = `![Uploading ${displayName}...]()`;

        setMarkdownContent((prevContent) => `${prevContent}\n${uploadingText}\n`);

        try {
            const imageUrl = await uploadFileToCloudinary(file);
            setMarkdownContent((prevContent) => prevContent.replace(uploadingText, `![${displayName}](${imageUrl})`));
            setImageUrls((prev) => [...prev, imageUrl]);
        } catch (error) {
            console.error("Lỗi khi upload ảnh:", error);
            setMarkdownContent((prevContent) =>
                prevContent.replace(uploadingText, `❌ Upload failed for ${displayName}`)
            );
            toast.error("Upload ảnh thất bại!");
        }
    };

    const handleImageChange = async (e) => {
        const file = e.target.files[0];
        if (file) {
            await uploadImage(file);
            e.target.value = null;
        }
    };

    const handlePaste = async (e) => {
        const items = e.clipboardData?.items;
        if (!items) return;

        for (let i = 0; i < items.length; i++) {
            const item = items[i];

            if (item.type.indexOf("image") !== -1) {
                e.preventDefault();

                const file = item.getAsFile();
                if (file) {
                    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
                    const fileName = `image-${timestamp}.png`;
                    await uploadImage(file, fileName);
                }
                break;
            }
        }
    };

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
            const res = await API.post("/bai-dang", payload);

            if (res?.data) {
                toast.success("Đăng bài thành công!");
                setTitle("");
                setMarkdownContent("");
                setImageUrls([]);
                navigate("/bai-viet");
            }
        } catch (error) {
            console.error("Lỗi đăng bài:", error);
            toast.error("Đã xảy ra lỗi khi đăng bài.");
        } finally {
            setIsSubmitting(false);
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

    return (
        <div className="h-calc(100vh-100px) pt-4 flex-1 overflow-hidden flex flex-col">
            <div className="flex-1 flex flex-col">
                <div className="mb-2">
                    <div className="flex items-center gap-2 mb-1">
                        <div className="p-1.5 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
                            <FileText className="w-4 h-4 text-white" />
                        </div>
                        <h1 className="text-xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                            Tạo bài viết mới
                        </h1>
                    </div>
                </div>

                {/* Main Content */}
                <div className="flex-1 bg-white rounded-xl border border-gray-300 overflow-hidden flex flex-col">
                    <div className="p-4 pb-0 border-b border-gray-100">
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

                            <div className="flex-shrink-0">
                                <button
                                    type="submit"
                                    onClick={handleSubmit}
                                    disabled={isSubmitting || !title.trim() || !markdownContent.trim()}
                                    className="group relative px-4 py-2 bg-blue-500 text-white font-semibold rounded-lg disabled:cursor-not-allowed cursor-pointer disabled:bg-gray-400 disabled:scale-100 hover:scale-105 transition-all duration-200"
                                >
                                    <div className="flex items-center gap-2">
                                        {isSubmitting ? (
                                            <>
                                                <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                <span className="text-sm">Đang đăng...</span>
                                            </>
                                        ) : (
                                            <>
                                                <Send className="w-3 h-3" />
                                                <span className="text-sm">Đăng bài</span>
                                            </>
                                        )}
                                    </div>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Editor */}
                    <div className="flex-1 p-4 overflow-hidden flex flex-col">
                        <div
                            className="flex-1 max-h-[calc(100vh-300px)] border border-gray-200 rounded-lg overflow-hidden"
                            onPaste={handlePaste}
                        >
                            <MDEditor
                                value={markdownContent}
                                onChange={setMarkdownContent}
                                hideToolbar={false}
                                height="100%"
                                commands={customToolbar}
                                data-color-mode="light"
                            />
                        </div>

                        <input
                            type="file"
                            id="image-upload"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="hidden"
                            ref={fileInputRef}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BlogEditor;
