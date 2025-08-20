import React, { useEffect, useState } from "react";
import { Title, ScrollToTopButton, Loading } from "@components";
import FilterOptions from "./components/FilterOptions";
import BlogCard from "./components/BlogCard";
import { useNavigate, useSearchParams } from "react-router-dom";
import { API } from "@utils";
import { ChevronLeft, ChevronRight } from "lucide-react";

const Forum = () => {
    const limit = 5;
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const [blogs, setBlogs] = useState([]);
    const [blogClassification, setBlogClassification] = useState([]);
    const [selectedText, setSelectedText] = useState("Tất cả");
    const [page, setPage] = useState(1);
    const [meta, setMeta] = useState({});
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(false);

    useEffect(() => {
        const fetchBlogClassification = async () => {
            try {
                setFetching(true);
                const res = await API.get("/ai/classify-blogs");
                setBlogClassification(res.data);
            } catch (error) {
            } finally {
                setFetching(false);
            }
        };

        fetchBlogClassification();
    }, []);

    const fetchBlogs = async (page) => {
        try {
            setLoading(true);
            const res = await API.get(`/bai-dang?page=${page}&limit=${limit}&status=Đã đăng bài`);
            setBlogs(res.data.items);
            setMeta(res.data.meta);
        } catch (error) {
            console.error("Lỗi khi tải bài viết:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBlogs(page);
    }, [page]);

    useEffect(() => {
        setPage(parseInt(searchParams.get("page") || "1"));
    }, [searchParams]);

    const handleFilter = async (text) => {
        setSelectedText(text);
        switch (text) {
            case "Tất cả":
                await fetchBlogs(page);
                break;

            default:
                setBlogs(blogClassification[text]);
                break;
        }
    };

    const handlePageChange = (newPage) => {
        const newSearchParams = new URLSearchParams(searchParams);
        newSearchParams.set("page", newPage.toString());
        setSearchParams(newSearchParams);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    return (
        <section>
            <div className="py-4 px-2 sm:px-6">
                <Title value="Bài viết" className="mb-4" />
                <div className="flex flex-col-reverse gap-y-4 lg:flex-row">
                    <div className="max-w-[800px]">
                        {!fetching && <FilterOptions selectedText={selectedText} onClick={handleFilter} />}

                        <div className="flex flex-col gap-y-6 mt-8">
                            {loading ? (
                                <div className="flex items-center justify-center gap-x-2">
                                    <Loading /> <p>Đang tải bài viết...</p>
                                </div>
                            ) : blogs.length > 0 ? (
                                blogs.map((blog, index) => <BlogCard key={index} blog={blog} />)
                            ) : (
                                <p>Không có bài viết liên quan nào!</p>
                            )}
                            {selectedText === "Tất cả" && (
                                <div className="flex items-center justify-center">
                                    <button
                                        onClick={() => handlePageChange(page - 1)}
                                        disabled={page <= 1}
                                        className={`px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${
                                            page <= 1
                                                ? "text-gray-300 cursor-not-allowed"
                                                : "text-gray-500 hover:bg-gray-50"
                                        }`}
                                    >
                                        <ChevronLeft className="h-5 w-5" />
                                    </button>

                                    {meta.pageCount &&
                                        [...Array(Math.min(5, meta.pageCount))].map((_, i) => {
                                            let pageNum;
                                            if (meta.page <= 3) {
                                                pageNum = i + 1;
                                            } else if (page <= 3) {
                                                pageNum = i + 1;
                                            } else if (page >= meta.pageCount - 2) {
                                                pageNum = meta.pageCount - 4 + i;
                                            } else {
                                                pageNum = page - 2 + i;
                                            }

                                            return pageNum > 0 && pageNum <= meta.pageCount ? (
                                                <button
                                                    key={pageNum}
                                                    onClick={() => handlePageChange(pageNum)}
                                                    className={`inline-flex items-center px-4 py-2 border text-sm font-medium ${
                                                        page === pageNum
                                                            ? "z-10 bg-blue-50 border-blue-500 text-blue-600"
                                                            : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                                                    }`}
                                                >
                                                    {pageNum}
                                                </button>
                                            ) : null;
                                        })}

                                    <button
                                        onClick={() => handlePageChange(page + 1)}
                                        disabled={page >= meta.pageCount}
                                        className={`px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${
                                            page >= meta.pageCount
                                                ? "text-gray-300 cursor-not-allowed"
                                                : "text-gray-500 hover:bg-gray-50"
                                        }`}
                                    >
                                        <ChevronRight className="h-5 w-5" />
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="lg:px-6">
                        <p>
                            Bạn có thể tạo bài viết mới{" "}
                            <span
                                onClick={() => navigate("/bai-viet-moi")}
                                className="text-primary underline cursor-pointer"
                            >
                                tại đây
                            </span>
                        </p>
                    </div>
                </div>
            </div>
            <ScrollToTopButton />
        </section>
    );
};

export default Forum;
