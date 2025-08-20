import React, { useState } from "react";
import { logo_eureka_uni, google_icon, facebook_icon, background, eye, eye_slash } from "@assets";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { ErrorMessage } from "@components";
import { useAuthStore } from "@store";
import ForgotPasswordModal from "./components/ForgotPasswordModal";

const Login = () => {
    const { login, loginWithGoogle, loginWithFacebook } = useAuthStore();
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    const [serverError, setServerError] = useState();
    const [showResetPassword, setShowResetPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm();

    // const onSubmit = async (data) => {
    //     const res = await login(data);
    //     if (!res.success) {
    //         setServerError(res.error);
    //     }
    // };

    const onSubmit = async (data) => {
        try {
            setLoading(true);
            const res = await login(data);
            if (!res.success) {
                setServerError(res.error);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleShowPassword = () => {
        setShowPassword(!showPassword);
    };

    return (
        <section
            style={{ backgroundImage: `url(${background})` }}
            className="relative w-screen h-screen bg-cover bg-no-repeat"
        >
            {showResetPassword && <ForgotPasswordModal onClose={() => setShowResetPassword(false)} />}

            <div className="absolute top-2 left-2 w-[200px] bg-white p-2 rounded-sm">
                <p className="text-xs">Host free, lần đầu request có thể mất khoảng 1 phút phản hồi.</p>
            </div>

            {/* popup login */}
            <div className="flex flex-col gap-y-2 w-[95%] sm:w-[600px] lg:w-[550px] bg-white sm:border border-[#ccc] absolute top-1/2 left-1/2 translate-x-[-50%] translate-y-[-50%] rounded-2xl p-4 sm:p-10">
                <p className="text-xl sm:text-3xl font-bold text-center">Chào mừng đến Eureka Uni!</p>
                <div className="flex-center">
                    <img src={logo_eureka_uni} alt="logo" />
                </div>
                <p className="text-lg sm:text-2xl font-bold text-center">Đăng nhập</p>
                <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col text-sm sm:text-base">
                    <div className="flex flex-col gap-y-1">
                        <label htmlFor="email">Email</label>
                        <div className="flex flex-col mb-4">
                            <input
                                {...register("email", {
                                    required: "Email không được bỏ trống",
                                    pattern: {
                                        value: /\S+@\S+\.\S+/,
                                        message: "Email không hợp lệ",
                                    },
                                })}
                                type="text"
                                id="email"
                                placeholder="Nhập email"
                                className="border border-[#ccc] rounded-3xl py-2 px-4 outline-none"
                            />
                            {errors.email && <ErrorMessage value={errors.email.message} />}
                        </div>
                    </div>
                    <div className="flex flex-col gap-y-1 relative">
                        <label htmlFor="matKhau">Mật khẩu</label>
                        <div className="flex flex-col mb-4">
                            <div className="flex border border-[#ccc] rounded-3xl ">
                                <input
                                    {...register("matKhau", {
                                        required: "Mật khẩu không được bỏ trống",
                                        minLength: {
                                            value: 8,
                                            message: "Mật khẩu tối thiểu 8 ký tự",
                                        },
                                        maxLength: {
                                            value: 20,
                                            message: "Mật khẩu tối đa 20 ký tự",
                                        },
                                    })}
                                    type={showPassword ? "text" : "password"}
                                    id="matKhau"
                                    placeholder="Nhập mật khẩu"
                                    className="flex-1 py-2 px-4 outline-none"
                                />

                                <button type="button" onClick={handleShowPassword} className="cursor-pointer mr-4">
                                    <img src={!showPassword ? eye : eye_slash} alt="icon" />
                                </button>
                            </div>

                            {errors.matKhau && <ErrorMessage value={errors.matKhau.message} />}
                        </div>
                    </div>
                    {serverError && <ErrorMessage value={serverError} className="mb-2" />}
                    <div className="flex-center">
                        <button
                            type="submit"
                            className="bg-primary text-white rounded-lg py-2 px-8 cursor-pointer hover:bg-primary/90"
                        >
                            {loading ? "Đăng xử lý" : "Đăng nhập"}
                        </button>
                    </div>
                </form>

                <div className="text-center mt-4 text-sm sm:text-base">
                    <p>
                        Bạn chưa có tài khoản?{" "}
                        <span onClick={() => navigate("/dang-ky")} className="underline text-primary cursor-pointer">
                            Đăng ký
                        </span>
                    </p>
                    <p onClick={() => setShowResetPassword(true)} className="underline text-primary cursor-pointer">
                        Quên mật khẩu?
                    </p>
                </div>

                <div className="flex flex-col gap-y-3 mt-4 text-sm sm:text-base">
                    <button
                        onClick={loginWithGoogle}
                        className="flex w-full border rounded-3xl p-2 border-[#ccc] cursor-pointer hover:shadow-sm transition-all duration-300 ease-in-out"
                    >
                        <img src={google_icon} alt="icon" />
                        <p className="flex-1 text-center">Đăng nhập với Google</p>
                    </button>
                    <button
                        onClick={loginWithFacebook}
                        className="flex w-full border rounded-3xl p-2 border-[#ccc] cursor-pointer hover:shadow-sm transition-all duration-300 ease-in-out"
                    >
                        <img src={facebook_icon} alt="icon" />
                        <p className="flex-1 text-center">Đăng nhập với Facebook</p>
                    </button>
                </div>
            </div>
        </section>
    );
};

export default Login;
