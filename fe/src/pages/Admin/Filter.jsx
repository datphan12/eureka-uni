import { useState, useEffect } from "react";
import { Search, X, Filter as FilterIcon } from "lucide-react";

const Filter = ({
    filters = [],
    onFilter,
    initialValues = {},
    showSearchBox = true,
    searchPlaceholder = "Tìm kiếm...",
    showResetButton = true,
    compact = false,
}) => {
    const [filterValues, setFilterValues] = useState({});
    const [searchValue, setSearchValue] = useState("");
    const [isFilterVisible, setIsFilterVisible] = useState(!compact);

    useEffect(() => {
        const initialFilterValues = {};
        filters.forEach((filter) => {
            initialFilterValues[filter.name] = initialValues[filter.name] || "";
            if (filter.type === "range") {
                initialFilterValues[`${filter.name}Min`] = initialValues[`${filter.name}Min`] || filter.min || 0;
                initialFilterValues[`${filter.name}Max`] = initialValues[`${filter.name}Max`] || filter.max || 500000;
            }
            if (filter.type === "dateRange") {
                initialFilterValues[`${filter.name}From`] = initialValues[`${filter.name}From`] || "";
                initialFilterValues[`${filter.name}To`] = initialValues[`${filter.name}To`] || "";
            }
        });

        setFilterValues((prev) => {
            const hasChanges = Object.keys(initialFilterValues).some((key) => prev[key] !== initialFilterValues[key]);
            return hasChanges ? initialFilterValues : prev;
        });

        setSearchValue(initialValues.search || "");
    }, [JSON.stringify(initialValues), JSON.stringify(filters)]);

    const handleFilterChange = (filterName, value) => {
        setFilterValues((prev) => ({
            ...prev,
            [filterName]: value,
        }));
    };

    const handleSearchChange = (e) => {
        setSearchValue(e.target.value);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (onFilter) {
            onFilter({
                ...filterValues,
                search: searchValue,
            });
        }
    };

    const handleReset = () => {
        const resetValues = {};
        filters.forEach((filter) => {
            resetValues[filter.name] = "";
            if (filter.type === "range") {
                resetValues[`${filter.name}Min`] = filter.min || 0;
                resetValues[`${filter.name}Max`] = filter.max || 500000;
            }
            if (filter.type === "dateRange") {
                resetValues[`${filter.name}From`] = "";
                resetValues[`${filter.name}To`] = "";
            }
        });
        setFilterValues(resetValues);
        setSearchValue("");
        if (onFilter) {
            onFilter({
                ...resetValues,
                search: "",
            });
        }
    };

    const toggleFilterVisibility = () => {
        setIsFilterVisible(!isFilterVisible);
    };

    const renderFilterControl = (filter) => {
        switch (filter.type) {
            case "select":
                return (
                    <select
                        id={filter.name}
                        name={filter.name}
                        value={filterValues[filter.name] || ""}
                        onChange={(e) => handleFilterChange(filter.name, e.target.value)}
                        className="block w-full rounded-md border border-gray-300 bg-white py-2 px-3 shadow-sm sm:text-sm"
                    >
                        <option value="">{filter.placeholder || "Tất cả"}</option>
                        {filter.options.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                );
            case "date":
                return (
                    <input
                        type="date"
                        id={filter.name}
                        name={filter.name}
                        value={filterValues[filter.name] || ""}
                        onChange={(e) => handleFilterChange(filter.name, e.target.value)}
                        className="block w-full rounded-md border border-gray-300 bg-white py-2 px-3 shadow-sm sm:text-sm"
                    />
                );
            case "dateRange":
                return (
                    <div className="flex space-x-2">
                        <input
                            type="date"
                            id={`${filter.name}From`}
                            name={`${filter.name}From`}
                            value={filterValues[`${filter.name}From`] || ""}
                            onChange={(e) => handleFilterChange(`${filter.name}From`, e.target.value)}
                            className="block w-full rounded-md border border-gray-300 bg-white py-2 px-3 shadow-sm sm:text-sm"
                            placeholder="Từ ngày"
                        />
                        <input
                            type="date"
                            id={`${filter.name}To`}
                            name={`${filter.name}To`}
                            value={filterValues[`${filter.name}To`] || ""}
                            onChange={(e) => handleFilterChange(`${filter.name}To`, e.target.value)}
                            className="block w-full rounded-md border border-gray-300 bg-white py-2 px-3 shadow-sm sm:text-sm"
                            placeholder="Đến ngày"
                        />
                    </div>
                );
            case "range":
                const minVal = Number(filterValues[`${filter.name}Min`] || filter.min || 0);
                const maxVal = Number(filterValues[`${filter.name}Max`] || filter.max || 100000);
                return (
                    <div className="flex items-center space-x-2">
                        <input
                            type="number"
                            id={`${filter.name}Min`}
                            name={`${filter.name}Min`}
                            value={minVal}
                            onChange={(e) => {
                                const newValue = Number(e.target.value);
                                if (newValue <= maxVal) {
                                    handleFilterChange(`${filter.name}Min`, newValue);
                                }
                            }}
                            className="block w-32 rounded-md border border-gray-300 bg-white py-2 px-3 shadow-sm sm:text-sm"
                            placeholder={filter.minPlaceholder || "Min"}
                            min={filter.min || 0}
                            max={maxVal}
                        />
                        <div className="flex-1 px-2">
                            <div className="flex ">
                                <input
                                    type="range"
                                    className="flex-1 h-1 bg-gray-200 rounded appearance-none cursor-pointer"
                                    min={filter.min || 0}
                                    max={filter.max || 100000}
                                    value={minVal}
                                    step={filter.step || 1000}
                                    onChange={(e) => {
                                        const newValue = Number(e.target.value);
                                        if (newValue <= maxVal) {
                                            handleFilterChange(`${filter.name}Min`, newValue);
                                        }
                                    }}
                                />
                                <input
                                    type="range"
                                    className="flex-1 bg-gray-200 h-1 rounded appearance-none cursor-pointer"
                                    min={filter.min || 0}
                                    max={filter.max || 100000}
                                    value={maxVal}
                                    step={filter.step || 1000}
                                    onChange={(e) => {
                                        const newValue = Number(e.target.value);
                                        if (newValue >= minVal) {
                                            handleFilterChange(`${filter.name}Max`, newValue);
                                        }
                                    }}
                                />
                            </div>
                        </div>
                        <input
                            type="number"
                            id={`${filter.name}Max`}
                            name={`${filter.name}Max`}
                            value={maxVal}
                            onChange={(e) => {
                                const newValue = Number(e.target.value);
                                if (newValue >= minVal) {
                                    handleFilterChange(`${filter.name}Max`, newValue);
                                }
                            }}
                            className="block w-32 rounded-md border border-gray-300 bg-white py-2 px-3 shadow-sm sm:text-sm"
                            placeholder={filter.maxPlaceholder || "Max"}
                            min={minVal}
                            max={filter.max || 100000}
                        />
                    </div>
                );
            case "radio":
                return (
                    <div className="flex space-x-4">
                        {filter.options.map((option) => (
                            <label key={option.value} className="inline-flex items-center">
                                <input
                                    type="radio"
                                    name={filter.name}
                                    value={option.value}
                                    checked={filterValues[filter.name] === option.value}
                                    onChange={(e) => handleFilterChange(filter.name, e.target.value)}
                                    className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500"
                                />
                                <span className="ml-2 text-sm text-gray-700">{option.label}</span>
                            </label>
                        ))}
                    </div>
                );
            case "checkbox":
                return (
                    <div className="flex flex-wrap gap-4">
                        {filter.options.map((option) => (
                            <label key={option.value} className="inline-flex items-center">
                                <input
                                    type="checkbox"
                                    name={filter.name}
                                    value={option.value}
                                    checked={(filterValues[filter.name] || []).includes(option.value)}
                                    onChange={(e) => {
                                        const currentValues = filterValues[filter.name] || [];
                                        let newValues;
                                        if (e.target.checked) {
                                            newValues = [...currentValues, option.value];
                                        } else {
                                            newValues = currentValues.filter((val) => val !== option.value);
                                        }
                                        handleFilterChange(filter.name, newValues);
                                    }}
                                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                />
                                <span className="ml-2 text-sm text-gray-700">{option.label}</span>
                            </label>
                        ))}
                    </div>
                );
            case "custom":
                return filter.render({
                    value: filterValues[filter.name] || "",
                    onChange: (value) => handleFilterChange(filter.name, value),
                });
            default:
                return (
                    <input
                        type="text"
                        id={filter.name}
                        name={filter.name}
                        value={filterValues[filter.name] || ""}
                        onChange={(e) => handleFilterChange(filter.name, e.target.value)}
                        placeholder={filter.placeholder || ""}
                        className="block w-full rounded-md border border-gray-300 bg-white py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                    />
                );
        }
    };

    return (
        <div className="mb-4 p-4 rounded-lg border border-gray-300 shadow">
            <form onSubmit={handleSubmit}>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
                    {compact && (
                        <button
                            type="button"
                            onClick={toggleFilterVisibility}
                            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                        >
                            <FilterIcon size={16} className="mr-2" />
                            {isFilterVisible ? "Ẩn bộ lọc" : "Hiển thị bộ lọc"}
                        </button>
                    )}
                    {showSearchBox && (
                        <div className="relative flex-1 w-full md:w-64">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Search size={18} className="text-gray-400" />
                            </div>
                            <input
                                type="text"
                                value={searchValue}
                                onChange={handleSearchChange}
                                placeholder={searchPlaceholder}
                                className="block w-full pl-10 pr-3 py-2 border border-gray-400 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            />
                        </div>
                    )}
                    <div className="flex space-x-2">
                        <button
                            type="submit"
                            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none"
                        >
                            Lọc
                        </button>
                        {showResetButton && (
                            <button
                                type="button"
                                onClick={handleReset}
                                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none "
                            >
                                <X size={16} className="mr-2" />
                                Đặt lại
                            </button>
                        )}
                    </div>
                </div>

                {isFilterVisible && filters.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-4">
                        {filters.map((filter) => (
                            <div key={filter.name} className={filter.fullWidth ? "col-span-full" : ""}>
                                <label htmlFor={filter.name} className="block text-sm font-medium text-gray-700 mb-1">
                                    {filter.label}
                                </label>
                                {renderFilterControl(filter)}
                            </div>
                        ))}
                    </div>
                )}
            </form>
        </div>
    );
};

export default Filter;
