import { Title } from "@components";

const SectionHeader = ({ icon, title, badgeText, badgeColor = "blue" }) => {
    const badgeColors = {
        green: "bg-green-100 text-green-800",
        purple: "bg-purple-100 text-purple-800",
        blue: "bg-blue-100 text-blue-800",
    };

    const iconColors = {
        green: "from-green-500 to-emerald-500",
        purple: "from-purple-500 to-pink-500",
        blue: "from-blue-500 to-indigo-500",
    };

    return (
        <div className="flex items-center gap-3 mb-8">
            <div
                className={`w-8 h-8 bg-gradient-to-r ${iconColors[badgeColor]} rounded-lg flex items-center justify-center`}
            >
                {icon}
            </div>
            <Title value={title} className="text-2xl font-bold text-gray-800" />
            <span className={`${badgeColors[badgeColor]} text-sm font-medium px-3 py-1 rounded-full`}>{badgeText}</span>
        </div>
    );
};

export default SectionHeader;
