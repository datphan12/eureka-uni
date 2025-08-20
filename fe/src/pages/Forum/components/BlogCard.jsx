import React from "react";
import { formatDate } from "@utils";
import { Avatar } from "@components";
import parse from "html-react-parser";
import { useNavigate } from "react-router-dom";
import { Calendar } from "lucide-react";

const BlogCard = ({ blog }) => {
    const navigate = useNavigate();

    const filterHtmlContent = (htmlContent) => {
        return parse(htmlContent, {
            replace: (domNode) => {
                if (domNode.name && /^h[1-6]$/.test(domNode.name)) {
                    return domNode;
                }
                if (domNode.name === "p") {
                    return domNode;
                }
                if (domNode.name === "img") {
                    return <></>;
                }
                return null;
            },
        });
    };

    return (
        <div
            onClick={() => navigate(`/bai-viet/${blog.id}`)}
            className="cursor-pointer max-w-[750px] border border-[#ccc] p-6 rounded-2xl bg-white shadow-md transition-all duration-300 ease-in-out group hover:scale-102"
        >
            <div className="flex gap-x-2 items-center mb-2">
                <Avatar src={blog.nguoiDung.hinhAnh} />
                <p>{blog.nguoiDung.hoTen}</p>
            </div>
            <div className="flex flex-col gap-y-2 mb-4">
                <p className="text-lg font-semibold">{blog.tieuDe}</p>
                <div className="line-clamp-2">{filterHtmlContent(blog.noiDungHTML)}</div>
            </div>
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-x-2">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <p className="text-sm italic">{formatDate(blog.createdAt)}</p>
                </div>

                <span className="text-sm text-blue-500 font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    Đọc thêm →
                </span>
            </div>
        </div>
    );
};

export default BlogCard;
