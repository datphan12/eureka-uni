const EmptyState = ({ title, description, icon }) => {
    return (
        <div className="text-center py-16 px-6">
            <div className="text-6xl mb-4 opacity-30">{icon}</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">{title}</h3>
            <p className="text-gray-500 max-w-md mx-auto">{description}</p>
        </div>
    );
};

export default EmptyState;
