import MDEditor, { commands } from "@uiw/react-md-editor";
import { marked } from "marked";
import React, { useRef, useState, useEffect } from "react";
import { uploadFileToCloudinary } from "@utils";
import { Image } from "lucide-react";

const customImageCommand = (onImageUpload) => ({
    name: "image",
    keyCommand: "image",
    buttonProps: { "aria-label": "Insert image" },
    icon: <Image size={14} />,
    execute: (state, api) => {
        onImageUpload();
    },
});

const BlogEditor = ({ value = "", onChange, onImageUpload, disabled = false }) => {
    const [markdownContent, setMarkdownContent] = useState("");
    const [imageUrls, setImageUrls] = useState([]);
    const fileInputRef = useRef(null);
    const editorRef = useRef(null);

    useEffect(() => {
        if (value && typeof value === "string" && value !== markdownContent) {
            setMarkdownContent(value);
        }
    }, [value]);

    const handleMarkdownChange = (val) => {
        setMarkdownContent(val || "");

        if (onChange) {
            onChange({
                noiDungMarkdown: val || "",
                noiDungHTML: marked(val || ""),
                hinhAnh: imageUrls,
            });
        }
    };

    const uploadImageFromFile = async (file, fileName = null) => {
        const displayName = fileName || file.name || "pasted-image";
        const uploadingText = `![Uploading ${displayName}...]()`;
        const newContent = `${markdownContent}\n${uploadingText}\n`;
        setMarkdownContent(newContent);

        try {
            const imageUrl = await uploadFileToCloudinary(file);

            const finalContent = newContent.replace(uploadingText, `![${displayName}](${imageUrl})`);
            setMarkdownContent(finalContent);

            const newImageUrls = [...imageUrls, imageUrl];
            setImageUrls(newImageUrls);

            if (onChange) {
                onChange({
                    noiDungMarkdown: finalContent,
                    noiDungHTML: marked(finalContent),
                    hinhAnh: newImageUrls,
                });
            }

            if (onImageUpload) {
                onImageUpload(imageUrl);
            }

            return imageUrl;
        } catch (error) {
            console.error("Lỗi khi upload ảnh:", error);
            const errorContent = newContent.replace(uploadingText, `Upload failed for ${displayName}`);
            setMarkdownContent(errorContent);

            if (onChange) {
                onChange({
                    noiDungMarkdown: errorContent,
                    noiDungHTML: marked(errorContent),
                    hinhAnh: imageUrls,
                });
            }
            throw error;
        }
    };

    const handleImageChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        await uploadImageFromFile(file);
        e.target.value = null;
    };

    const handlePaste = async (e) => {
        if (disabled) return;
        const items = e.clipboardData?.items;
        if (!items) return;

        for (let i = 0; i < items.length; i++) {
            const item = items[i];

            if (item.type.indexOf("image") !== -1) {
                e.preventDefault();

                const file = item.getAsFile();
                if (file) {
                    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
                    const fileName = `image-${timestamp}.${file.type.split("/")[1] || "png"}`;

                    try {
                        await uploadImageFromFile(file, fileName);
                    } catch (error) {
                        console.error("Lỗi khi paste ảnh:", error);
                    }
                }
                break;
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
        ...(disabled ? [] : [customImageCommand(triggerFileInput)]),
        commands.table,
        commands.orderedListCommand,
        commands.unorderedListCommand,
        commands.checkedListCommand,
    ];

    return (
        <div className="w-full flex flex-col gap-y-2">
            {!disabled && (
                <>
                    <input
                        type="file"
                        id="blog-image-upload"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                        ref={fileInputRef}
                    />
                </>
            )}

            {/* Markdown Editor */}
            <div className="min-h-[400px]" onPaste={handlePaste}>
                <MDEditor
                    ref={editorRef}
                    value={markdownContent}
                    onChange={handleMarkdownChange}
                    hideToolbar={false}
                    height={400}
                    commands={customToolbar}
                />
            </div>
        </div>
    );
};

export default BlogEditor;
