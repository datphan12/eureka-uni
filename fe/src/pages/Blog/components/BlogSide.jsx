import React, { useEffect, useState } from "react";
import parse from "html-react-parser";
import { ImageViewer, Avatar } from "@components";
import { Heart } from "lucide-react";
import { useAuthStore } from "@store";
import { API, formatDate } from "@utils";

const BlogSide = ({ currentBlog, setCurrentBlog }) => {
    const user = useAuthStore((state) => state.user);
    const [isLiked, setIsLiked] = useState(false);
    const [likeCount, setLikeCount] = useState(0);

    useEffect(() => {
        if (currentBlog && user?.id) {
            setIsLiked(currentBlog.luotThich.includes(user.id));
            setLikeCount(currentBlog.luotThich.length);
        }
    }, [currentBlog, user?.id]);

    const handleLikeOrDislike = async () => {
        try {
            const res = await API.post(`/bai-dang/like-or-dislike?maBaiDang=${currentBlog.id}`);

            const newIsLiked = res.data.luotThich.includes(user.id);
            setIsLiked(newIsLiked);
            setLikeCount(res.data.luotThich.length);

            if (setCurrentBlog) {
                setCurrentBlog((prev) => ({
                    ...prev,
                    luotThich: res.data.luotThich,
                }));
            }
        } catch (error) {
            console.error("Lỗi khi đánh giá bài viết:", error);
        }
    };

    const filterHtmlContent = (htmlContent) => {
        console.log(htmlContent);
        return parse(htmlContent, {
            replace: (domNode) => {
                switch (domNode.name) {
                    case "img":
                        return <ImageViewer src={domNode.attribs.src} className="md:max-w-[500px] bg-white" />;
                    case "h1":
                    case "h2":
                    case "h3":
                    case "h4":
                    case "h5":
                    case "h6":
                        return <h2 className="text-xl font-semibold">{domNode.children[0].data}</h2>;
                    default:
                        return domNode;
                }
            },
        });
    };

    return (
        <>
            {currentBlog && (
                <div className="flex flex-col gap-y-2 flex-1 mx-1.5 md:px-4 lg:px-0 lg:pr-4 lg:max-h-[calc(100vh-150px)] overflow-auto no-scrollbar">
                    <div className="flex gap-x-4 items-center pr-6 bg-primary/20 rounded-xl border border-gray-200 px-4 py-1">
                        <Avatar src={currentBlog?.nguoiDung?.hinhAnh} />
                        <div className="flex-1">
                            <p className="text-lg font-semibold">{currentBlog.nguoiDung.hoTen}</p>
                            <p className="text-sm italic">{formatDate(currentBlog.createdAt)}</p>
                        </div>
                        <div className="flex items-center gap-x-1 cursor-pointer" onClick={handleLikeOrDislike}>
                            {isLiked ? (
                                <svg
                                    viewBox="0 0 16 16"
                                    width="20"
                                    height="20"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
                                    <g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g>
                                    <g id="SVGRepo_iconCarrier">
                                        <path
                                            d="M1.24264 8.24264L8 15L14.7574 8.24264C15.553 7.44699 16 6.36786 16 5.24264V5.05234C16 2.8143 14.1857 1 11.9477 1C10.7166 1 9.55233 1.55959 8.78331 2.52086L8 3.5L7.21669 2.52086C6.44767 1.55959 5.28338 1 4.05234 1C1.8143 1 0 2.8143 0 5.05234V5.24264C0 6.36786 0.44699 7.44699 1.24264 8.24264Z"
                                            fill="#ff0000"
                                        />
                                    </g>
                                </svg>
                            ) : (
                                <Heart />
                            )}

                            <span>{likeCount}</span>
                        </div>
                    </div>
                    <div className="bg-white p-3 border border-gray-200 rounded-xl h-full overflow-auto no-scrollbar">
                        <p className="text-2xl font-semibold text-center">{currentBlog.tieuDe}</p>
                        <div className="flex flex-col gap-y-4">{filterHtmlContent(currentBlog.noiDungHTML)}</div>
                    </div>
                </div>
            )}
        </>
    );
};

export default BlogSide;
