import React, { useEffect, useState } from "react";
import { API } from "@utils";
import { FileText, MessageSquareText, FilePlus2 } from "lucide-react";

const BlogStats = ({ month, year }) => {
    const [totalBlogAndComment, setTotalBlogAndComment] = useState({});
    const [countCreatedBlogInPeriod, setCountCreatedBlogInPeriod] = useState({});

    const fetchStats = async () => {
        try {
            const res = await API.get(`/bai-dang/stats?year=${year}&month=${month}`);
            setTotalBlogAndComment(res.data.totalBlogAndComment);
            setCountCreatedBlogInPeriod(res.data.countCreatedBlogInPeriod);
        } catch (error) {
            console.log(error);
        }
    };

    useEffect(() => {
        fetchStats();
    }, [month, year]);

    return (
        <>
            <div className="rounded-md col-span-2 flex gap-1.5">
                <div className="flex-1 flex flex-col items-center justify-center rounded-md gap-1 border bg-blue-50 border-blue-300 text-blue-600 ">
                    <p className="font-medium text-lg">Tổng số bài viết</p>
                    <FileText size={24} className="text-blue-600 rounded-md" />
                    <p className="text-[16px]">
                        <strong className="text-2xl">{totalBlogAndComment.totalBlog}</strong> bài viết
                    </p>
                </div>
                <div className="flex-1 flex flex-col items-center justify-center rounded-md gap-1 border bg-amber-50 border-amber-300 text-amber-600 ">
                    <p className="font-medium text-lg">Tổng số phản hồi</p>
                    <MessageSquareText size={24} className="text-amber-600 rounded-md" />
                    <p className="text-[16px]">
                        <strong className="text-2xl">{totalBlogAndComment.totalComment}</strong> phản hồi
                    </p>
                </div>
            </div>
            <div className="rounded-md flex">
                <div className="flex-1 flex flex-col items-center justify-center rounded-md gap-1 border bg-green-50 border-green-300 text-green-600 ">
                    <p className="font-medium text-lg text-center px-1">
                        Số bài viết được tạo trong {countCreatedBlogInPeriod.period}
                    </p>
                    <div className="flex items-center gap-2">
                        <FilePlus2 size={38} className="bg-green-200 rounded-full p-1.5" />
                        <strong className="text-2xl">{countCreatedBlogInPeriod.total}</strong>
                    </div>
                </div>
            </div>
        </>
    );
};

export default BlogStats;
