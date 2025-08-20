import { Avatar } from "@components";

const Header = ({ user }) => {
    return (
        <div className="bg-gradient-to-r from-sky-500 via-teal-500 to-blue-500 text-white rounded-xl">
            <div className="container mx-auto px-6 py-16">
                <div className="text-center">
                    <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-100">
                        Chào mừng đến với Eureka Uni!
                    </h1>
                    <p className="text-xl opacity-90 max-w-2xl mx-auto">
                        Học tập thông minh, kết nối hiệu quả, chia sẽ tri thức!
                    </p>
                    {user && (
                        <div className="mt-6 inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-6 py-3">
                            <Avatar src={user.hinhAnh} className="border-none" />
                            <span className="font-medium">Xin chào, {user.hoTen}!</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Header;
