import React, { useEffect, useState } from "react";
import { API, uploadFileToCloudinary, formatDate, formatGiaBan } from "@utils";
import { toast } from "react-toastify";
import Table from "../Table";
import Form from "../Form";
import Filter from "../Filter";
import RenderStatus from "@helpers/renderStatus";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";

const Course = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();

    const [courses, setCourses] = useState([]);
    const [userOptions, setUserOptions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [formMode, setFormMode] = useState(null);
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [formError, setFormError] = useState(null);
    const [formLoading, setFormLoading] = useState(false);
    const [filterParams, setFilterParams] = useState({});
    const [sortBy, setSortBy] = useState("createdAt");
    const [sortOrder, setSortOrder] = useState("DESC");
    const pageSize = 10;

    const fetchUsers = async () => {
        try {
            const res = await API.get("nguoidung/all?admin=true&giangVien=true");
            setUserOptions(res.data.map((user) => ({ value: user.id, label: user.hoTen })));
        } catch (error) {
            console.error("Error fetching users:", error);
        }
    };

    const fetchCourseById = async (courseId) => {
        setFormLoading(true);
        try {
            const res = await API.get(`/khoa-hoc/${courseId}`);
            setSelectedCourse(res.data);
        } catch (error) {
            console.error("Error fetching course:", error);
            toast.error("Lỗi khi tải thông tin khóa học");
            navigate("/admin/quan-ly-khoa-hoc");
        } finally {
            setFormLoading(false);
        }
    };

    const fetchCourses = async (page = 1, filters = {}, sort = { sortBy: "createdAt", sortOrder: "DESC" }) => {
        setLoading(true);
        try {
            const params = {
                page,
                limit: pageSize,
                sortBy: sort.sortBy,
                sortOrder: sort.sortOrder,
                ...filters,
            };

            Object.keys(params).forEach((key) => {
                if (params[key] === "" || params[key] === undefined) {
                    delete params[key];
                }
            });

            const response = await API.get(`/khoa-hoc`, { params });

            setCourses(response.data.items);
            setTotalItems(response.data.meta.itemCount);
            setCurrentPage(response.data.meta.page);
        } catch (error) {
            console.error("Error fetching users:", error);
            toast.error("Lỗi khi tải danh sách người dùng");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const pageFromUrl = parseInt(searchParams.get("page") || "1", 10);
        const sortByFromUrl = searchParams.get("sortBy") || "createdAt";
        const sortOrderFromUrl = searchParams.get("sortOrder") || "DESC";

        const urlFilterParams = {};
        for (const [key, value] of searchParams.entries()) {
            if (key !== "page" && key !== "mode") {
                urlFilterParams[key] = value;
            }
        }

        setCurrentPage(pageFromUrl);
        setSortBy(sortByFromUrl);
        setSortOrder(sortOrderFromUrl);
        setFilterParams(urlFilterParams);

        if (id) {
            if (id === "them-moi") {
                setFormMode("create");
                setSelectedCourse(null);
                fetchUsers();
            } else {
                const mode = searchParams.get("mode");
                setFormMode(mode);
                fetchUsers();
                fetchCourseById(id);
            }
        } else {
            setFormMode(null);
            setSelectedCourse(null);
        }
    }, [id, searchParams.toString()]);

    useEffect(() => {
        if (!formMode) {
            fetchCourses(currentPage, filterParams, { sortBy, sortOrder });
        }
    }, [currentPage, filterParams, formMode, sortBy, sortOrder]);

    const handlePageChange = (page) => {
        const newSearchParams = new URLSearchParams(searchParams);
        newSearchParams.set("page", page.toString());
        setSearchParams(newSearchParams);
    };

    const handleFilter = (filters) => {
        const { search, ...otherFilters } = filters;
        const newFilters = { ...otherFilters };

        if (search) {
            newFilters.search = search;
        }

        const newSearchParams = new URLSearchParams();
        newSearchParams.set("page", "1");

        Object.keys(newFilters).forEach((key) => {
            if (newFilters[key] && newFilters[key] !== "") {
                newSearchParams.set(key, newFilters[key]);
            }
        });

        setSearchParams(newSearchParams);
    };

    const handleSort = (columnKey, order) => {
        setSortBy(columnKey);
        setSortOrder(order);

        const newSearchParams = new URLSearchParams(searchParams);
        newSearchParams.set("sortBy", columnKey);
        newSearchParams.set("sortOrder", order);
        newSearchParams.set("page", "1");
        setSearchParams(newSearchParams);
    };

    const handleViewCourse = (course) => {
        navigate(`/admin/quan-ly-khoa-hoc/${course.id}?mode=view`);
    };

    const handleEditCourse = (course) => {
        navigate(`/admin/quan-ly-khoa-hoc/${course.id}?mode=edit`);
    };

    const handleDeleteCourse = async (course) => {
        if (window.confirm(`Bạn có chắc chắn muốn xóa khóa học ${course.tenKhoaHoc}?`)) {
            try {
                const res = await API.delete(`/khoa-hoc/${course.id}`);
                toast.success(res.data.message);
                fetchCourses(currentPage, filterParams);
            } catch (error) {
                console.error("Error deleting course:", error);
                toast.error(error?.response?.data?.message || "Lỗi khi xóa khóa học");
            }
        }
    };

    const handleRestoreCourse = async (course) => {
        if (window.confirm(`Bạn có chắc chắn muốn phục hồi khóa học ${course.tenKhoaHoc}?`)) {
            try {
                const res = await API.post(`/khoa-hoc/restore/${course.id}`);
                toast.success(res.data.message);

                fetchCourses(currentPage, filterParams);
            } catch (error) {
                console.error("Error restoring course:", error);
                toast.error(error?.response?.data?.message || "Lỗi khi phục hồi khóa học");
            }
        }
    };

    const handleAddCourse = () => {
        navigate("/admin/quan-ly-khoa-hoc/them-moi");
    };

    const handleFormCancel = () => {
        const currentParams = new URLSearchParams();
        currentParams.set("page", currentPage.toString());

        Object.keys(filterParams).forEach((key) => {
            if (filterParams[key] && filterParams[key] !== "") {
                currentParams.set(key, filterParams[key]);
            }
        });

        const queryString = currentParams.toString();
        navigate(`/admin/quan-ly-khoa-hoc${queryString ? "?" + queryString : ""}`);
    };

    const handleFormSubmit = async (formData) => {
        setFormLoading(true);
        setFormError(null);

        try {
            if (formMode === "create") {
                await API.post("/khoa-hoc", formData);
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

    const courseFilters = [
        {
            name: "deletedAt",
            label: "Tình trạng",
            type: "select",
            options: [
                { value: "", label: "Tất cả" },
                { value: "false", label: "Chưa xóa" },
                { value: "true", label: "Đã xóa" },
            ],
        },
        {
            name: "price",
            label: "Giá bán (VNĐ)",
            type: "range",
            min: 0,
            max: 500000,
            minPlaceholder: "Từ giá",
            maxPlaceholder: "Đến giá",
            fullWidth: true,
        },
        {
            name: "createdAt",
            label: "Ngày tạo",
            type: "dateRange",
            fullWidth: true,
        },
    ];

    const columns = [
        {
            title: "Tên khóa học",
            dataIndex: "tenKhoaHoc",
        },
        {
            title: "Mô tả",
            dataIndex: "moTa",
        },
        {
            title: "Hình ảnh",
            dataIndex: "hinhAnh",
            sortable: false,
            render: (hinhAnh) => <img src={hinhAnh} alt="Hình ảnh" className="h-10 w-20 object-cover" />,
        },
        {
            title: "Giá",
            dataIndex: "giaBan",
            render: (giaBan) => `${formatGiaBan(giaBan)} VNĐ`,
        },
        {
            title: "Ngày Tạo",
            dataIndex: "createdAt",
            render: (date) => formatDate(date),
        },
        {
            title: "Trạng thái",
            dataIndex: "deletedAt",
            render: (date) => <RenderStatus data={!date} trueValue="Hoạt động" falseValue="Đã xóa" />,
        },
    ];

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
                name: "maNguoiTao",
                label: "Người tạo",
                type: "select",
                required: true,
                options: userOptions,
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
                // name: "baiGiangs",
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

    return (
        <div className="flex-1 p-6 flex flex-col h-full overflow-hidden">
            {formMode && (formMode === "create" || selectedCourse) ? (
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
            ) : (
                <div className="flex flex-col flex-1 overflow-hidden">
                    <div className="flex justify-between items-center mb-6">
                        <h1 className="text-2xl font-semibold">Quản lý khóa học</h1>
                        <button
                            onClick={handleAddCourse}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Thêm khóa học
                        </button>
                    </div>

                    <Filter
                        filters={courseFilters}
                        onFilter={handleFilter}
                        showSearchBox={true}
                        searchPlaceholder="Tìm kiếm theo tên khóa học..."
                        compact={true}
                        initialValues={filterParams}
                    />
                    <div className="flex-1 overflow-hidden">
                        <Table
                            columns={columns}
                            data={courses}
                            loading={loading}
                            totalItems={totalItems}
                            currentPage={currentPage}
                            pageSize={pageSize}
                            onPageChange={handlePageChange}
                            onView={handleViewCourse}
                            onEdit={handleEditCourse}
                            onDelete={handleDeleteCourse}
                            onRestore={handleRestoreCourse}
                            sortBy={sortBy}
                            sortOrder={sortOrder}
                            onSort={handleSort}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default Course;
