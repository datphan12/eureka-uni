import React from "react";
import parse from "html-react-parser";
import { formatDate } from "@utils";
import { Edit, Trash2 } from "lucide-react";

const MyBlogCard = ({ blog, onDelete, onEdit }) => {
    const filterHtmlContent = (htmlContent) =>
        parse(htmlContent, {
            replace: (domNode) => {
                if (domNode.name && /^h[1-6]$/.test(domNode.name)) return domNode;
                if (domNode.name === "p") return domNode;
                if (domNode.name === "img") return <></>;
                return null;
            },
        });

    return (
        <div className="rounded-xl shadow-sm border border-gray-200 bg-white p-5 hover:shadow-md transition">
            <div className="flex justify-between items-start">
                <div className="flex-1">
                    <h2 className="text-lg font-semibold text-gray-800">{blog.tieuDe}</h2>
                    <div className="text-sm text-gray-600 line-clamp-3 mt-2">{filterHtmlContent(blog.noiDungHTML)}</div>
                    <div className="text-xs text-gray-400 italic mt-2">
                        <span>Ngày tạo: {formatDate(blog.createdAt)}</span>
                        <span className="ml-4 capitalize">{blog.trangThai}</span>
                    </div>
                </div>
                <div className="flex items-center space-x-2 ml-4">
                    <button onClick={() => onEdit(blog)} className="text-primary hover:text-blue-700">
                        <Edit size={20} />
                    </button>
                    <button onClick={() => onDelete(blog)} className="text-red-500 hover:text-red-700">
                        <Trash2 size={20} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MyBlogCard;
