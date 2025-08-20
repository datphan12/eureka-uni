import React, { useState } from "react";
import { avatar, google_icon, facebook_icon } from "@assets";
import { ReturnButton, Loading } from "@components";
import { useAuthStore } from "@store";
import ChangePasswordModal from "./components/ChangePasswordModal";
import { toast } from "react-toastify";
import { API, uploadFileToCloudinary } from "@utils";
import ForgotPasswordModal from "../Auth/components/ForgotPasswordModal";
import { Camera, User, Shield, Link2, ExternalLink, Save, Key } from "lucide-react";

const Me = () => {
    const user = useAuthStore((state) => state.user);
    const setUser = useAuthStore((state) => state.setUser);
    const [personal, setPersonal] = useState({ hoTen: user.hoTen, tieuSu: user.tieuSu, updating: false });
    const [socialStatus, setSocialStatus] = useState({ google: user.googleId, facebook: user.facebookId });
    const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
    const [showResetPasswordModal, setShowResetPasswordModal] = useState(false);
    const [changingPassword, setChangingPassword] = useState(false);
    const [changingAvatar, setChangingAvatar] = useState(false);
    const [processingAccount, setProcessingAccount] = useState({ google: false, facebook: false });

    const handleChangePasswowd = async (oldPassword, newPassword, confirmPassword) => {
        if (oldPassword.trim() === "" || newPassword.trim() === "" || confirmPassword.trim() === "") {
            toast.error("Mật khẩu không được bỏ trống");
            return;
        }
        if (newPassword.length < 8) {
            toast.error("Mật khẩu phải có ít nhất 8 ký tự");
            return;
        }
        if (newPassword !== confirmPassword) {
            toast.error("Mật khẩu mới không khớp với xác nhận");
            return;
        }
        try {
            setChangingPassword(true);
            const res = await API.post(`/nguoidung/change-password?maNguoiDung=${user.id}`, {
                oldPassword,
                newPassword,
            });
            if (res.data.success) {
                toast.success(res.data.message);
                setShowChangePasswordModal(false);
            } else {
                toast.error(res.data.message);
            }
        } catch (error) {
            toast.error(error.message);
        } finally {
            setChangingPassword(false);
        }
    };

    const handleChangeAvatar = async (e) => {
        const file = e.target.files[0];
        if (file) {
            try {
                setChangingAvatar(true);
                const imageUrl = await uploadFileToCloudinary(file);
                e.target.value = null;

                const res = await API.post(`/nguoidung/change-avatar?maNguoiDung=${user.id}`, { imageUrl });
                if (res.data.success) {
                    setUser({ ...user, hinhAnh: imageUrl });
                    toast.success(res.data.message);
                }
            } catch (error) {
                console.error("Lỗi khi upload ảnh:", error);
                toast.error("Lỗi khi upload ảnh");
            } finally {
                setChangingAvatar(false);
            }
        }
    };

    const handleUpdateInfo = async () => {
        if (personal.hoTen.trim() === user.hoTen && personal.tieuSu.trim() === user.tieuSu) {
            return;
        }

        if (personal.hoTen.trim() === "") {
            toast.error("Tên người dùng không được bỏ trống");
            return;
        }

        try {
            setPersonal({ ...personal, updating: true });
            const res = await API.post("/nguoidung/update-info", {
                maNguoiDung: user.id,
                hoTen: personal.hoTen.trim(),
                tieuSu: personal.tieuSu?.trim() || null,
            });
            if (res.data.success) {
                setUser({ ...user, hoTen: personal.hoTen, tieuSu: personal.tieuSu });
                toast.success(res.data.message);
            } else {
                toast.error(res.data.message);
            }
        } catch (error) {
            console.error("Error updating user info:", error);
            toast.error(error.message);
        } finally {
            setPersonal({ ...personal, updating: false });
        }
    };

    const handleSocialAccount = async (provider) => {
        if (provider !== "google" && provider !== "facebook") {
            return;
        }

        const isLinked = provider === "google" ? socialStatus.google : socialStatus.facebook;

        try {
            setProcessingAccount({ ...processingAccount, [provider]: true });

            if (isLinked) {
                const endpoint = `/auth/unlink-${provider}`;
                const res = await API.post(endpoint, { email: user.email });

                if (res.data.success) {
                    toast.success(res.data.message);

                    setSocialStatus({ ...socialStatus, [provider]: null });

                    const updatedUser = { ...user };
                    updatedUser[`${provider}Id`] = null;
                    setUser(updatedUser);
                } else {
                    toast.error(res.data.message);
                }
            } else {
                window.location.href = `${import.meta.env.VITE_NESTJS_API_URL}/auth/${provider}`;
            }
        } catch (error) {
            const errorMessage = error.response?.data?.message || `Lỗi khi xử lý tài khoản ${provider}`;
            toast.error(errorMessage);
            console.error(`Lỗi với tài khoản ${provider}:`, error);
        } finally {
            setProcessingAccount({ ...processingAccount, [provider]: false });
        }
    };

    return (
        <section className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4">
            <div className="max-w-7xl mx-auto">
                <ReturnButton value="Quay lại trang chủ" className="mb-6" />

                {showChangePasswordModal && (
                    <ChangePasswordModal
                        onSubmit={handleChangePasswowd}
                        loading={changingPassword}
                        onClickOutside={() => setShowChangePasswordModal(false)}
                        onResetPassword={() => setShowResetPasswordModal(true)}
                    />
                )}

                {showResetPasswordModal && <ForgotPasswordModal onClose={() => setShowResetPasswordModal(false)} />}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left - Profile Card */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                            {/* Header */}
                            <div className="bg-gradient-to-r from-[#49BBBD] to-[#3da5a7] px-6 py-8">
                                <div className="text-center">
                                    <div className="relative inline-block">
                                        <div className="w-32 h-32 mx-auto rounded-full bg-white p-1 shadow-lg">
                                            {changingAvatar ? (
                                                <div className="w-full h-full rounded-full bg-gray-100 flex items-center justify-center">
                                                    <Loading />
                                                </div>
                                            ) : (
                                                <img
                                                    src={user.hinhAnh ? user.hinhAnh : avatar}
                                                    alt="avatar"
                                                    className="w-full h-full rounded-full object-cover"
                                                />
                                            )}
                                        </div>
                                        <label
                                            htmlFor="fileInput"
                                            className="absolute bottom-2 right-2 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors"
                                        >
                                            <Camera className="w-5 h-5 text-gray-600" />
                                        </label>
                                        <input
                                            type="file"
                                            className="hidden"
                                            id="fileInput"
                                            onChange={handleChangeAvatar}
                                        />
                                    </div>
                                    <h2 className="mt-4 text-xl font-bold text-white">{user.hoTen}</h2>
                                    {user.vaiTro && (
                                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-white/20 text-white mt-2">
                                            <Shield className="w-3 h-3 mr-1" />
                                            {user.vaiTro}
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="p-6 space-y-3">
                                <button
                                    onClick={() => setShowChangePasswordModal(true)}
                                    className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-gradient-to-r from-[#49BBBD] to-[#3da5a7] text-white rounded-xl hover:shadow-lg hover:shadow-[#49BBBD]/25 transition-all duration-200 font-medium"
                                >
                                    <Key className="w-5 h-5" />
                                    Đổi mật khẩu
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Right - Info Cards */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Personal Information */}
                        <div className="bg-white rounded-2xl shadow-lg p-6">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 bg-[#49BBBD]/10 rounded-xl flex items-center justify-center">
                                    <User className="w-5 h-5 text-[#49BBBD]" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-800">Thông tin cá nhân</h3>
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <label htmlFor="hoTen" className="block text-sm font-semibold text-gray-700 mb-2">
                                        Tên người dùng
                                    </label>
                                    <input
                                        type="text"
                                        id="hoTen"
                                        value={personal.hoTen ?? ""}
                                        onChange={(e) => setPersonal({ ...personal, hoTen: e.target.value })}
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#49BBBD]/20 focus:border-[#49BBBD] transition-all"
                                        placeholder="Nhập tên của bạn"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="tieuSu" className="block text-sm font-semibold text-gray-700 mb-2">
                                        Giới thiệu về bản thân
                                    </label>
                                    <textarea
                                        id="tieuSu"
                                        rows="4"
                                        value={personal.tieuSu ?? ""}
                                        onChange={(e) => setPersonal({ ...personal, tieuSu: e.target.value })}
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#49BBBD]/20 focus:border-[#49BBBD] transition-all resize-none"
                                        placeholder="Hãy viết gì đó về bản thân..."
                                    />
                                </div>

                                <div className="flex justify-end">
                                    <button
                                        onClick={handleUpdateInfo}
                                        disabled={personal.updating}
                                        className="flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-xl transition-all duration-200 disabled:opacity-50"
                                    >
                                        {personal.updating ? <Loading size="small" /> : <Save className="w-4 h-4" />}
                                        Lưu thông tin
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Social Accounts */}
                        {/* <div className="bg-white rounded-2xl shadow-lg p-6">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 bg-[#49BBBD]/10 rounded-xl flex items-center justify-center">
                                    <Link2 className="w-5 h-5 text-[#49BBBD]" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-800">Tài khoản liên kết</h3>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center">
                                            <img src={google_icon} alt="google" className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-gray-800">Google</h4>
                                            <p className="text-sm text-gray-500">
                                                {socialStatus.google
                                                    ? "Đã liên kết với tài khoản Google"
                                                    : "Chưa liên kết"}
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleSocialAccount("google")}
                                        disabled={processingAccount.google || socialStatus.facebook}
                                        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 disabled:opacity-50 ${
                                            socialStatus.google
                                                ? "bg-red-500 hover:bg-red-600 text-white"
                                                : "bg-blue-500 hover:bg-blue-600 text-white"
                                        }`}
                                    >
                                        {processingAccount.google ? (
                                            <Loading size="small" />
                                        ) : socialStatus.google ? (
                                            <>
                                                <ExternalLink className="w-4 h-4" />
                                                Hủy liên kết
                                            </>
                                        ) : (
                                            <>
                                                <Link2 className="w-4 h-4" />
                                                Liên kết
                                            </>
                                        )}
                                    </button>
                                </div>

                                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center">
                                            <img src={facebook_icon} alt="facebook" className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-gray-800">Facebook</h4>
                                            <p className="text-sm text-gray-500">
                                                {socialStatus.facebook
                                                    ? "Đã liên kết với tài khoản Facebook"
                                                    : "Chưa liên kết"}
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleSocialAccount("facebook")}
                                        disabled={processingAccount.facebook || socialStatus.google}
                                        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 disabled:opacity-50 ${
                                            socialStatus.facebook
                                                ? "bg-red-500 hover:bg-red-600 text-white"
                                                : "bg-blue-500 hover:bg-blue-600 text-white"
                                        }`}
                                    >
                                        {processingAccount.facebook ? (
                                            <Loading size="small" />
                                        ) : socialStatus.facebook ? (
                                            <>
                                                <ExternalLink className="w-4 h-4" />
                                                Hủy liên kết
                                            </>
                                        ) : (
                                            <>
                                                <Link2 className="w-4 h-4" />
                                                Liên kết
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div> */}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Me;
