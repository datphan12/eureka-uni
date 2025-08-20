import React, { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import Form from "../Form";
import Filter from "../Filter";
import Table from "../Table";
import { API, formatDate } from "@utils";
import { toast } from "react-toastify";
import { Avatar } from "@components";

const statusOptions = [
    { value: "Đã đăng bài", label: "Đã đăng bài" },
    { value: "Đã bị xóa", label: "Đã bị xóa" },
];

const Blog = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();

    const [blogs, setBlogs] = useState([]);
    const [userOptions, setUserOptions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [formMode, setFormMode] = useState(null);
    const [selectedBlog, setSelectedBlog] = useState(null);
    const [formError, setFormError] = useState(null);
    const [formLoading, setFormLoading] = useState(false);
    const [filterParams, setFilterParams] = useState({});
    const [sortBy, setSortBy] = useState("createdAt");
    const [sortOrder, setSortOrder] = useState("DESC");
    const pageSize = 10;

    const fetchUsers = async () => {
        try {
            const res = await API.get("nguoidung/all?admin=true&giangVien=true&hocVien=true");
            setUserOptions(res.data.map((user) => ({ value: user.id, label: user.hoTen })));
        } catch (error) {
            console.error("Error fetching users:", error);
        }
    };

    const fetchBlogById = async (blogId) => {
        setFormLoading(true);
        try {
            const res = await API.get(`/bai-dang/${blogId}`);
            setSelectedBlog(res.data);
        } catch (error) {
            console.error("Error fetching blog:", error);
            toast.error("Lỗi khi tải thông tin bài viết");
            navigate("/admin/quan-ly-bai-dang");
        } finally {
            setFormLoading(false);
        }
    };

    const fetchBlogs = async (page = 1, filters = {}, sort = { sortBy: "createdAt", sortOrder: "DESC" }) => {
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

            const response = await API.get(`/bai-dang`, { params });

            setBlogs(response.data.items);
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
                setSelectedBlog(null);
            } else {
                const mode = searchParams.get("mode");
                setFormMode(mode);
                fetchBlogById(id);
            }
        } else {
            setFormMode(null);
            setSelectedBlog(null);
        }
    }, [id, searchParams.toString()]);

    useEffect(() => {
        if (!formMode) {
            fetchBlogs(currentPage, filterParams, { sortBy, sortOrder });
            fetchUsers();
        }
    }, [currentPage, filterParams, formMode, sortBy, sortOrder]);

    const handlePageChange = (page) => {
        const newSearchParams = new URLSearchParams(searchParams);
        newSearchParams.set("page", page.toString());
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

    const handleViewBlog = (blog) => {
        navigate(`/admin/quan-ly-bai-dang/${blog.id}?mode=view`);
    };

    const handleEditBlog = (blog) => {
        navigate(`/admin/quan-ly-bai-dang/${blog.id}?mode=edit`);
    };

    const handleDeleteBlog = async (blog) => {
        if (window.confirm(`Bạn có chắc chắn muốn xóa bài viết ${blog.tieuDe}?`)) {
            try {
                const res = await API.delete(`/bai-dang/${blog.id}`);
                toast.success(res.data.message);
                fetchBlogs(currentPage, filterParams);
            } catch (error) {
                console.error("Error deleting blog:", error);
                toast.error(error?.response?.data?.message || "Lỗi khi xóa bài viết");
            }
        }
    };

    const handleAddBlog = () => {
        navigate("/admin/quan-ly-bai-dang/them-moi");
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
        navigate(`/admin/quan-ly-bai-dang${queryString ? "?" + queryString : ""}`);
    };

    const handleFormSubmit = async (formData) => {
        setFormLoading(true);
        setFormError(null);

        try {
            if (formMode === "create") {
                await API.post(`/bai-dang`, formData);
                toast.success("Thêm bài viết thành công");
            } else if (formMode === "edit") {
                await API.put(`/bai-dang/${selectedBlog.id}`, formData);
                toast.success("Cập nhật bài viết thành công");
            }

            handleFormCancel();
        } catch (error) {
            console.error("Error submitting form:", error);
            setFormError(error?.response?.data?.message || "Có lỗi xảy ra khi xử lý yêu cầu");
        } finally {
            setFormLoading(false);
        }
    };

    const handleUpdateStatusBlog = async (status, blogId) => {
        try {
            await API.put(`/bai-dang/${blogId}/status?status=${status}`);
            toast.success("Đã thay đổi trạng thái bài viết");
            fetchBlogs(currentPage, filterParams);
        } catch (error) {
            console.error("Error updating status:", error);
            toast.error("Có lỗi xảy ra khi thay đổi trạng thái bài viết");
        }
    };

    const blogFilters = [
        {
            name: "status",
            label: "Trạng thái",
            type: "select",
            options: statusOptions,
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
            title: "Tên bài viết",
            dataIndex: "tieuDe",
        },
        {
            title: "Trạng thái",
            dataIndex: "trangThai",
            render: (status, blog) => (
                <select
                    className={`border border-gray-300 rounded-md px-2 py-1 ${
                        status === "Đã đăng bài" ? "bg-blue-200" : "bg-red-300"
                    }`}
                    onChange={(e) => handleUpdateStatusBlog(e.target.value, blog.id)}
                    value={status}
                >
                    {statusOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>
            ),
        },
        {
            title: "Luợt thích",
            dataIndex: "luotThich",
            sortable: false,
            render: (luotThich) => luotThich.length,
        },
        {
            title: "Người tạo",
            dataIndex: "nguoiDung",
            sortable: false,
            render: (nguoiDung) => {
                if (nguoiDung) {
                    return (
                        <div className="flex items-center gap-x-2">
                            <Avatar src={nguoiDung.hinhAnh} />
                            <span>{nguoiDung.hoTen}</span>
                        </div>
                    );
                }
            },
        },
        {
            title: "Ngày tạo",
            dataIndex: "createdAt",
            render: (date) => formatDate(date),
        },
    ];

    const getBlogFormFields = () => {
        const baseFormFields = [
            {
                name: "tieuDe",
                label: "Tiêu đề bài viết",
                type: "text",
                placeholder: "Nhập tên bài viết",
                required: true,
                fullWidth: true,
            },
            {
                name: "luotThich",
                label: "Lượt thích",
                type: "text",
                render: (luotThich) => luotThich?.length,
            },
            {
                name: "maNguoiDung",
                label: "Người tạo",
                type: "select",
                options: userOptions,
                disabled: formMode === "edit",
            },
        ];

        if (formMode === "view") {
            baseFormFields.push({
                name: "createdAt",
                label: "Thời gian tạo bài viết",
                type: "text",
                disabled: true,
                render: (date) => formatDate(date),
            });
            baseFormFields.push({
                name: "noiDungHTML",
                label: "Nội dung bài viết",
                type: "blog-preview",
                fullWidth: true,
            });
        }

        if (formMode === "create" || formMode === "edit") {
            baseFormFields.push({
                name: "noiDungMarkdown",
                label: "Nội dung bài viết",
                type: "blog-editor",
                fullWidth: true,
            });
            return baseFormFields.filter((field) => field.name !== "luotThich");
        }

        return baseFormFields;
    };

    const getFormTitle = () => {
        switch (formMode) {
            case "view":
                return "Xem thông tin bài viết";
            case "create":
                return "Thêm bài viết mới";
            case "edit":
                return "Chỉnh sửa bài viết";
            default:
                return "";
        }
    };

    return (
        <div className="flex-1 p-6 flex flex-col h-full overflow-hidden">
            {formMode && (formMode === "create" || selectedBlog) ? (
                <Form
                    title={getFormTitle()}
                    fields={getBlogFormFields()}
                    data={selectedBlog}
                    onSubmit={handleFormSubmit}
                    onCancel={handleFormCancel}
                    mode={formMode}
                    loading={formLoading}
                    error={formError}
                />
            ) : (
                <div className="flex flex-col flex-1 overflow-hidden">
                    <div className="flex justify-between items-center mb-6">
                        <h1 className="text-2xl font-semibold">Quản lý bài viết</h1>
                        <button
                            onClick={handleAddBlog}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Thêm bài viết
                        </button>
                    </div>

                    <Filter
                        filters={blogFilters}
                        onFilter={handleFilter}
                        showSearchBox={true}
                        searchPlaceholder="Tìm kiếm theo tên bài viết..."
                        compact={true}
                        initialValues={filterParams}
                    />
                    <div className="flex-1 overflow-hidden">
                        <Table
                            columns={columns}
                            data={blogs}
                            loading={loading}
                            totalItems={totalItems}
                            currentPage={currentPage}
                            pageSize={pageSize}
                            onPageChange={handlePageChange}
                            onView={handleViewBlog}
                            onEdit={handleEditBlog}
                            onDelete={handleDeleteBlog}
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

export default Blog;
