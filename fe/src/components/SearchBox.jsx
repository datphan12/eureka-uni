import React, { useEffect, useRef, useState } from "react";
import { API } from "@utils";
import useDebounce from "@hooks/useDebounce";
import { Loading } from "@components";
import { useNavigate } from "react-router-dom";
import { Search, BookOpen, FileText, TrendingUp } from "lucide-react";

const SearchBox = () => {
    const boxRef = useRef(null);
    const navigate = useNavigate();

    const [text, setText] = useState("");
    const [data, setData] = useState({ khoaHocs: [], baiDangs: [] });
    const [showResult, setShowResult] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const debouncedText = useDebounce(text, 500);

    const handleSearch = async () => {
        if (!debouncedText.trim()) {
            setData({ khoaHocs: [], baiDangs: [] });
            setIsLoading(false);
            return;
        }

        try {
            if (debouncedText.length < 2) return;
            setIsLoading(true);
            const res = await API.get(`/nguoidung/search/course-and-blog?name=${debouncedText}`);
            setData(res.data);
        } catch (error) {
            console.error("Lỗi khi tìm kiếm khóa học:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleChange = (e) => {
        if (e.target.value.length < 3) {
            setShowResult(false);
        } else {
            setShowResult(true);
        }
        setText(e.target.value);
    };

    useEffect(() => {
        handleSearch();
    }, [debouncedText]);

    useEffect(() => {
        const handleClickOuSide = (e) => {
            if (boxRef.current && !boxRef.current.contains(e.target)) {
                setText("");
                setShowResult(false);
            }
        };

        document.addEventListener("mousedown", handleClickOuSide);
        return () => {
            document.removeEventListener("mousedown", handleClickOuSide);
        };
    }, []);

    const handleNavigate = (path) => {
        setText("");
        setShowResult(false);
        navigate(path);
    };

    return (
        <div className="relative w-full max-w-2xl mx-auto">
            {/* Search Input */}
            <div className="relative group">
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10">
                    <Search className="w-5 h-5 text-gray-400 group-focus-within:text-[#49BBBD] transition-colors" />
                </div>
                <input
                    type="text"
                    placeholder="Tìm kiếm khóa học, bài đăng, ..."
                    value={text}
                    onChange={handleChange}
                    className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#49BBBD]/20 focus:border-[#49BBBD] focus:bg-white transition-all duration-200 text-sm placeholder:text-gray-500"
                />
                {isLoading && <Loading className="absolute right-4 top-1/2 transform -translate-y-1/2 w-4 h-4" />}
            </div>

            {/* Search Results */}
            {showResult && (
                <div
                    ref={boxRef}
                    className="absolute -left-12 md:left-0 min-w-[260px] md:w-full top-full right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50 max-h-96 overflow-y-auto"
                >
                    {/* Header */}
                    <div className="px-6 py-4 bg-gradient-to-r from-[#49BBBD]/5 to-[#49BBBD]/10 border-b border-gray-100">
                        <div className="flex items-center gap-2">
                            <TrendingUp className="w-4 h-4 text-[#49BBBD]" />
                            <span className="text-sm font-medium text-gray-700">Kết quả tìm kiếm cho "{text}"</span>
                        </div>
                    </div>

                    <div className="py-2">
                        {/* Khóa học */}
                        <div className="px-6 py-3">
                            <div className="flex items-center gap-2 mb-3">
                                <BookOpen className="w-4 h-4 text-[#49BBBD]" />
                                <h3 className="font-semibold text-gray-800">Khóa học</h3>
                                {data.khoaHocs.length > 0 && (
                                    <span className="bg-[#49BBBD]/10 text-[#49BBBD] text-xs px-2 py-1 rounded-full">
                                        {data.khoaHocs.length}
                                    </span>
                                )}
                            </div>

                            <div className="space-y-1">
                                {data.khoaHocs.length > 0 ? (
                                    data.khoaHocs.map((khoaHoc) => (
                                        <div
                                            key={khoaHoc.id}
                                            onClick={() => handleNavigate(`/khoa-hoc/${khoaHoc.id}`)}
                                            className="flex items-center gap-3 p-3 rounded-xl hover:bg-[#49BBBD]/5 cursor-pointer transition-all duration-200 group"
                                        >
                                            <div className="relative">
                                                <img
                                                    src={khoaHoc.hinhAnh}
                                                    alt="khoa hoc"
                                                    className="w-10 h-10 rounded-lg object-cover ring-2 ring-gray-100 group-hover:ring-[#49BBBD]/20 transition-all"
                                                />
                                                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-[#49BBBD] rounded-full flex items-center justify-center">
                                                    <BookOpen className="w-2 h-2 text-white" />
                                                </div>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-gray-800 truncate group-hover:text-[#49BBBD] transition-colors">
                                                    {khoaHoc.tenKhoaHoc}
                                                </p>
                                                <p className="text-xs text-gray-500 mt-1">Khóa học</p>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-6">
                                        <BookOpen className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                                        <p className="text-sm text-gray-500">Không tìm thấy khóa học nào</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {data.khoaHocs.length > 0 && data.baiDangs.length > 0 && (
                            <div className="mx-6 border-t border-gray-200"></div>
                        )}

                        {/* Bài đăng */}
                        <div className="px-6 py-3">
                            <div className="flex items-center gap-2 mb-3">
                                <FileText className="w-4 h-4 text-[#49BBBD]" />
                                <h3 className="font-semibold text-gray-800">Bài đăng</h3>
                                {data.baiDangs.length > 0 && (
                                    <span className="bg-[#49BBBD]/10 text-[#49BBBD] text-xs px-2 py-1 rounded-full">
                                        {data.baiDangs.length}
                                    </span>
                                )}
                            </div>

                            <div className="space-y-1">
                                {data.baiDangs.length > 0 ? (
                                    data.baiDangs.map((baiDang) => (
                                        <div
                                            key={baiDang.id}
                                            onClick={() => handleNavigate(`/bai-viet/${baiDang.id}`)}
                                            className="flex items-center gap-3 p-3 rounded-xl hover:bg-[#49BBBD]/5 cursor-pointer transition-all duration-200 group"
                                        >
                                            <div className="w-10 h-10 bg-gradient-to-br from-[#49BBBD]/20 to-[#49BBBD]/10 rounded-lg flex items-center justify-center">
                                                <FileText className="w-5 h-5 text-[#49BBBD]" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-gray-800 line-clamp-2 group-hover:text-[#49BBBD] transition-colors">
                                                    {baiDang.tieuDe}
                                                </p>
                                                <p className="text-xs text-gray-500 mt-1">Bài đăng</p>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-6">
                                        <FileText className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                                        <p className="text-sm text-gray-500">Không tìm thấy bài đăng nào</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SearchBox;
