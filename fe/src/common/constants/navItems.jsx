import { Home, UsersRound, FileText } from "lucide-react";

const navItems = [
    {
        icon: <Home size={20} />,
        title: "Home",
        link: "/",
        gradient: "from-blue-500 to-cyan-500",
        description: "Trang chủ và tổng quan",
    },
    {
        icon: <UsersRound size={20} />,
        title: "Nhóm",
        link: "/nhom-hoc-tap",
        gradient: "from-purple-500 to-pink-500",
        description: "Nhóm học tập và cộng tác",
    },
    {
        icon: <FileText size={20} />,
        title: "Bài viết",
        link: "/bai-viet",
        gradient: "from-green-500 to-emerald-500",
        description: "Thảo luận và chia sẻ",
    },
];

export default navItems;
