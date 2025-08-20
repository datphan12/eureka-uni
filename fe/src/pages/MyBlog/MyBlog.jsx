import React, { useEffect, useState } from "react";
import { ScrollToTopButton } from "@components";
import { API } from "@utils";
import MyBlogCard from "./components/MyBlogCard";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import EditBlog from "./components/EditBlog";

const MyBlog = () => {
    const { id } = useParams();
    const [blogs, setBlogs] = useState([]);
    const [selectedBlog, setSelectedBlog] = useState(null);
    const navigate = useNavigate();

    const fetchBlogs = async () => {
        try {
            const res = await API.get("/bai-dang/nguoi-dung");
            setBlogs(res.data);
        } catch (error) {
            console.error("Lỗi khi tải bài viết:", error);
        }
    };

    useEffect(() => {
        if (id) return;
        setSelectedBlog(null);
        fetchBlogs();
    }, [id]);

    const handleDelete = async (blog) => {
        if (window.confirm("Bạn có chắc chắn muốn xóa bài viết này?")) {
            try {
                const res = await API.delete(`/bai-dang/${blog.id}`);
                toast.success(res.data.message);
                fetchBlogs();
            } catch (error) {
                console.error("Lỗi khi xóa bài viết:", error);
                toast.error(error?.response?.data?.message || "Lỗi khi xóa bài viết");
            }
        }
    };

    const handleEdit = (data) => {
        setSelectedBlog(data);
        navigate(`/me/bai-viet/${data.id}`);
    };

    const handleCancel = () => {
        setSelectedBlog(null);
    };

    return (
        <div className="flex-1 flex flex-col">
            {selectedBlog ? (
                <EditBlog data={selectedBlog} onCancel={handleCancel} />
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-4">
                    <div className="lg:col-span-3 space-y-4">
                        <div className="flex items-center justify-between">
                            <p className="text-gray-700">
                                Bạn có <strong>{blogs.length}</strong> bài viết.
                            </p>
                            <button
                                onClick={() => navigate("/bai-viet-moi")}
                                className="bg-blue-600 text-white px-4 py-1.5 rounded-md text-lg cursor-pointer"
                            >
                                + Tạo bài viết mới
                            </button>
                        </div>

                        {blogs.length === 0 ? (
                            <p className="text-gray-500 italic">Bạn chưa có bài viết nào.</p>
                        ) : (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                {blogs.map((blog) => (
                                    <MyBlogCard key={blog.id} blog={blog} onDelete={handleDelete} onEdit={handleEdit} />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

            <ScrollToTopButton />
        </div>
    );
};

export default MyBlog;
