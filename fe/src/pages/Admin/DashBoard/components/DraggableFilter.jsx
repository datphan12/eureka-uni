import React, { useState, useRef, useEffect } from "react";
import { Filter, X, RotateCcw } from "lucide-react";

const DraggableFilter = ({ month, year, onMonthChange, onYearChange, onReset }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [position, setPosition] = useState({ x: window.offsetWidth, y: window.offsetHeight });
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
    const [hasDragged, setHasDragged] = useState(false);
    const filterRef = useRef(null);

    const monthOptions = [
        { value: "", label: "Tất cả" },
        ...Array.from({ length: 12 }, (_, i) => ({ value: i + 1, label: `Tháng ${i + 1}` })),
    ];

    const currentYear = 2025;
    const yearOptions = Array.from({ length: currentYear - 2022 }, (_, i) => currentYear - i);

    const getDashboardBounds = () => {
        const dashboard = document.querySelector("section.dashboard");
        if (dashboard) {
            const rect = dashboard.getBoundingClientRect();
            return {
                left: rect.left,
                top: rect.top,
                right: rect.right,
                bottom: rect.bottom,
            };
        }
        return null;
    };

    const handleMouseDown = (e) => {
        if (e.target.closest(".filter-controls") || e.target.closest(".refresh-control")) return;

        setIsDragging(true);
        setHasDragged(false);
        const rect = filterRef.current.getBoundingClientRect();
        setDragOffset({
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
        });
    };

    const handleMouseMove = (e) => {
        if (!isDragging) return;

        setHasDragged(true);

        const dashboardBounds = getDashboardBounds();
        if (!dashboardBounds) return;

        const filterWidth = filterRef.current.offsetWidth;
        const filterHeight = filterRef.current.offsetHeight;

        const minX = dashboardBounds.left;
        const maxX = dashboardBounds.right - filterWidth;
        const minY = dashboardBounds.top;
        const maxY = dashboardBounds.bottom - filterHeight;

        let newX = e.clientX - dragOffset.x;
        let newY = e.clientY - dragOffset.y;

        newX = Math.max(minX, Math.min(maxX, newX));
        newY = Math.max(minY, Math.min(maxY, newY));

        setPosition({
            x: newX,
            y: newY,
        });
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    useEffect(() => {
        if (isDragging) {
            document.addEventListener("mousemove", handleMouseMove);
            document.addEventListener("mouseup", handleMouseUp);
            return () => {
                document.removeEventListener("mousemove", handleMouseMove);
                document.removeEventListener("mouseup", handleMouseUp);
            };
        }
    }, [isDragging, dragOffset]);

    const toggleFilter = () => {
        if (!hasDragged) {
            setIsOpen(!isOpen);
        }
    };

    const handleReset = () => {
        onReset();
    };

    return (
        <div
            ref={filterRef}
            className={`fixed z-50 ${isDragging ? "cursor-grabbing" : "cursor-grab"} select-none`}
            style={{
                left: `${position.x}px`,
                top: `${position.y}px`,
            }}
            onMouseDown={handleMouseDown}
        >
            {!isOpen ? (
                <div className="bg-blue-500 border border-gray-300 rounded-full p-4 shadow-lg" onClick={toggleFilter}>
                    <Filter size={26} className="text-white font-medium" />
                </div>
            ) : (
                <div className="bg-gray-100 border border-gray-300 rounded-lg shadow-xl p-4">
                    <div className="flex items-center justify-between mb-4">
                        <div
                            onClick={handleReset}
                            className="refresh-control flex items-center gap-2 bg-white px-2 border border-gray-300 rounded-md py-1 cursor-pointer hover:bg-gray-50"
                        >
                            <RotateCcw size={16} className="text-gray-600" />
                            <h3 className="font-medium text-gray-800">Làm mới</h3>
                        </div>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="p-1 hover:bg-gray-300 rounded cursor-pointer"
                        >
                            <X size={16} />
                        </button>
                    </div>

                    <div className="filter-controls space-y-3">
                        <div className="flex items-center gap-3">
                            <label htmlFor="year-select" className="text-sm font-medium min-w-12">
                                Năm
                            </label>
                            <select
                                name="year-select"
                                id="year-select"
                                value={year}
                                onChange={(e) => onYearChange(parseInt(e.target.value))}
                                className="flex-1 px-2 py-1 border border-gray-300 rounded-md outline-none bg-white"
                            >
                                {yearOptions.map((yearOption) => (
                                    <option key={yearOption} value={yearOption}>
                                        {yearOption}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="flex items-center gap-3">
                            <label htmlFor="month-select" className="text-sm font-medium min-w-12">
                                Tháng
                            </label>
                            <select
                                name="month-select"
                                id="month-select"
                                value={month || ""}
                                onChange={(e) => onMonthChange(e.target.value ? parseInt(e.target.value) : null)}
                                className="flex-1 px-2 py-1 border border-gray-300 rounded-md outline-none bg-white"
                            >
                                {monthOptions.map((monthOption) => (
                                    <option key={monthOption.value} value={monthOption.value}>
                                        {monthOption.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DraggableFilter;
