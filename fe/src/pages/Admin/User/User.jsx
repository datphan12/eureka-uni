import React, { useEffect, useState } from "react";
import Table from "../Table";
import Form from "../Form";
import Filter from "../Filter";
import RenderStatus from "@helpers/renderStatus";
import { formatDate, uploadFileToCloudinary, API } from "@utils";
import { toast } from "react-toastify";
import { Avatar } from "@components";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";

const User = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();

    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [formMode, setFormMode] = useState(null);
    const [selectedUser, setSelectedUser] = useState(null);
    const [formError, setFormError] = useState(null);
    const [formLoading, setFormLoading] = useState(false);
    const [filterParams, setFilterParams] = useState({});
    const [sortBy, setSortBy] = useState("createdAt");
    const [sortOrder, setSortOrder] = useState("DESC");
    const pageSize = 10;

    const fetchUserById = async (userId) => {
        setFormLoading(true);
        try {
            const res = await API.get(`/nguoidung/${userId}`);
            setSelectedUser(res.data);
        } catch (error) {
            console.error("Error fetching user:", error);
            toast.error("Lỗi khi tải thông tin người dùng");
            navigate("/admin/quan-ly-nguoi-dung");
        } finally {
            setFormLoading(false);
        }
    };

    const fetchUsers = async (page = 1, filters = {}, sort = { sortBy: "createdAt", sortOrder: "DESC" }) => {
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

            const response = await API.get(`/nguoidung`, { params });

            setUsers(response.data.items);
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
                setSelectedUser(null);
            } else {
                const mode = searchParams.get("mode");
                setFormMode(mode);
                fetchUserById(id);
            }
        } else {
            setFormMode(null);
            setSelectedUser(null);
        }
    }, [id, searchParams.toString()]);

    useEffect(() => {
        if (!formMode) {
            fetchUsers(currentPage, filterParams, { sortBy, sortOrder });
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

    const handleViewUser = (user) => {
        navigate(`/admin/quan-ly-nguoi-dung/${user.id}?mode=view`);
    };

    const handleEditUser = (user) => {
        navigate(`/admin/quan-ly-nguoi-dung/${user.id}?mode=edit`);
    };

    const handleDeleteUser = async (user) => {
        if (window.confirm(`Bạn có chắc chắn muốn xóa người dùng ${user.hoTen}?`)) {
            try {
                const res = await API.delete(`/nguoidung/${user.id}`);
                toast.success(res.data.message);
                fetchUsers(currentPage, filterParams);
            } catch (error) {
                console.error("Error deleting user:", error);
                toast.error(error?.response?.data?.message || "Lỗi khi xóa người dùng");
            }
        }
    };

    const handleRestoreUser = async (user) => {
        if (window.confirm(`Bạn có chắc chắn muốn phục hồi người dùng ${user.hoTen}?`)) {
            try {
                const res = await API.post(`/nguoidung/restore/${user.id}`);
                toast.success(res.data.message);

                fetchUsers(currentPage, filterParams);
            } catch (error) {
                console.error("Error restoring user:", error);
                toast.error(error?.response?.data?.message || "Lỗi khi phục hồi người dùng");
            }
        }
    };

    const handleAddUser = () => {
        navigate("/admin/quan-ly-nguoi-dung/them-moi");
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
        navigate(`/admin/quan-ly-nguoi-dung${queryString ? "?" + queryString : ""}`);
    };

    const handleFormSubmit = async (formData) => {
        setFormLoading(true);
        setFormError(null);

        try {
            if (formMode === "create") {
                await API.post(`/nguoidung`, formData);
                toast.success("Thêm người dùng thành công");
            } else if (formMode === "edit") {
                await API.patch(`/nguoidung/${selectedUser.id}`, formData);
                toast.success("Cập nhật người dùng thành công");
            }

            handleFormCancel();
        } catch (error) {
            console.error("Error submitting form:", error);
            setFormError(error?.response?.data?.message || "Có lỗi xảy ra khi xử lý yêu cầu");
        } finally {
            setFormLoading(false);
        }
    };

    const userFilters = [
        {
            name: "vaiTro",
            label: "Vai trò",
            type: "select",
            options: [
                { value: "Admin", label: "Quản trị viên" },
                { value: "Giảng viên", label: "Giảng viên" },
                { value: "Học viên", label: "Học viên" },
            ],
        },
        {
            name: "daKichHoat",
            label: "Trạng thái",
            type: "select",
            options: [
                { value: "true", label: "Đã kích hoạt" },
                { value: "false", label: "Chưa kích hoạt" },
            ],
        },
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
            name: "createdAt",
            label: "Ngày đăng ký",
            type: "dateRange",
            fullWidth: true,
        },
    ];

    const getUserFormFields = () => {
        const baseFormFields = [
            {
                name: "email",
                label: "Email",
                type: "email",
                placeholder: "Nhập email",
                required: true,
                fullWidth: true,
            },
            {
                name: "hoTen",
                label: "Họ Tên",
                type: "text",
                placeholder: "Nhập họ tên",
                required: true,
            },
            {
                name: "vaiTro",
                label: "Vai Trò",
                type: "select",
                required: true,
                options: [
                    { value: "Admin", label: "Quản trị viên" },
                    { value: "Giảng viên", label: "Giảng viên" },
                    { value: "Học viên", label: "Học viên" },
                ],
            },
            {
                name: "daKichHoat",
                label: "Trạng Thái",
                type: "checkbox",
                checkboxLabel: "Đã kích hoạt tài khoản",
            },
            {
                name: "tieuSu",
                label: "Tiểu Sử",
                type: "textarea",
                placeholder: "Nhập tiểu sử",
                fullWidth: true,
            },
            {
                name: "hinhAnh",
                label: "Hình Ảnh",
                type: "image",
                fullWidth: true,
                uploadFunction: uploadFileToCloudinary,
            },
        ];
        if (formMode === "create") {
            baseFormFields.splice(2, 0, {
                name: "matKhau",
                label: "Mật khẩu",
                type: "password",
                placeholder: "Nhập mật khẩu",
                required: true,
            });
        }
        if (formMode === "edit") {
            baseFormFields.splice(4, 0, {
                name: "matKhau",
                label: "Mật khẩu",
                type: "password-button",
                labelButton: "Đặt lại mật khẩu mới",
            });
        }

        if (formMode === "view") {
            baseFormFields.push(
                {
                    name: "createdAt",
                    label: "Ngày tạo",
                    type: "text",
                    disabled: true,
                    render: (date) => formatDate(date),
                },
                {
                    name: "updatedAt",
                    label: "Ngày cập nhật",
                    type: "text",
                    disabled: true,
                    render: (date) => formatDate(date),
                }
            );
            if (selectedUser?.deletedAt) {
                baseFormFields.push({
                    name: "deletedAt",
                    label: "Ngày xóa",
                    type: "text",
                    disabled: true,
                    render: (date) => formatDate(date),
                });
            }
        }

        return baseFormFields;
    };

    const columns = [
        {
            title: "Email",
            dataIndex: "email",
        },
        {
            title: "Họ Tên",
            dataIndex: "hoTen",
        },
        {
            title: "Hình ảnh",
            dataIndex: "hinhAnh",
            sortable: false,
            render: (hinhAnh) => <Avatar src={hinhAnh} />,
        },
        {
            title: "Vai Trò",
            dataIndex: "vaiTro",
        },
        {
            title: "Kích hoạt?",
            dataIndex: "daKichHoat",
            render: (daKichHoat) => (
                <RenderStatus data={daKichHoat} trueValue="Đã kích hoạt" falseValue="Chưa kích hoạt" />
            ),
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

    const getFormTitle = () => {
        switch (formMode) {
            case "view":
                return "Xem Thông Tin Người Dùng";
            case "create":
                return "Thêm Người Dùng Mới";
            case "edit":
                return "Chỉnh Sửa Người Dùng";
            default:
                return "";
        }
    };

    return (
        <div className="flex-1 p-6 flex flex-col h-full overflow-hidden">
            {formMode ? (
                <Form
                    title={getFormTitle()}
                    fields={getUserFormFields()}
                    data={selectedUser}
                    onSubmit={handleFormSubmit}
                    onCancel={handleFormCancel}
                    mode={formMode}
                    loading={formLoading}
                    error={formError}
                />
            ) : (
                <div className="flex flex-col flex-1 overflow-hidden">
                    <div className="flex justify-between items-center mb-6">
                        <h1 className="text-2xl font-semibold">Quản Lý Người Dùng</h1>
                        <button
                            onClick={handleAddUser}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Thêm người dùng
                        </button>
                    </div>

                    <Filter
                        filters={userFilters}
                        onFilter={handleFilter}
                        showSearchBox={true}
                        searchPlaceholder="Tìm kiếm email, họ tên..."
                        compact={true}
                        initialValues={filterParams}
                    />

                    <div className="flex-1 overflow-hidden">
                        <Table
                            columns={columns}
                            data={users}
                            loading={loading}
                            totalItems={totalItems}
                            currentPage={currentPage}
                            pageSize={pageSize}
                            onPageChange={handlePageChange}
                            onView={handleViewUser}
                            onEdit={handleEditUser}
                            onDelete={handleDeleteUser}
                            onRestore={handleRestoreUser}
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

export default User;
