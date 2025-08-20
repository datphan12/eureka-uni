import React, { useState } from "react";
import { LayoutDashboard, ChevronDown, LogOut, User, Home, Menu, X } from "lucide-react";
import { adminMenu } from "@constants";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@store";
import { Avatar } from "@components";
import { renderIcon } from "@helpers/renderIcon";
import useClickOutside from "@hooks/useClickOutside";

const AdminSideBar = () => {
    const navigate = useNavigate();
    const [isShow, setIsShow] = useState(true);
    const [showUserOptions, setShowUserOptions] = useState(false);

    const user = useAuthStore((state) => state.user);
    const logout = useAuthStore((state) => state.logout);

    const menuRef = useClickOutside(() => setShowUserOptions(false), showUserOptions);

    const handleClickMenu = (link) => {
        navigate(`/admin/${link}`);
    };

    const isActiveMenuItem = (link) => {
        const currentPath = window.location.pathname;

        if (link === "") {
            return currentPath === "/admin" || currentPath === "/admin/";
        }

        return currentPath.includes(`/admin/${link}`);
    };

    const handleLogout = () => {
        logout();
        navigate("/");
    };

    const userActions = [
        {
            name: "Trang chủ",
            path: "/",
            icon: <Home className="w-4 h-4" />,
        },
        {
            name: "Thông tin cá nhân",
            path: "/me",
            icon: <User className="w-4 h-4" />,
        },
    ];

    return (
        <div
            className={`flex flex-col bg-gradient-to-b from-white to-gray-50 rounded-lg shadow-xl border-r border-gray-200 transition-all duration-300 ${
                isShow ? "min-w-[250px] max-w-[250px]" : "min-w-[80px] max-w-[80px]"
            }`}
        >
            {/* Header Section */}
            <div className="border-b border-gray-200">
                <div
                    onClick={() => setIsShow(!isShow)}
                    className="flex items-center justify-center cursor-pointer group hover:bg-gray-50 p-3 rounded-xl transition-all duration-200"
                >
                    <div
                        className={`p-2 bg-gradient-to-r from-[#49BBBD] to-[#3da5a7] rounded-lg shadow-md group-hover:shadow-lg transition-all duration-200 ${
                            isShow && "mr-3"
                        }`}
                    >
                        <Menu size={24} className="text-white" />
                    </div>
                    <div className={`transition-all duration-400 ${!isShow && "hidden w-0 overflow-hidden"}`}>
                        <h1 className="text-xl font-bold text-gray-800">Dashboard</h1>
                        <p className="text-sm text-gray-500">Quản trị hệ thống</p>
                    </div>
                </div>
            </div>

            {/* Navigation Menu */}
            <div className="flex-1 px-4 py-6 overflow-y-auto">
                <nav>
                    <ul className="space-y-2">
                        {adminMenu.map((item) => {
                            const isActive = isActiveMenuItem(item.link);
                            return (
                                <li key={item.id}>
                                    <button
                                        onClick={() => handleClickMenu(item.link)}
                                        className={`w-full flex items-center gap-3 px-2.5 py-3 rounded-xl font-medium transition-all duration-200 group ${
                                            isActive
                                                ? "bg-gradient-to-r from-[#49BBBD] to-[#3da5a7] text-white shadow-lg shadow-[#49BBBD]/25"
                                                : "text-gray-700 hover:bg-gray-100 hover:text-[#49BBBD]"
                                        }`}
                                    >
                                        <div
                                            className={`p-1 rounded-md transition-all duration-200 ${
                                                isActive ? "text-white" : "text-gray-500 group-hover:text-[#49BBBD]"
                                            }`}
                                        >
                                            {renderIcon(item.icon)}
                                        </div>
                                        <span className={`text-sm font-medium  ${!isShow && "hidden"}`}>
                                            {item.name}
                                        </span>
                                        {isActive && isShow && (
                                            <div className="ml-auto w-2 h-2 bg-white rounded-full"></div>
                                        )}
                                    </button>
                                </li>
                            );
                        })}
                    </ul>
                </nav>
            </div>

            {/* User Profile */}
            <div className="relative border-t border-gray-200 p-2">
                <button
                    onClick={() => setShowUserOptions(!showUserOptions)}
                    className="flex items-center gap-3 w-full px-3 py-2 rounded-full hover:bg-primary/10 transition-all duration-200 group"
                >
                    <Avatar src={user?.hinhAnh} className="w-10 h-10" />
                    <div className={`flex-1 text-left ${!isShow && "hidden"}`}>
                        <p className="text-sm font-medium text-gray-700 truncate max-w-32">{user?.hoTen}</p>
                        {user?.vaiTro && <p className="text-xs text-gray-500">{user.vaiTro}</p>}
                    </div>
                    <ChevronDown
                        className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${
                            showUserOptions ? "rotate-180" : ""
                        } ${!isShow && "hidden"}`}
                    />
                </button>

                {/* Dropdown Menu */}
                {showUserOptions && (
                    <div
                        ref={menuRef}
                        className={`absolute bottom-full left-4 right-4 mb-2 bg-white rounded-xl shadow-lg border border-gray-300 overflow-hidden ${
                            !isShow ? "left-2 right-2" : ""
                        }`}
                    >
                        {/* Menu Items */}
                        <div className="py-2">
                            {userActions.map((item) => (
                                <button
                                    key={item.name}
                                    onClick={() => {
                                        navigate(item.path);
                                        setShowUserOptions(false);
                                    }}
                                    className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 hover:text-[#49BBBD] transition-colors duration-150 group"
                                >
                                    <div className="text-gray-500 group-hover:text-[#49BBBD] transition-colors">
                                        {item.icon}
                                    </div>
                                    <span className={`text-sm font-medium ${!isShow && "hidden"}`}>{item.name}</span>
                                </button>
                            ))}

                            {/* Logout */}
                            <div className="border-t border-gray-100 mt-2 pt-2">
                                <button
                                    onClick={handleLogout}
                                    className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 transition-colors duration-150"
                                >
                                    <LogOut className="w-4 h-4" />
                                    <span className={`text-sm font-medium ${!isShow && "hidden"}`}>Đăng xuất</span>
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminSideBar;
