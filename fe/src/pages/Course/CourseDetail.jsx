import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ReturnButton, Loading } from "@components";
import { useAuthStore } from "@store";
import { API, formatGiaBan } from "@utils";
import { toast } from "react-toastify";
import { ChevronDown, ChevronUp, Play, Clock, BookOpen, CheckCircle, Lock, ShoppingCart, Sparkles } from "lucide-react";

const CourseDetail = () => {
    const { id } = useParams();
    const [course, setCourse] = useState(null);
    const [isVisible, setIsVisible] = useState(true);
    const [loading, setLoading] = useState(true);

    const [khoaHocDK, setKhoaHocDK] = useState([]);
    const navigate = useNavigate();
    const { user } = useAuthStore();

    useEffect(() => {
        const fetchCourse = async (id) => {
            try {
                setLoading(true);
                const res = await API.get(`/khoa-hoc/${id}`);
                setCourse(res.data);
            } catch (error) {
                console.log(error);
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchCourse(id);
            if (user) {
                setKhoaHocDK(user.khoaHocDangKys);
            }
        } else {
            console.log("không thấy mã khóa học");
        }
    }, [id]);

    const handlePayment = async () => {
        if (!user) {
            navigate("/dang-nhap");
            toast.info("Vui lòng đăng nhập để thanh toán");
            return;
        }
        try {
            const res = await API.post("/payment/create-payment-url", {
                maNguoiDung: user.id,
                maKhoaHoc: course.id,
                amount: course.giaBan,
            });

            if (res.data && res.data.paymentUrl) {
                localStorage.setItem("coursePaying", JSON.stringify(course));
                window.location.href = res.data.paymentUrl;
            } else {
                console.error("Không nhận được URL thanh toán");
            }
        } catch (err) {
            console.error("Lỗi khi tạo thanh toán:", err);
        }
    };

    const handleJoinCourse = () => {
        navigate(`/khoa-hoc/${course.id}/bai-giang`);
    };

    const isEnrolled = khoaHocDK.filter((kh) => kh.id === course?.id).length > 0;
    const isFree = course?.giaBan === "0.00";

    if (loading) {
        return <Loading />;
    }

    return (
        <div className="min-h-screen">
            <ReturnButton value="Quay lại" className="pl-3 md:pl-6 pt-4" event={() => navigate("/")} />

            <div className="container mx-auto px-4 py-4">
                {course ? (
                    <div className="grid lg:grid-cols-3 gap-8 lg:gap-12">
                        {/* Main Content */}
                        <div className="lg:col-span-2 space-y-8">
                            {/* Course Header */}
                            <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
                                <div className="flex items-start gap-4 mb-6">
                                    <div className="w-16 h-16 bg-blue-500 rounded-2xl flex items-center justify-center">
                                        <BookOpen size={28} className="text-white" />
                                    </div>
                                    <div className="flex-1">
                                        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
                                            {course.tenKhoaHoc}
                                        </h1>
                                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                                            <div className="flex items-center gap-1">
                                                <Clock size={16} />
                                                <span>{course.baiGiangs?.length || 0} bài giảng</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Course Description */}
                                <div className="prose prose-gray max-w-none">
                                    <p className="text-gray-700 leading-relaxed text-lg">{course.moTa}</p>
                                </div>
                            </div>

                            {/* Course Content */}
                            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                                <div
                                    onClick={() => setIsVisible(!isVisible)}
                                    className="flex items-center justify-between p-6 bg-green-50 cursor-pointer border-b border-gray-100"
                                >
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-900">Nội dung khóa học</h3>
                                        <p className="text-gray-600">{course.baiGiangs?.length || 0} bài giảng</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {isVisible ? (
                                            <ChevronUp size={24} className="text-gray-500" />
                                        ) : (
                                            <ChevronDown size={24} className="text-gray-500" />
                                        )}
                                    </div>
                                </div>

                                <div
                                    className={`transition-all duration-300 ${
                                        isVisible ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
                                    } overflow-hidden`}
                                >
                                    <div className="p-6">
                                        <div className="space-y-3 max-h-96 overflow-y-auto">
                                            {course.baiGiangs?.map((baiGiang, index) => (
                                                <div
                                                    key={index}
                                                    className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 hover:border-blue-200 hover:bg-blue-50/50 transition-all duration-200 group"
                                                >
                                                    <div className="w-10 h-10 bg-green-400 rounded-full flex items-center justify-center flex-shrink-0">
                                                        <Play size={16} className="text-white ml-0.5" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <h4 className="font-semibold text-gray-900 group-hover:text-blue-700 transition-colors">
                                                            Bài {index + 1}: {baiGiang.tieuDe}
                                                        </h4>
                                                    </div>
                                                    {!isEnrolled && !isFree && (
                                                        <Lock size={16} className="text-gray-400" />
                                                    )}
                                                    {(isEnrolled || isFree) && (
                                                        <CheckCircle size={16} className="text-green-500" />
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Sidebar */}
                        <div className="lg:sticky lg:top-8 space-y-6">
                            {/* Course Preview Card */}
                            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                                {/* Course Image */}
                                <div className="relative">
                                    <div className="aspect-video overflow-hidden">
                                        <img
                                            src={course.hinhAnh}
                                            alt={course.tenKhoaHoc}
                                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                                        />
                                    </div>
                                </div>

                                <div className="p-6">
                                    {/* Price */}
                                    <div className="text-center mb-6">
                                        {isFree ? (
                                            <div className="flex items-center justify-center gap-2">
                                                <Sparkles size={24} className="text-yellow-500" />
                                                <span className="text-3xl font-bold text-green-600">Miễn phí</span>
                                                <Sparkles size={24} className="text-yellow-500" />
                                            </div>
                                        ) : (
                                            <div>
                                                <div className="text-3xl font-bold text-red-600 mb-1">
                                                    {formatGiaBan(course.giaBan)} VNĐ
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Action Button */}
                                    <button
                                        onClick={isFree || isEnrolled ? handleJoinCourse : handlePayment}
                                        className={`
                                            w-full py-4 px-6 rounded-xl font-bold text-lg transition-all duration-200 transform hover:scale-105 shadow-lg
                                            ${
                                                isFree || isEnrolled
                                                    ? "bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white"
                                                    : "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                                            }
                                        `}
                                    >
                                        <div className="flex items-center justify-center gap-2">
                                            {isFree || isEnrolled ? (
                                                <>
                                                    <Play size={20} />
                                                    Tham gia học
                                                </>
                                            ) : (
                                                <>
                                                    <ShoppingCart size={20} />
                                                    Đăng ký học
                                                </>
                                            )}
                                        </div>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-20">
                        <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                            <BookOpen size={32} className="text-gray-400" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Khóa học không tồn tại</h2>
                        <p className="text-gray-600">Khóa học bạn đang tìm kiếm không có trong hệ thống.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CourseDetail;
