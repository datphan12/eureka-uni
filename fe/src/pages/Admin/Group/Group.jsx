import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { formatDate, API } from "@utils";
import Form from "../Form";
import Filter from "../Filter";
import Table from "../Table";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";

const Group = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();

    const [groups, setGroups] = useState([]);
    const [userOptions, setUserOptions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [formMode, setFormMode] = useState(null);
    const [selectedGroup, setSelectedGroup] = useState(null);
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

    const fetchGroupById = async (groupId) => {
        setFormLoading(true);
        try {
            const res = await API.get(`/nhom-hoc-tap/${groupId}`);
            setSelectedGroup(res.data);
        } catch (error) {
            console.error("Error fetching group:", error);
            toast.error("Lỗi khi tải thông tin nhóm");
            navigate("/admin/quan-ly-nhom");
        } finally {
            setFormLoading(false);
        }
    };

    const fetchGroups = async (page = 1, filters = {}, sort = { sortBy: "createdAt", sortOrder: "DESC" }) => {
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

            const response = await API.get(`/nhom-hoc-tap`, { params });

            setGroups(response.data.items);
            setTotalItems(response.data.meta.itemCount);
            setCurrentPage(response.data.meta.page);
        } catch (error) {
            console.error("Error fetching groups:", error);
            toast.error("Lỗi khi tải danh sách nhóm người dùng");
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
                setSelectedGroup(null);
                fetchUsers();
            } else {
                const mode = searchParams.get("mode");
                setFormMode(mode);
                fetchGroupById(id);
                fetchUsers();
            }
        } else {
            setFormMode(null);
            setSelectedGroup(null);
        }
    }, [id, searchParams.toString()]);

    useEffect(() => {
        if (!formMode) {
            fetchGroups(currentPage, filterParams, { sortBy, sortOrder });
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

    const handleViewGroup = (group) => {
        setFormError(null);
        navigate(`/admin/quan-ly-nhom/${group.id}?mode=view`);
    };

    const handleEditGroup = (group) => {
        setFormError(null);
        navigate(`/admin/quan-ly-nhom/${group.id}?mode=edit`);
    };

    const handleDeleteGroup = async (group) => {
        if (window.confirm(`Bạn có chắc chắn muốn xóa nhóm ${group.tenNhom}?`)) {
            try {
                const res = await API.delete(`/nhom-hoc-tap/${group.id}`);
                toast.success(res.data.message);
                fetchGroups(currentPage, filterParams);
            } catch (error) {
                console.error("Error deleting group:", error);
                toast.error(error?.response?.data?.message || "Lỗi khi xóa khóa học");
            }
        }
    };

    const handleAddGroup = () => {
        navigate("/admin/quan-ly-nhom/them-moi");
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
        navigate(`/admin/quan-ly-nhom${queryString ? "?" + queryString : ""}`);
    };

    const handleFormSubmit = async (formData) => {
        setFormLoading(true);
        setFormError(null);

        try {
            if (formMode === "create") {
                await API.post(`/nhom-hoc-tap`, formData);
                toast.success("Thêm nhóm thành công");
            } else if (formMode === "edit") {
                await API.patch(`/nhom-hoc-tap/${selectedGroup.id}`, formData);
                toast.success("Cập nhật nhóm thành công");
            }

            handleFormCancel();
        } catch (error) {
            console.error("Error submitting form:", error);
            setFormError(error?.response?.data?.message || "Có lỗi xảy ra khi xử lý yêu cầu");
        } finally {
            setFormLoading(false);
        }
    };

    const groupFilters = [
        {
            name: "loaiNhom",
            label: "Loại nhóm",
            type: "select",
            options: [
                { value: "Cá nhân", label: "Cá nhân" },
                { value: "Cộng đồng", label: "Cộng đồng" },
            ],
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
            title: "Tên nhóm",
            dataIndex: "tenNhom",
        },
        {
            title: "Loại nhóm",
            dataIndex: "loaiNhom",
        },
        {
            title: "Giới hạn TV",
            dataIndex: "gioiHanThanhVien",
        },
        {
            title: "Ngày tạo",
            dataIndex: "createdAt",
            render: (date) => formatDate(date),
        },
    ];

    const getGroupFormFields = () => {
        const baseFormFields = [
            {
                name: "tenNhom",
                label: "Tên nhóm",
                type: "text",
                placeholder: "Nhập tên nhóm",
                required: true,
                fullWidth: true,
            },
            {
                name: "loaiNhom",
                label: "Loại nhóm",
                type: "select",
                required: true,
                options: [
                    { value: "Cá nhân", label: "Cá nhân" },
                    { value: "Cộng đồng", label: "Cộng đồng" },
                ],
            },
            {
                name: "gioiHanThanhVien",
                label: "Giới hạn thành viên",
                type: "number",
                placeholder: "Nhập giới hạn thành viên",
            },
            {
                name: "maNguoiDung",
                label: "Người tạo",
                type: "select",
                options: userOptions,
                disabled: formMode === "edit" || formMode === "view",
                required: true,
            },
        ];

        if (formMode === "view") {
            baseFormFields.push({
                name: "thanhVienNhom",
                label: "Danh sách thành viên",
                type: "member-list",
                fullWidth: true,
            });
            baseFormFields.push({
                name: "createdAt",
                label: "Ngày tạo",
                type: "text",
                disabled: true,
                render: (date) => formatDate(date),
            });
            baseFormFields.push({
                name: "deletedAt",
                label: "Ngày xóa",
                type: "text",
                disabled: true,
                render: (date) => formatDate(date),
            });
        }

        if (formMode === "edit") {
            baseFormFields.push({
                name: "thanhVienNhom",
                label: "Danh sách thành viên",
                type: "member-list",
                fullWidth: true,
            });
        }

        return baseFormFields;
    };

    const getFormTitle = () => {
        switch (formMode) {
            case "view":
                return "Xem thông tin nhóm học tập";
            case "create":
                return "Thêm nhóm học tập mới";
            case "edit":
                return "Chỉnh sửa nhóm học tập";
            default:
                return "";
        }
    };

    return (
        <div className="flex-1 p-6 flex flex-col h-full overflow-hidden">
            {formMode ? (
                <Form
                    title={getFormTitle()}
                    fields={getGroupFormFields()}
                    data={selectedGroup}
                    onSubmit={handleFormSubmit}
                    onCancel={handleFormCancel}
                    mode={formMode}
                    loading={formLoading}
                    error={formError}
                />
            ) : (
                <div className="flex flex-col flex-1 overflow-hidden">
                    <div className="flex justify-between items-center mb-6">
                        <h1 className="text-2xl font-semibold">Quản lý nhóm học tập</h1>
                        <button
                            onClick={handleAddGroup}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Thêm nhóm
                        </button>
                    </div>

                    <Filter
                        filters={groupFilters}
                        onFilter={handleFilter}
                        showSearchBox={true}
                        searchPlaceholder="Tìm kiếm theo tên nhóm..."
                        compact={true}
                        initialValues={filterParams}
                    />
                    <div className="flex-1 overflow-hidden">
                        <Table
                            columns={columns}
                            data={groups}
                            loading={loading}
                            totalItems={totalItems}
                            currentPage={currentPage}
                            pageSize={pageSize}
                            onPageChange={handlePageChange}
                            onView={handleViewGroup}
                            onEdit={handleEditGroup}
                            onDelete={handleDeleteGroup}
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

export default Group;
