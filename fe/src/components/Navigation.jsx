import React, { useState } from "react";
import { navItems } from "@constants";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuthStore } from "@store";
import { Menu, X } from "lucide-react";
import { Avatar } from "@components";

const Navigation = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const user = useAuthStore((state) => state.user);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const isHidden = location.pathname.includes("/bai-giang");

    const handleItemClick = (item) => {
        if (item.link === "/nhom-hoc-tap" && !user) {
            navigate("/dang-nhap");
        } else {
            navigate(item.link);
        }
        setIsMobileMenuOpen(false);
    };

    const getItemColor = (index) => {
        const colors = ["from-blue-500 to-cyan-500", "from-purple-500 to-pink-500", "from-green-500 to-emerald-500"];
        return colors[index % colors.length];
    };

    const NavItem = ({ item, index, isActive }) => {
        const gradientColor = getItemColor(index);

        return (
            <li
                className={`group relative cursor-pointer transition-all duration-300 ease-out ${
                    isActive ? "scale-105" : "hover:scale-110"
                }`}
                onClick={() => handleItemClick(item)}
            >
                {/* Mobile/Tablet Layout */}
                <div className="lg:hidden flex flex-col items-center p-3 rounded-2xl transition-all duration-300">
                    <div
                        className={`relative p-3 rounded-xl transition-all duration-300 ${
                            isActive
                                ? `bg-gradient-to-r ${gradientColor} shadow-lg`
                                : "bg-gray-100 group-hover:bg-gray-200"
                        }`}
                    >
                        <div
                            className={`transition-all duration-300 ${
                                isActive ? "text-white" : "text-gray-600 group-hover:text-gray-800"
                            }`}
                        >
                            {item.icon}
                        </div>
                        {isActive && <div className="absolute inset-0 rounded-xl bg-white/20 animate-pulse"></div>}
                    </div>
                    <span
                        className={`mt-2 text-xs font-semibold transition-all duration-300 ${
                            isActive ? "text-gray-800" : "text-gray-600 group-hover:text-gray-800"
                        }`}
                    >
                        {item.title}
                    </span>
                </div>

                {/* Desktop Layout */}
                <div className="hidden lg:flex flex-col items-center p-2 rounded-2xl transition-all duration-300">
                    <div
                        className={`relative p-4 rounded-2xl transition-all duration-500 ${
                            isActive
                                ? `bg-gradient-to-br ${gradientColor} shadow-2xl`
                                : "bg-white/80 backdrop-blur-sm border border-gray-200 group-hover:bg-white group-hover:shadow-lg group-hover:-rotate-1"
                        }`}
                    >
                        <div
                            className={`transition-all duration-300 ${
                                isActive ? "text-white" : "text-gray-600 group-hover:text-gray-800"
                            }`}
                        >
                            {item.icon}
                        </div>
                    </div>
                    <span
                        className={`mt-1 text-sm font-bold transition-all duration-300 ${
                            isActive ? "text-gray-800" : "text-gray-600 group-hover:text-gray-800"
                        }`}
                    >
                        {item.title}
                    </span>
                </div>
            </li>
        );
    };

    if (isHidden) return null;

    return (
        <div className="relative">
            <button
                className="lg:hidden fixed top-8 left-3 z-50 p-3 bg-white rounded-full shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
                {isMobileMenuOpen ? (
                    <X size={20} className="text-gray-600" />
                ) : (
                    <Menu size={20} className="text-gray-600" />
                )}
            </button>

            {/* Navigation */}
            <nav
                className={`
                ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
                fixed lg:sticky top-0 lg:top-20 left-0 z-40 lg:w-[160px] w-64 h-screen lg:h-auto px-4 pt-20 lg:pt-6 pb-6 bg-gradient-to-br from-gray-50 via-white to-gray-100 lg:bg-none shadow-2xl lg:shadow-none transition-transform duration-300 ease-in-out lg:transition-none
            `}
            >
                <ul className="relative flex flex-col gap-4 lg:gap-6 lg:p-4 lg:bg-white/50 lg:backdrop-blur-md lg:rounded-3xl lg:border lg:border-gray-200/50 lg:shadow-xl">
                    {navItems.map((item, index) => {
                        const isActive = location.pathname === item.link;
                        return <NavItem key={index} item={item} index={index} isActive={isActive} />;
                    })}
                </ul>
            </nav>

            {/* Overlay for mobile */}
            {isMobileMenuOpen && (
                <div
                    className="lg:hidden fixed inset-0 bg-black/20 backdrop-blur-sm z-30 transition-opacity duration-300"
                    onClick={() => setIsMobileMenuOpen(false)}
                ></div>
            )}
        </div>
    );
};

export default Navigation;
