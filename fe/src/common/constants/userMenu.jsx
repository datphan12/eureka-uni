import { User, FileText } from "lucide-react";
const userMenu = [
    {
        name: "Thông tin cá nhân",
        path: "/me",
        icon: <User className="w-5 h-5" />,
    },
    {
        name: "Bài viết của tôi",
        path: "/me/bai-viet",
        icon: <FileText className="w-5 h-5" />,
    },
];

export default userMenu;
