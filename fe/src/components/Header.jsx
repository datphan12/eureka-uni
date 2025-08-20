import { useMemo, useState } from "react";
import { logo_eureka_uni } from "@assets";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "@store";
import SearchBox from "./SearchBox";
import { Avatar } from "@components";
import useClickOutside from "@hooks/useClickOutside";
import useUserMenu from "@hooks/useUserMenu";
import { ChevronDown, LogOut, Shield } from "lucide-react";

const Header = () => {
    const navigate = useNavigate();
    const user = useAuthStore((state) => state.user);
    const logout = useAuthStore((state) => state.logout);
    const [showMenu, setShowMenu] = useState(false);
    const menuRef = useClickOutside(() => setShowMenu(false), showMenu);

    const actions = useUserMenu(user?.vaiTro);

    const handleLogout = () => {
        logout();
        navigate("/");
    };

    return (
        <header
            className={`sticky top-0 bg-white/90 backdrop-blur-3xl z-50 border-b border-gray-200 shadow-sm ${
                window.location.pathname.includes("/bai-giang") ? "hidden" : ""
            }`}
        >
            <div className="max-w-7xl mx-auto flex justify-between items-center px-4 md:px-6 py-3">
                <div>
                    <img
                        src={logo_eureka_uni}
                        alt="logo"
                        className="h-10 w-auto cursor-pointer transition-transform hover:scale-105"
                        onClick={() => navigate("/")}
                    />
                </div>

                {/* Search */}
                <div className="flex-1 max-w-2xl mx-2">
                    <SearchBox />
                </div>

                {/* user menu */}
                {user ? (
                    <div className="relative">
                        <button
                            onClick={() => setShowMenu(!showMenu)}
                            className="flex items-center gap-3 px-3 py-2 rounded-full hover:bg-primary/10 transition-all duration-200 group"
                        >
                            <Avatar src={user.hinhAnh} className="w-8 h-8" />
                            <div className="hidden md:block text-left">
                                <p className="text-sm font-medium text-gray-700 truncate max-w-32">{user.hoTen}</p>
                                {user.vaiTro && <p className="text-xs text-gray-500">{user.vaiTro}</p>}
                            </div>
                            <ChevronDown
                                className={`w-4 h-4 hidden md:block text-gray-500 transition-transform duration-200 ${
                                    showMenu ? "rotate-180" : ""
                                }`}
                            />
                        </button>

                        {showMenu && (
                            <div
                                ref={menuRef}
                                className="absolute top-full right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-gray-300 overflow-hidden"
                            >
                                {/* Menu Items */}
                                <div className="py-2">
                                    {actions.map((item, index) => (
                                        <Link
                                            key={item.name}
                                            to={item.path}
                                            onClick={() => setShowMenu(false)}
                                            className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 hover:text-[#49BBBD] transition-colors duration-150 group"
                                        >
                                            <div className="w-5 h-5 text-gray-500 group-hover:text-[#49BBBD] transition-colors">
                                                {item.icon}
                                            </div>
                                            <span className="text-sm font-medium">{item.name}</span>
                                        </Link>
                                    ))}

                                    {/* Logout */}
                                    <div className="border-t border-gray-100 mt-2 pt-2">
                                        <button
                                            onClick={handleLogout}
                                            className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 transition-colors duration-150"
                                        >
                                            <LogOut className="w-5 h-5" />
                                            <span className="text-sm font-medium">Đăng xuất</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => navigate("/dang-ky")}
                            className="hidden sm:block px-6 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors duration-200"
                        >
                            Đăng ký
                        </button>
                        <button
                            onClick={() => navigate("/dang-nhap")}
                            className="px-6 py-2 bg-gradient-to-r from-[#49BBBD] to-[#3da5a7] text-white font-medium rounded-full hover:shadow-lg hover:shadow-[#49BBBD]/25 transform hover:scale-105 transition-all duration-200"
                        >
                            Đăng nhập
                        </button>
                    </div>
                )}
            </div>
        </header>
    );
};

export default Header;
