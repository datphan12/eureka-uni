import React, { useEffect, useState } from "react";
import { API, uploadFileToCloudinary } from "@utils";
import { toast } from "react-toastify";
import { Title } from "@components";
import { useAuthStore } from "@store";
import Form from "../Admin/Form";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { Plus } from "lucide-react";
import Course from "./components/Course";

const MyCourse = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const user = useAuthStore((state) => state.user);

    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [formMode, setFormMode] = useState(null);
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [formError, setFormError] = useState(null);
    const [formLoading, setFormLoading] = useState(false);

    const fetchCourseById = async (courseId) => {
        setFormLoading(true);
        try {
            const res = await API.get(`/khoa-hoc/${courseId}`);
            setSelectedCourse(res.data);
        } catch (error) {
            console.error("Error fetching course:", error);
            toast.error("Lỗi khi tải thông tin khóa học");
            navigate("/me/khoa-hoc");
        } finally {
            setFormLoading(false);
        }
    };

    const fetchCourses = async () => {
        setLoading(true);
        try {
            const res = await API.get("khoa-hoc/nguoi-dung");
            setCourses(res.data);
        } catch (error) {
            console.error("Error fetching courses:", error);
            toast.error("Lỗi khi tải danh sách khóa học");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (id) {
            if (id === "them-moi") {
                setFormMode("create");
                setSelectedCourse(null);
            } else {
                const mode = searchParams.get("mode");
                setFormMode(mode);
                fetchCourseById(id);
            }
        } else {
            setFormMode(null);
            setSelectedCourse(null);
            fetchCourses();
        }
    }, [id, searchParams.toString()]);

    const handleViewCourse = (course) => {
        navigate(`/me/khoa-hoc/${course.id}?mode=view`);
    };

    const handleEditCourse = (course) => {
        navigate(`/me/khoa-hoc/${course.id}?mode=edit`);
    };

    const handleDeleteCourse = async (course) => {
        if (window.confirm(`Bạn có chắc chắn muốn xóa khóa học ${course.tenKhoaHoc}?`)) {
            try {
                const res = await API.delete(`/khoa-hoc/${course.id}`);
                toast.success(res.data.message);
                fetchCourses();
            } catch (error) {
                console.error("Error deleting course:", error);
                toast.error(error?.response?.data?.message || "Lỗi khi xóa khóa học");
            }
        }
    };

    const handleAddCourse = () => {
        navigate("/me/khoa-hoc/them-moi");
    };

    const handleFormCancel = () => {
        navigate("/me/khoa-hoc");
    };

    const handleFormSubmit = async (formData) => {
        setFormLoading(true);
        setFormError(null);

        try {
            if (formMode === "create") {
                const dataToSubmit = {
                    ...formData,
                    maNguoiTao: user.id,
                };

                await API.post("/khoa-hoc", dataToSubmit);
                toast.success("Thêm khóa học thành công");
            } else if (formMode === "edit") {
                await API.patch(`/khoa-hoc/${selectedCourse.id}`, formData);
                toast.success("Cập nhật khóa học thành công");
            }

            handleFormCancel();
        } catch (error) {
            console.error("Error submitting form:", error);
            setFormError(error?.response?.data?.message || "Có lỗi xảy ra khi xử lý yêu cầu");
        } finally {
            setFormLoading(false);
        }
    };

    const getCourseFormFields = () => {
        const baseFormFields = [
            {
                name: "tenKhoaHoc",
                label: "Tên khóa học",
                type: "text",
                placeholder: "Nhập tên khóa học",
                required: true,
                fullWidth: true,
            },
            {
                name: "giaBan",
                label: "Giá",
                type: "number",
                placeholder: "Nhập giá",
                required: true,
                defaultValue: 0,
            },
            {
                name: "moTa",
                label: "Mô tả",
                type: "textarea",
                placeholder: "Nhập mô tả",
                fullWidth: true,
            },
            {
                name: "hinhAnh",
                label: "Hình Ảnh",
                type: "image",
                required: true,
                fullWidth: true,
                uploadFunction: uploadFileToCloudinary,
            },
        ];

        if (formMode === "view" || formMode === "edit") {
            baseFormFields.push({
                label: "Bài giảng",
                type: "lectures",
                fullWidth: true,
            });
        }

        return baseFormFields;
    };

    const getFormTitle = () => {
        switch (formMode) {
            case "view":
                return "Xem thông tin khóa học";
            case "create":
                return "Thêm khóa học mới";
            case "edit":
                return "Chỉnh sửa khóa học";
            default:
                return "";
        }
    };

    if (formMode && (formMode === "create" || selectedCourse)) {
        return (
            <div className="flex-1 p-6 flex flex-col h-full overflow-hidden">
                <Form
                    title={getFormTitle()}
                    fields={getCourseFormFields()}
                    data={selectedCourse}
                    onSubmit={handleFormSubmit}
                    onCancel={handleFormCancel}
                    mode={formMode}
                    loading={formLoading}
                    error={formError}
                />
            </div>
        );
    }

    return (
        <section className="flex-1 p-6">
            <div className="flex justify-between items-center mb-6">
                <Title value="Khóa học của tôi" />
                <button
                    onClick={handleAddCourse}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                    <Plus size={20} />
                    Thêm khóa học
                </button>
            </div>

            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
            ) : courses.length === 0 ? (
                <div className="text-center py-12">
                    <div className="text-gray-500 text-lg mb-4">Bạn chưa có khóa học nào</div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {courses.map((course) => (
                        <Course
                            key={course.id}
                            course={course}
                            onView={handleViewCourse}
                            onEdit={handleEditCourse}
                            onDelete={handleDeleteCourse}
                        />
                    ))}
                </div>
            )}
        </section>
    );
};

export default MyCourse;
