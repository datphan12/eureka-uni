import { useMemo } from "react";
import { User, FileText, Shield, BookOpen } from "lucide-react";

const baseMenuItems = [
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

const useUserMenu = (userRole) => {
    return useMemo(() => {
        const menuItems = [...baseMenuItems];

        if (userRole === "Admin") {
            menuItems.push(
                {
                    name: "Khóa học của tôi",
                    path: "/me/khoa-hoc",
                    icon: <BookOpen className="w-5 h-5" />,
                },
                {
                    name: "Trang quản trị",
                    path: "/admin",
                    icon: <Shield className="w-5 h-5" />,
                }
            );
        }

        if (userRole === "Giảng viên") {
            menuItems.push({
                name: "Khóa học của tôi",
                path: "/me/khoa-hoc",
                icon: <BookOpen className="w-5 h-5" />,
            });
        }

        return menuItems;
    }, [userRole]);
};

export default useUserMenu;
