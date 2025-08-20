import React from "react";
import { icourse } from "@assets";
import { useNavigate } from "react-router-dom";
import { formatGiaBan } from "@utils";
import { ChevronRight } from "lucide-react";

const CourseCard = ({ course, owner = false }) => {
    const navigate = useNavigate();

    const handleClick = (id) => {
        navigate(`/khoa-hoc/${id}`);
    };

    const isFree = course.giaBan === "0.00";

    return (
        <div
            onClick={() => handleClick(course.id)}
            className="group relative w-full max-w-sm mx-auto bg-white rounded-2xl border border-gray-200 hover:border-blue-300 shadow-md hover:shadow-2xl transition-all duration-300 cursor-pointer overflow-hidden transform hover:-translate-y-2"
            title={course.tenKhoaHoc}
        >
            <div className="relative w-full h-48 overflow-hidden">
                <img
                    src={course.hinhAnh || icourse}
                    alt={course.tenKhoaHoc}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
            </div>

            <div className="p-5 flex flex-col h-auto">
                <h3 className="font-bold text-lg text-gray-800 mb-2 line-clamp-1 group-hover:text-blue-600 transition-colors duration-300">
                    {course.tenKhoaHoc}
                </h3>

                <p className="text-gray-600 text-sm line-clamp-2 mb-4">{course.moTa}</p>

                <div className="flex items-center justify-between mt-auto">
                    <div className="flex items-center">
                        {owner ? (
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                <span className="text-green-600 font-semibold text-sm">Tiếp tục học</span>
                            </div>
                        ) : (
                            <div className="flex flex-col">
                                {isFree ? (
                                    <span className="text-green-600 font-bold text-lg">Miễn phí</span>
                                ) : (
                                    <div>
                                        <span className="text-blue-600 font-bold text-2xl mr-1">
                                            {formatGiaBan(course.giaBan)}
                                        </span>
                                        <span className="text-gray-500 text-xs">VNĐ</span>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="flex items-center gap-1 text-blue-600 text-sm font-medium">
                            <span>{owner ? "Học ngay" : "Xem chi tiết"}</span>
                            <ChevronRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-300" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CourseCard;
