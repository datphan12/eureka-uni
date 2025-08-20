import React from "react";
import { formatGiaBan, formatDate } from "@utils";
import { Edit, Trash2, Eye } from "lucide-react";

const Course = ({ course, onView, onEdit, onDelete }) => {
    return (
        <div className="bg-white border border-gray-300 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 p-4">
            <div className="flex gap-2 items-center justify-end">
                <div className="bg-gray-100 px-2 py-1 rounded-full space-x-2">
                    <button
                        onClick={() => onView && onView(course)}
                        className="p-1 text-green-700 rounded-full hover:bg-white transition-colors cursor-pointer"
                        title="Xem chi tiết"
                    >
                        <Eye size={18} />
                    </button>
                    <button
                        onClick={() => onEdit && onEdit(course)}
                        className="p-1 text-blue-700 rounded-full hover:bg-white transition-colors cursor-pointer"
                        title="Chỉnh sửa"
                    >
                        <Edit size={18} />
                    </button>
                    <button
                        onClick={() => onDelete && onDelete(course)}
                        className="p-1 text-red-600 rounded-full hover:bg-white transition-colors cursor-pointer"
                        title="Xóa"
                    >
                        <Trash2 size={18} />
                    </button>
                </div>
            </div>

            <div className="">
                <div className="flex items-center gap-4">
                    <img src={course.hinhAnh} alt={course.tenKhoaHoc} className="w-16 h-auto object-cover" />
                    <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-1">{course.tenKhoaHoc}</h3>
                        <p className="text-gray-600 text-sm mb-4 line-clamp-2 leading-relaxed">
                            {course.moTa || "Chưa có mô tả"}
                        </p>
                    </div>
                </div>
                <div className="flex justify-between items-center pt-4 border-t">
                    <div className="text-right">
                        <div className="text-xl font-bold text-blue-600">
                            {course.giaBan === "0.00" ? "Miễn phí" : `${formatGiaBan(course.giaBan)} VNĐ`}
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="text-sm text-gray-500">Tạo ngày</div>
                        <div className="text-sm font-medium text-gray-700">{formatDate(course.createdAt)}</div>
                    </div>
                </div>
                <div className="mt-3 flex justify-between items-center">
                    <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            course.deletedAt ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"
                        }`}
                    >
                        {course.deletedAt ? "Đã xóa" : "Hoạt động"}
                    </span>
                    {course.updatedAt !== course.createdAt && (
                        <span className="text-xs text-gray-400">Cập nhật: {formatDate(course.updatedAt)}</span>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Course;
