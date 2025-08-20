import React, { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { API, formatDate, formatGiaBan } from "@utils";
import Table from "../Table";
import Form from "../Form";
import Filter from "../Filter";

const Transaction = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();

    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [formMode, setFormMode] = useState(null);
    const [selectedTransaction, setSelectedTransaction] = useState(null);
    const [formError, setFormError] = useState(null);
    const [formLoading, setFormLoading] = useState(false);
    const [filterParams, setFilterParams] = useState({});
    const [sortBy, setSortBy] = useState("createdAt");
    const [sortOrder, setSortOrder] = useState("DESC");
    const pageSize = 10;

    const fetchTransactionById = async (transactionId) => {
        setFormLoading(true);
        try {
            const res = await API.get(`/giao-dich/${transactionId}`);
            setSelectedTransaction(res.data);
        } catch (error) {
            console.error("Error fetching transaction:", error);
            toast.error("Lỗi khi tải thông tin giao dịch");
            navigate("/admin/quan-ly-giao-dich");
        } finally {
            setFormLoading(false);
        }
    };

    const fetchTransactions = async (page = 1, filters = {}, sort = { sortBy: "createdAt", sortOrder: "DESC" }) => {
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

            const response = await API.get(`/giao-dich`, { params });

            setTransactions(response.data.items);
            setTotalItems(response.data.meta.itemCount);
            setCurrentPage(response.data.meta.page);
        } catch (error) {
            console.error("Error fetching transactions:", error);
            toast.error("Lỗi khi tải danh sách giao dịch");
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
            const mode = searchParams.get("mode");
            setFormMode(mode);
            fetchTransactionById(id);
        } else {
            setFormMode(null);
            setSelectedTransaction(null);
        }
    }, [id, searchParams.toString()]);

    useEffect(() => {
        if (!formMode) {
            fetchTransactions(currentPage, filterParams, { sortBy, sortOrder });
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

    const handleViewTransaction = (transaction) => {
        navigate(`/admin/quan-ly-giao-dich/${transaction.id}?mode=view`);
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

    const handleFormCancel = () => {
        const currentParams = new URLSearchParams();
        currentParams.set("page", currentPage.toString());

        Object.keys(filterParams).forEach((key) => {
            if (filterParams[key] && filterParams[key] !== "") {
                currentParams.set(key, filterParams[key]);
            }
        });

        const queryString = currentParams.toString();
        navigate(`/admin/quan-ly-giao-dich${queryString ? "?" + queryString : ""}`);
    };

    const transactionFilters = [
        {
            name: "amount",
            label: "Số tiền giao dịch (VNĐ)",
            type: "range",
            min: 0,
            max: 1000000,
            minPlaceholder: "Từ",
            maxPlaceholder: "Đến",
            fullWidth: true,
        },

        {
            name: "transactionDate",
            label: "Thời gian giao dịch",
            type: "dateRange",
        },
    ];

    const columns = [
        {
            title: "Mã giao dịch",
            dataIndex: "id",
        },
        {
            title: "Số tiền GD",
            dataIndex: "soTien",
            render: (soTien) => `${formatGiaBan(soTien)} VNĐ`,
        },
        {
            title: "Trạng thái",
            dataIndex: "trangThai",
        },
        {
            title: "Thời gian giao dịch",
            dataIndex: "ngayGiaoDich",
            render: (date) => formatDate(date),
        },
        {
            title: "Người giao dịch",
            sortable: false,
            dataIndex: "hoTenNguoiDung",
        },
        {
            title: "Khóa học giao dịch",
            sortable: false,
            dataIndex: "tenKhoaHoc",
        },
    ];

    const getTransactionFormFields = () => {
        const baseFormFields = [
            {
                name: "id",
                label: "Mã giao dịch",
                type: "text",
                fullWidth: true,
            },
            {
                name: "hoTenNguoiDung",
                label: "Họ tên người dùng",
                type: "text",
                fullWidth: true,
            },
            {
                name: "tenKhoaHoc",
                label: "Tên khóa học",
                type: "text",
                fullWidth: true,
            },
            {
                name: "soTien",
                label: "Số tiền giao dịch",
                type: "text",
                render: (soTien) => `${formatGiaBan(soTien)} VNĐ`,
            },
            {
                name: "phuongThucThanhToan",
                label: "Phương thức TT",
                type: "text",
            },
            {
                name: "trangThai",
                label: "Trạng thái",
                type: "text",
            },
            {
                name: "ngayGiaoDich",
                label: "Thời gian giao dịch",
                type: "text",
                fullWidth: true,
                render: (date) => formatDate(date),
            },
        ];
        return baseFormFields;
    };

    const getFormTitle = () => {
        switch (formMode) {
            case "view":
                return "Xem thông tin giao dịch";
            case "create":
                return "Thêm giao dịch mới";
            case "edit":
                return "Chỉnh sửa giao dịch";
            default:
                return "";
        }
    };

    return (
        <div className="flex-1 p-6 flex flex-col h-full overflow-hidden">
            {formMode && selectedTransaction ? (
                <Form
                    title={getFormTitle()}
                    fields={getTransactionFormFields()}
                    data={selectedTransaction}
                    onCancel={handleFormCancel}
                    mode={formMode}
                    loading={formLoading}
                    error={formError}
                />
            ) : (
                <div className="flex flex-col flex-1 overflow-hidden">
                    <div className="flex justify-between items-center mb-6">
                        <h1 className="text-2xl font-semibold">Quản lý giao dịch</h1>
                    </div>

                    <Filter
                        filters={transactionFilters}
                        onFilter={handleFilter}
                        showSearchBox={true}
                        searchPlaceholder="Tìm kiếm giao dịch theo tên người giao dịch, tên khóa học..."
                        compact={true}
                        initialValues={filterParams}
                    />
                    <div className="flex-1 overflow-hidden">
                        <Table
                            columns={columns}
                            data={transactions}
                            loading={loading}
                            totalItems={totalItems}
                            currentPage={currentPage}
                            pageSize={pageSize}
                            onPageChange={handlePageChange}
                            onView={handleViewTransaction}
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

export default Transaction;
