const OPTIONS = ["Tất cả", "giải tích", "đại số tuyến tính", "xác suất thống kê", "kinh tế lượng"];

const FilterOptions = ({ selectedText, onClick }) => {
    return (
        <div className="overflow-x-scroll no-scrollbar sm:max-w-full scroll-smooth">
            <div className="flex gap-x-1.5 sm:gap-x-4 py-2 w-full">
                {OPTIONS.map((option, index) => (
                    <button
                        key={index}
                        onClick={() => onClick(option)}
                        className={`text-sm border border-gray-300 px-2 sm:px-4 py-2 rounded-3xl shrink-0 hover:bg-blue-500 hover:text-white cursor-pointer ${
                            selectedText === option ? "bg-blue-500 text-white" : ""
                        }`}
                    >
                        {option}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default FilterOptions;
