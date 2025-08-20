const LoadingSkeleton = ({ count = 8 }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(count)].map((_, i) => (
                <div key={i} className="bg-gray-200 animate-pulse rounded-xl h-64 shadow-md"></div>
            ))}
        </div>
    );
};

export default LoadingSkeleton;
