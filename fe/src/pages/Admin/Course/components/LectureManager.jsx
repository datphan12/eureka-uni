import React, { useEffect, useState } from "react";
import { Loading } from "@components";
import { API } from "@utils";
import { toast } from "react-toastify";
import { Plus, X } from "lucide-react";
import Lecture from "./Lecture";

const LectureManager = ({ courseId, mode }) => {
    const [lectures, setLectures] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showingLectureId, setShowingLectureId] = useState(null);
    const [editingLectureId, setEditingLectureId] = useState(null);
    const [showAddForm, setShowAddForm] = useState(false);
    const [newLecture, setNewLecture] = useState({
        tieuDe: "",
        moTa: "",
        videoUrl: "",
        thuTu: 1,
    });

    const isDisabled = mode === "view";

    const sortLecturesByOrder = (lectures) => {
        return lectures.sort((a, b) => a.thuTu - b.thuTu);
    };

    const fetchLecturesByCourseId = async (courseId) => {
        setLoading(true);
        try {
            const res = await API.get(`bai-giang?maKhoaHoc=${courseId}`);
            setLectures(sortLecturesByOrder(res.data));
        } catch (error) {
            console.error("Error fetching lectures:", error);
            toast.error("Lỗi khi tải danh sách bài giảng");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLecturesByCourseId(courseId);
    }, [courseId]);

    const getNextOrder = () => {
        return lectures.length > 0 ? Math.max(...lectures.map((l) => l.thuTu)) + 1 : 1;
    };

    const handleAddLecture = async () => {
        if (!newLecture.tieuDe.trim()) {
            toast.error("Vui lòng nhập tiêu đề bài giảng");
            return;
        }

        if (!newLecture.videoUrl.trim()) {
            toast.error("Vui lòng nhập URL video bài giảng");
            return;
        }

        const duplicateOrder = lectures.find((l) => l.thuTu === newLecture.thuTu);
        if (duplicateOrder) {
            toast.error(`Thứ tự ${newLecture.thuTu} đã tồn tại`);
            return;
        }

        setLoading(true);
        try {
            const lectureData = {
                ...newLecture,
                maKhoaHoc: courseId,
            };

            await API.post("bai-giang", lectureData);
            toast.success("Thêm bài giảng thành công");

            setNewLecture({
                tieuDe: "",
                moTa: "",
                videoUrl: "",
                thuTu: getNextOrder(),
            });
            setShowAddForm(false);
            await fetchLecturesByCourseId(courseId);
        } catch (error) {
            console.error("Error adding lecture:", error);
            toast.error("Lỗi khi thêm bài giảng");
        } finally {
            setLoading(false);
        }
    };

    const handleEditLecture = (lectureId) => {
        setEditingLectureId(lectureId);
        setShowingLectureId(null);
    };

    const handleSaveEdit = async (lectureId, editData) => {
        if (!editData.tieuDe.trim()) {
            toast.error("Vui lòng nhập tiêu đề bài giảng");
            return;
        }

        if (!editData.videoUrl.trim()) {
            toast.error("Vui lòng nhập URL video bài giảng");
            return;
        }

        const duplicateOrder = lectures.find((l) => l.thuTu === editData.thuTu && l.id !== lectureId);
        if (duplicateOrder) {
            toast.error(`Thứ tự ${editData.thuTu} đã tồn tại`);
            return;
        }

        setLoading(true);
        try {
            const updateData = {
                ...editData,
                maBaiGiang: lectureId,
            };

            await API.post("bai-giang/update-lecture", updateData);
            toast.success("Cập nhật bài giảng thành công");

            setEditingLectureId(null);
            await fetchLecturesByCourseId(courseId);
        } catch (error) {
            console.error("Error updating lecture:", error);
            toast.error("Lỗi khi cập nhật bài giảng");
        } finally {
            setLoading(false);
        }
    };

    const handleCancelEdit = () => {
        setEditingLectureId(null);
    };

    const handleDeleteLecture = async (lectureId) => {
        setLoading(true);
        try {
            await API.delete(`bai-giang/${lectureId}`);
            toast.success("Xóa bài giảng thành công");
            await fetchLecturesByCourseId(courseId);
        } catch (error) {
            console.error("Error deleting lecture:", error);
            toast.error("Lỗi khi xóa bài giảng");
        } finally {
            setLoading(false);
        }
    };

    const handleShowLecture = (lectureId) => {
        if (showingLectureId === lectureId) {
            setShowingLectureId(null);
        } else {
            setShowingLectureId(lectureId);
            setEditingLectureId(null);
        }
    };

    const handleNewLectureChange = (field, value) => {
        setNewLecture((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    const handleShowAddForm = () => {
        setNewLecture({
            tieuDe: "",
            moTa: "",
            videoUrl: "",
            thuTu: getNextOrder(),
        });
        setShowAddForm(true);
        setShowingLectureId(null);
        setEditingLectureId(null);
    };

    return (
        <div className="bg-gray-100 border border-gray-300 rounded-lg p-4">
            {!isDisabled && (
                <div className="flex items-center justify-between mb-3">
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900">Quản lý bài giảng</h2>
                        <p className="italic">Tổng số bài giảng: {lectures.length}</p>
                    </div>
                    <button
                        onClick={handleShowAddForm}
                        className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        disabled={loading}
                    >
                        <Plus size={16} className="mr-2" />
                        Thêm bài giảng
                    </button>
                </div>
            )}

            {showAddForm && (
                <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg font-medium text-gray-900">Thêm bài giảng mới</h3>
                        <button
                            onClick={() => setShowAddForm(false)}
                            className="p-1 rounded-full hover:bg-gray-100 text-gray-500"
                        >
                            <X size={20} />
                        </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-y-2 gap-x-4">
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Tiêu đề <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={newLecture.tieuDe}
                                onChange={(e) => handleNewLectureChange("tieuDe", e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                placeholder="Nhập tiêu đề bài giảng"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Thứ tự <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="number"
                                value={newLecture.thuTu}
                                onChange={(e) => handleNewLectureChange("thuTu", parseInt(e.target.value) || 0)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                min="1"
                                required
                            />
                        </div>

                        <div className="md:col-span-3">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Mô tả</label>
                            <textarea
                                value={newLecture.moTa}
                                onChange={(e) => handleNewLectureChange("moTa", e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                rows="2"
                                placeholder="Nhập mô tả bài giảng"
                            />
                        </div>
                        <div className="md:col-span-3">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                URL Video <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="url"
                                value={newLecture.videoUrl}
                                onChange={(e) => handleNewLectureChange("videoUrl", e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                placeholder="https://www.youtube.com/watch?v=..."
                                required
                            />
                        </div>
                    </div>

                    <div className="flex items-center justify-end space-x-3 mt-6">
                        <button
                            onClick={() => setShowAddForm(false)}
                            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                            disabled={loading}
                        >
                            Hủy
                        </button>
                        <button
                            onClick={handleAddLecture}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                            disabled={loading}
                        >
                            {loading ? "Đang thêm..." : "Thêm bài giảng"}
                        </button>
                    </div>
                </div>
            )}

            {loading ? (
                <div className="flex justify-center py-8">
                    <Loading className="w-6 h-6" />
                </div>
            ) : lectures && lectures.length > 0 ? (
                <div className="max-h-[600px] overflow-auto space-y-4">
                    {lectures.map((lecture) => (
                        <Lecture
                            key={lecture.id}
                            lecture={lecture}
                            showingLectureId={showingLectureId}
                            editingLectureId={editingLectureId}
                            onClick={handleShowLecture}
                            onEdit={handleEditLecture}
                            onDelete={handleDeleteLecture}
                            onSaveEdit={handleSaveEdit}
                            onCancelEdit={handleCancelEdit}
                            mode={mode}
                        />
                    ))}
                </div>
            ) : (
                <div className="text-center">
                    <p className="text-gray-500 text-lg">Chưa có bài giảng nào</p>
                    <p className="text-gray-400 text-sm mt-2">Hãy thêm bài giảng đầu tiên cho khóa học này</p>
                </div>
            )}
        </div>
    );
};

export default LectureManager;
