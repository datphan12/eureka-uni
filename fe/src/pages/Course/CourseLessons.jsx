import React, { useEffect, useState } from "react";
import { ReturnButton } from "@components";
import { useParams } from "react-router-dom";
import LessonAction from "./components/LessonAction";
import VideoPlayer from "./components/VideoPlayer";
import { API } from "@utils";

const CourseLessons = () => {
    const { id } = useParams();
    const [course, setCourse] = useState(null);
    const [urlVideo, setUrlVideo] = useState(null);
    const [selectedLesson, setSelectedLesson] = useState(null);
    const [isVisible, setIsVisible] = useState(false);

    const handleClickLesson = (url, id) => {
        setUrlVideo(url);
        setSelectedLesson(id);
        setIsVisible(false);
    };

    useEffect(() => {
        const fetchCourse = async (id) => {
            try {
                const res = await API.get(`/khoa-hoc/${id}`);
                setCourse(res.data);
            } catch (error) {
                console.log(error);
            }
        };

        if (id) {
            fetchCourse(id);
        }
    }, [id]);

    useEffect(() => {
        if (course && course.baiGiangs.length > 0) {
            setUrlVideo(course.baiGiangs[0].videoUrl);
            setSelectedLesson(course.baiGiangs[0].id);
        }
    }, [course]);

    return (
        <section className="relative">
            <div className="fixed top-0 left-0 z-50 bg-white w-full">
                <ReturnButton
                    value="Quay lại"
                    className="pl-3 md:pl-6 py-2"
                    event={() => (window.location.href = `${import.meta.env.VITE_FRONT_END_URL}/khoa-hoc/${id}`)}
                />
            </div>
            {course && (
                <div className="flex relative pt-10">
                    {/* left bar */}
                    <div className="fixed w-full lg:w-[calc(100%-350px)] lg:pr-4 h-[95vh] lg:h-screen overflow-y-scroll ">
                        <VideoPlayer url={urlVideo} />
                        <LessonAction lessonId={selectedLesson} />
                    </div>
                    {/* overlay */}
                    <div
                        onClick={() => setIsVisible(!isVisible)}
                        className={`fixed top-0 right-0 w-full h-[50vh] z-10 block lg:hidden ${
                            isVisible ? "block" : "hidden"
                        }`}
                    ></div>

                    {/* right bar */}
                    <div
                        className={`fixed bottom-0 right-0 lg:right-1 w-full lg:w-[350px] lg:h-[95vh] lg:block z-40 bg-white transition-all duration-300 ${
                            isVisible ? "h-[50vh]" : "h-14"
                        } `}
                    >
                        <div
                            onClick={() => setIsVisible(!isVisible)}
                            className="bg-blue-500 text-white cursor-pointer relative flex items-center gap-x-3 lg:rounded-md px-4 py-1 mb-3"
                        >
                            <div>
                                <p className="text-lg font-semibold">Nội dung khóa học</p>
                                <p className="text-sm">{course.baiGiangs.length} bài giảng</p>
                            </div>
                        </div>
                        <ul
                            className={`overflow-y-scroll h-[calc(50vh-60px)] space-y-3 lg:h-[calc(100vh-100px)] no-scrollbar lg:block ${
                                isVisible ? "block" : "hidden lg:block"
                            }`}
                        >
                            {course.baiGiangs
                                .sort((a, b) => a.thuTu - b.thuTu)
                                .map((baiGiang, index) => (
                                    <li
                                        onClick={() => handleClickLesson(baiGiang.videoUrl, baiGiang.id)}
                                        key={index}
                                        className={`px-4 py-2 rounded-md border border-gray-100 font-medium leading-8 line-clamp-2 ${
                                            selectedLesson === baiGiang.id
                                                ? "bg-blue-50 text-blue-600"
                                                : "hover:text-blue-600 hover:bg-blue-50 cursor-pointer"
                                        }`}
                                    >
                                        {index + 1}. {baiGiang.tieuDe}
                                    </li>
                                ))}
                        </ul>
                    </div>
                </div>
            )}
        </section>
    );
};

export default CourseLessons;
