import React, { useEffect, useState } from "react";
import { ReturnButton } from "@components";
import BlogSide from "./components/BlogSide";
import CommentSide from "./components/comment/CommentSide";
import { useParams } from "react-router-dom";
import { API } from "@utils";

const Blog = () => {
    const { id } = useParams();
    const [currentBlog, setCurrentBlog] = useState(null);

    useEffect(() => {
        const fetchBlogById = async (id) => {
            try {
                const res = await API.get(`/bai-dang/${id}`);
                setCurrentBlog(res.data);
            } catch (error) {
                console.error("Lỗi khi tải bài viết:", error);
            }
        };

        if (id) {
            fetchBlogById(id);
        }
    }, [id]);

    return (
        <section className="relative h-full flex overflow-hidden flex-1">
            <div className="py-4 lg:pl-4 flex flex-col lg:flex-row flex-1 gap-y-8">
                <div className="flex-1 flex flex-col gap-y-4">
                    <ReturnButton value="Quay lại" className="ml-4"/>
                    <BlogSide currentBlog={currentBlog} setCurrentBlog={setCurrentBlog} />
                </div>
                <CommentSide phanHois={currentBlog?.phanHoiBaiDang} />
            </div>
        </section>
    );
};

export default Blog;
