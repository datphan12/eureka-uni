import { useState, useEffect } from "react";
import {
    Eye,
    Edit,
    Trash2,
    ChevronLeft,
    ChevronRight,
    ArchiveRestore,
    ArrowDownUp,
    ArrowUpNarrowWide,
    ArrowDownWideNarrow,
} from "lucide-react";

const Table = ({
    columns = [],
    data = [],
    totalItems = 0,
    currentPage = 1,
    pageSize = 10,
    loading = false,
    onPageChange,
    onView,
    onEdit,
    onDelete,
    onRestore,
    customRowActions,
    sortBy,
    sortOrder,
    onSort,
}) => {
    const [page, setPage] = useState(currentPage);
    const totalPages = Math.ceil(totalItems / pageSize);

    useEffect(() => {
        setPage(currentPage);
    }, [currentPage]);

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setPage(newPage);
            if (onPageChange) {
                onPageChange(newPage);
            }
        }
    };

    const calculateIndex = (rowIndex) => {
        return (page - 1) * pageSize + rowIndex + 1;
    };

    const handleSort = (columnKey) => {
        if (onSort) {
            const newSortOrder = sortBy === columnKey && sortOrder === "ASC" ? "DESC" : "ASC";
            onSort(columnKey, newSortOrder);
        }
    };

    const getSortIcon = (columnKey) => {
        if (sortBy !== columnKey) return null;
        return sortOrder === "ASC" ? <ArrowUpNarrowWide size={16} /> : <ArrowDownWideNarrow size={16} />;
    };

    return (
        <div className="flex flex-col h-full bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div className="flex-1 overflow-y-auto">
                <table className="min-w-full">
                    {/* Table Header */}
                    <thead className="bg-[#daf3f3] sticky top-0 z-10">
                        <tr>
                            <th className="px-3 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                                STT
                            </th>
                            {columns.map((column, index) => (
                                <th
                                    key={index}
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                    onClick={() => column.sortable !== false && handleSort(column.dataIndex)}
                                >
                                    <div className="flex items-center space-x-1 text-gray-600 cursor-pointer">
                                        <span>{column.title}</span>
                                        {column.sortable !== false && (
                                            <span className="text-gray-500">
                                                {getSortIcon(column.dataIndex) || <ArrowDownUp size={16} />}
                                            </span>
                                        )}
                                    </div>
                                </th>
                            ))}
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-600 uppercase tracking-wider">
                                Hành động
                            </th>
                        </tr>
                    </thead>

                    {/* Table Body */}
                    <tbody className="bg-white">
                        {loading ? (
                            <tr>
                                <td
                                    colSpan={columns.length + 2}
                                    className="px-6 py-4 text-center text-sm text-gray-500"
                                >
                                    Đang tải dữ liệu...
                                </td>
                            </tr>
                        ) : data.length === 0 ? (
                            <tr>
                                <td
                                    colSpan={columns.length + 2}
                                    className="px-6 py-4 text-center text-sm text-gray-500"
                                >
                                    Không có dữ liệu
                                </td>
                            </tr>
                        ) : (
                            data.map((row, rowIndex) => (
                                <tr key={rowIndex} className="hover:bg-primary/5">
                                    <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {calculateIndex(rowIndex)}
                                    </td>

                                    {columns.map((column, colIndex) => (
                                        <td
                                            key={colIndex}
                                            className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 truncate max-w-[250px]"
                                            title={row[column.dataIndex]}
                                        >
                                            {column.render
                                                ? column.render(row[column.dataIndex], row)
                                                : row[column.dataIndex]}
                                        </td>
                                    ))}

                                    {/* Actions */}
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <div
                                            className="flex justify-end space-x-2"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            {onView && (
                                                <button
                                                    onClick={() => onView(row)}
                                                    className="text-blue-600 hover:text-blue-900 cursor-pointer"
                                                    title="Xem"
                                                >
                                                    <Eye size={18} />
                                                </button>
                                            )}
                                            {onEdit && (
                                                <button
                                                    onClick={() => onEdit(row)}
                                                    className="text-yellow-600 hover:text-yellow-900 cursor-pointer"
                                                    title="Sửa"
                                                >
                                                    <Edit size={18} />
                                                </button>
                                            )}
                                            {onDelete && (
                                                <button
                                                    onClick={() => onDelete(row)}
                                                    className="text-red-600 hover:text-red-900 cursor-pointer"
                                                    title="Xóa"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            )}
                                            {row.deletedAt && onRestore && (
                                                <button
                                                    onClick={() => onRestore(row)}
                                                    title="Khôi phục"
                                                    className="text-green-600 hover:text-green-900 cursor-pointer"
                                                >
                                                    <ArchiveRestore size={18} />
                                                </button>
                                            )}
                                            {customRowActions && customRowActions(row)}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            <div className="bg-[#daf3f3] px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6 shrink-0">
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                    <div>
                        <p className="text-sm text-gray-700">
                            Hiển thị <span className="font-medium">{(page - 1) * pageSize + 1}</span> đến{" "}
                            <span className="font-medium">{Math.min(page * pageSize, totalItems)}</span> của{" "}
                            <span className="font-medium">{totalItems}</span> kết quả
                        </p>
                    </div>
                    <div>
                        <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                            <button
                                onClick={() => handlePageChange(page - 1)}
                                disabled={page <= 1}
                                className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${
                                    page <= 1 ? "text-gray-600 cursor-not-allowed" : "text-gray-500 hover:bg-gray-50"
                                }`}
                            >
                                <span className="sr-only">Trang trước</span>
                                <ChevronLeft className="h-5 w-5" />
                            </button>

                            {[...Array(Math.min(5, totalPages))].map((_, i) => {
                                let pageNum;
                                if (totalPages <= 5) {
                                    pageNum = i + 1;
                                } else if (page <= 3) {
                                    pageNum = i + 1;
                                } else if (page >= totalPages - 2) {
                                    pageNum = totalPages - 4 + i;
                                } else {
                                    pageNum = page - 2 + i;
                                }

                                return pageNum > 0 && pageNum <= totalPages ? (
                                    <button
                                        key={pageNum}
                                        onClick={() => handlePageChange(pageNum)}
                                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                                            page === pageNum
                                                ? "z-10 bg-blue-50 border-blue-500 text-blue-600"
                                                : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                                        }`}
                                    >
                                        {pageNum}
                                    </button>
                                ) : null;
                            })}

                            <button
                                onClick={() => handlePageChange(page + 1)}
                                disabled={page >= totalPages}
                                className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${
                                    page >= totalPages
                                        ? "text-gray-600 cursor-not-allowed"
                                        : "text-gray-500 hover:bg-gray-50"
                                }`}
                            >
                                <span className="sr-only">Trang sau</span>
                                <ChevronRight className="h-5 w-5" />
                            </button>
                        </nav>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Table;
