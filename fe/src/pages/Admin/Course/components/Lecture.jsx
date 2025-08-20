import React, { useState } from "react";
import { Edit, Trash2, Save, X, Play } from "lucide-react";
import Document from "./Document";
import { formatDate } from "@utils";

/**
 * COMPONENT HIỂN THỊ BÀI GIẢNG
 * @function view
 * @function edit
 */
const Lecture = ({
    lecture,
    showingLectureId,
    onClick,
    onEdit,
    onDelete,
    editingLectureId,
    onSaveEdit,
    onCancelEdit,
    mode,
}) => {
    const [editData, setEditData] = useState({
        tieuDe: lecture.tieuDe,
        moTa: lecture.moTa || "",
        videoUrl: lecture.videoUrl || "",
        thuTu: lecture.thuTu,
    });

    const isShowing = showingLectureId === lecture.id;
    const isEditing = editingLectureId === lecture.id;
    const isDisabled = mode === "view";

    const handleEditClick = (e) => {
        e.stopPropagation();
        onEdit(lecture.id);
        setEditData({
            tieuDe: lecture.tieuDe,
            moTa: lecture.moTa || "",
            videoUrl: lecture.videoUrl || "",
            thuTu: lecture.thuTu,
        });
    };

    const handleDeleteClick = (e) => {
        e.stopPropagation();
        if (window.confirm("Bạn có chắc chắn muốn xóa bài giảng này?")) {
            onDelete(lecture.id);
        }
    };

    const handleSaveClick = (e) => {
        e.stopPropagation();
        onSaveEdit(lecture.id, editData);
    };

    const handleCancelClick = (e) => {
        e.stopPropagation();
        onCancelEdit();
        setEditData({
            tieuDe: lecture.tieuDe,
            moTa: lecture.moTa || "",
            videoUrl: lecture.videoUrl || "",
            thuTu: lecture.thuTu,
        });
    };

    const handleInputChange = (field, value) => {
        setEditData((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    return (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="p-4 cursor-pointer" onClick={() => !isEditing && onClick(lecture.id)}>
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        {isEditing ? (
                            <div className="space-y-3">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Thứ tự</label>
                                    <input
                                        type="number"
                                        value={editData.thuTu}
                                        onChange={(e) => handleInputChange("thuTu", parseInt(e.target.value) || 0)}
                                        className="w-28 px-3 py-1 border border-gray-300 rounded-md"
                                        min="1"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Tiêu đề</label>
                                    <input
                                        type="text"
                                        value={editData.tieuDe}
                                        onChange={(e) => handleInputChange("tieuDe", e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                        placeholder="Nhập tiêu đề bài giảng"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
                                    <textarea
                                        value={editData.moTa}
                                        onChange={(e) => handleInputChange("moTa", e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                        rows="3"
                                        placeholder="Nhập mô tả bài giảng"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">URL Video</label>
                                    <input
                                        type="url"
                                        value={editData.videoUrl}
                                        onChange={(e) => handleInputChange("videoUrl", e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="https://www.youtube.com/watch?v=..."
                                    />
                                </div>
                            </div>
                        ) : (
                            <div>
                                <h3 className="font-medium text-gray-900 mb-1">
                                    {lecture.thuTu}. {lecture.tieuDe}
                                </h3>
                                {lecture.moTa && <p className="text-sm text-gray-600 line-clamp-2">{lecture.moTa}</p>}
                            </div>
                        )}
                    </div>

                    <div className="flex items-center space-x-1 ml-4">
                        {isEditing ? (
                            <>
                                <button
                                    type="button"
                                    onClick={handleSaveClick}
                                    className="p-2 rounded-full hover:bg-green-100 text-green-600 transition-colors"
                                    title="Lưu thay đổi"
                                >
                                    <Save size={16} />
                                </button>
                                <button
                                    type="button"
                                    onClick={handleCancelClick}
                                    className="p-2 rounded-full hover:bg-gray-100 text-gray-600 transition-colors"
                                    title="Hủy"
                                >
                                    <X size={16} />
                                </button>
                            </>
                        ) : (
                            !isDisabled && (
                                <>
                                    <button
                                        type="button"
                                        onClick={handleEditClick}
                                        className="p-2 rounded-full hover:bg-blue-100 text-blue-600 transition-colors"
                                        title="Sửa bài giảng"
                                    >
                                        <Edit size={16} />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleDeleteClick}
                                        className="p-2 rounded-full hover:bg-red-100 text-red-600 transition-colors"
                                        title="Xóa bài giảng"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </>
                            )
                        )}
                    </div>
                </div>
            </div>

            {isShowing && !isEditing && (
                <div className="border-t border-gray-200 p-4 bg-gray-50">
                    <div className="space-y-4">
                        <div>
                            <h4 className="font-medium text-gray-900 mb-2">Thông tin chi tiết</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                <div>
                                    <span className="font-medium text-gray-700">ID:</span>
                                    <span className="ml-2 text-gray-600">{lecture.id}</span>
                                </div>
                                <div>
                                    <span className="font-medium text-gray-700">Thứ tự:</span>
                                    <span className="ml-2 text-gray-600">{lecture.thuTu}</span>
                                </div>
                                <div>
                                    <span className="font-medium text-gray-700">Ngày tạo:</span>
                                    <span className="ml-2 text-gray-600">{formatDate(lecture.createdAt)}</span>
                                </div>
                                <div>
                                    <span className="font-medium text-gray-700">Cập nhật:</span>
                                    <span className="ml-2 text-gray-600">{formatDate(lecture.updatedAt)}</span>
                                </div>
                            </div>
                        </div>

                        {lecture.moTa && (
                            <div>
                                <span className="font-medium text-gray-700">Mô tả:</span>
                                <p className="mt-1 text-gray-600">{lecture.moTa}</p>
                            </div>
                        )}

                        {lecture.videoUrl && (
                            <div className="flex gap-x-2">
                                <div className="flex items-center mb-2">
                                    <Play size={16} className="text-red-600" />
                                    <span className="font-medium text-sm text-gray-700">Video bài giảng:</span>
                                </div>
                                <a
                                    href={lecture.videoUrl}
                                    target="_blank"
                                    className="text-sm text-blue-600 hover:text-blue-800 underline"
                                >
                                    {lecture.videoUrl}
                                </a>
                            </div>
                        )}

                        <Document lectureId={lecture.id} mode={mode} />
                    </div>
                </div>
            )}
        </div>
    );
};

export default Lecture;
