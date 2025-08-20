const SectionNav = ({
    activeSection,
    setActiveSection,
    hasRegisteredCourses,
    hasRecommendedCourses,
    registeredCount,
    recommendedCount,
    totalCount,
}) => {
    return (
        <div className="flex flex-wrap gap-2 mb-8 p-1 bg-gray-100 rounded-lg">
            {hasRegisteredCourses && (
                <button
                    onClick={() => setActiveSection("registered")}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                        activeSection === "registered"
                            ? "bg-white text-blue-600 shadow-sm"
                            : "text-gray-600 hover:text-gray-800"
                    }`}
                >
                    Đã đăng ký ({registeredCount})
                </button>
            )}
            {hasRecommendedCourses && (
                <button
                    onClick={() => setActiveSection("recommended")}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                        activeSection === "recommended"
                            ? "bg-white text-blue-600 shadow-sm"
                            : "text-gray-600 hover:text-gray-800"
                    }`}
                >
                    Đề xuất ({recommendedCount})
                </button>
            )}
            <button
                onClick={() => setActiveSection("all")}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                    activeSection === "all" ? "bg-white text-blue-600 shadow-sm" : "text-gray-600 hover:text-gray-800"
                }`}
            >
                Tất cả ({totalCount})
            </button>
        </div>
    );
};

export default SectionNav;
