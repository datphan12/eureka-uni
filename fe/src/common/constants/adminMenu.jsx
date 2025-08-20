import { LayoutDashboard, Users, BookOpen, UsersRound, FileText, CreditCard } from "lucide-react";
const adminMenu = [
    {
        id: 0,
        name: "DashBoard",
        icon: <LayoutDashboard size={20} />,
        link: "",
    },
    {
        id: 1,
        name: "Người dùng",
        icon: <Users size={20} />,
        link: "quan-ly-nguoi-dung",
    },
    {
        id: 2,
        name: "Khóa học",
        icon: <BookOpen size={20} />,
        link: "quan-ly-khoa-hoc",
    },
    {
        id: 3,
        name: "Nhóm học tập",
        icon: <UsersRound size={20} />,
        link: "quan-ly-nhom",
    },
    {
        id: 4,
        name: "Bài đăng",
        icon: <FileText size={20} />,
        link: "quan-ly-bai-dang",
    },
    {
        id: 5,
        name: "Giao dịch",
        icon: <CreditCard size={20} />,
        link: "quan-ly-giao-dich",
    },
];

export default adminMenu;
