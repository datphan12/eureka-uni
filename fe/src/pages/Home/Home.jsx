import React, { useEffect, useState } from "react";
import { ScrollToTopButton } from "@components";
import { API } from "@utils";
import { useAuthStore, useRecommend } from "@store";

import Header from "./components/Header";
import SectionNav from "./components/SectionNav";
import CourseSection from "./components/CourseSection";
import EmptyState from "./components/EmptyState";

import "./css/Home.css";

const Home = () => {
    const [courses, setCourses] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeSection, setActiveSection] = useState("registered");

    const { user } = useAuthStore();
    const { courseRecommend, setCourseRecommend, fetchedCourses, setFetchedCourses } = useRecommend();

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                setIsLoading(true);
                const res = await API.get("/khoa-hoc?deletedAt=false");
                setCourses(res.data.items);
            } catch (error) {
                console.log(error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchCourses();
    }, []);

    // Lấy dữ liệu khóa học đề xuất
    useEffect(() => {
        const fetchCourseRecommend = async () => {
            let name = user?.khoaHocDangKys.map((kh) => kh.tenKhoaHoc).join("-");
            if (!name) return;
            try {
                const res = await API.get(`/ai/recommend-courses?name=${name}`);
                setFetchedCourses(true);
                setCourseRecommend(res.data.khoaHoc);
            } catch (error) {
                console.log(error);
            }
        };

        if (!fetchedCourses) {
            fetchCourseRecommend();
        }
    }, []);

    const hasRegisteredCourses = user && user.khoaHocDangKys && user.khoaHocDangKys.length > 0;
    const hasRecommendedCourses = courseRecommend.length > 0;

    const checkIcon = (
        <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
            />
        </svg>
    );

    const starIcon = (
        <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
    );

    const circleIcon = (
        <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
    );

    return (
        <section className="min-h-screen flex-1 p-4">
            {/* Header */}
            <Header user={user} />

            {/* Main */}
            <div className="container mx-auto px-6 py-6">
                <div className="flex justify-center mb-6">
                    <SectionNav
                        activeSection={activeSection}
                        setActiveSection={setActiveSection}
                        hasRegisteredCourses={hasRegisteredCourses}
                        hasRecommendedCourses={hasRecommendedCourses}
                        registeredCount={user?.khoaHocDangKys?.length || 0}
                        recommendedCount={courseRecommend.length}
                        totalCount={courses.length}
                    />
                </div>

                <div className="space-y-12">
                    {/* Khóa học đã đăng ký */}
                    {activeSection === "registered" && hasRegisteredCourses && (
                        <CourseSection
                            title="Khóa học đã đăng ký"
                            icon={checkIcon}
                            badgeText={`${user.khoaHocDangKys.length} khóa học`}
                            badgeColor="green"
                            courses={user.khoaHocDangKys}
                            owner={true}
                        />
                    )}

                    {/* Khóa học đề xuất */}
                    {activeSection === "recommended" && hasRecommendedCourses && (
                        <CourseSection
                            title="Khóa học được đề xuất"
                            icon={starIcon}
                            badgeText="Cho bạn"
                            badgeColor="purple"
                            courses={courseRecommend}
                        />
                    )}

                    {/* Tất cả khóa học */}
                    {activeSection === "all" && (
                        <CourseSection
                            title="Tất cả khóa học"
                            icon={circleIcon}
                            badgeText={`${courses.length} khóa học`}
                            badgeColor="blue"
                            courses={courses}
                            isLoading={isLoading}
                            emptyState={{
                                title: "Chưa có khóa học nào",
                                description: "Hiện tại chưa có khóa học nào được đăng tải. Vui lòng quay lại sau!",
                                icon: "📚",
                            }}
                        />
                    )}

                    {!hasRegisteredCourses && !hasRecommendedCourses && activeSection !== "all" && (
                        <EmptyState
                            title="Bắt đầu hành trình học tập"
                            description="Đăng ký khóa học đầu tiên để nhận được các đề xuất phù hợp với bạn!"
                            icon="🚀"
                        />
                    )}
                </div>
            </div>

            <ScrollToTopButton />
        </section>
    );
};

export default Home;
