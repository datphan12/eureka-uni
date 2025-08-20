import React, { useEffect, useState } from "react";
import { API } from "@utils";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { BookOpen, PlayCircle, Users, Trophy, Medal, Award } from "lucide-react";

const CourseStats = ({ month, year }) => {
    const [total, setTotal] = useState({});
    const [registrationCourseStats, setRegistrationCourseStats] = useState([]);
    const [top3PopolarCourses, setTop3PopolarCourses] = useState([]);

    const fetchStats = async () => {
        try {
            const res = await API.get(`/khoa-hoc/stats?year=${year}&month=${month}`);
            setTotal(res.data.total);
            setRegistrationCourseStats(res.data.registrationCourseStats);
            setTop3PopolarCourses(res.data.top3PopolarCourses);
        } catch (error) {
            console.error("Error fetching statistics:", error);
        }
    };

    useEffect(() => {
        fetchStats();
    }, [month, year]);

    const getRankIcon = (rank) => {
        switch (rank) {
            case 1:
                return <Trophy className="w-4 h-4 text-yellow-500" />;
            case 2:
                return <Medal className="w-4 h-4 text-gray-400" />;
            case 3:
                return <Award className="w-4 h-4 text-amber-600" />;
            default:
                return null;
        }
    };

    const getRankStyle = (rank) => {
        switch (rank) {
            case 1:
                return "bg-gradient-to-r from-yellow-100 to-yellow-300 border border-yellow-200 rounded-md px-2 py-1";
            case 2:
                return "bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 rounded-md px-2 py-1";
            case 3:
                return "bg-gradient-to-r from-amber-50 to-amber-100 border border-amber-200 rounded-md px-2 py-1";
            default:
                return "bg-white border-gray-200";
        }
    };

    return (
        <div className="flex-1 grid grid-cols-6 grid-rows-2 gap-1.5 h-full">
            <div className="bg-white border border-gray-300 rounded-md row-span-2 col-span-4 text-xs flex flex-col">
                <p className="text-sm ml-2 mt-2 mb-2 font-medium text-gray-600">
                    Số lượng đăng ký khóa học {month ? "tháng " + month + "/" + year : "năm " + year}
                </p>
                <div className="flex-1 min-h-0 pr-2 pb-2">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={registrationCourseStats}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="period" />
                            <YAxis />
                            <Tooltip />
                            <Line type="monotone" dataKey="count" />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>
            <div className="rounded-md row-span-1 col-span-2 flex">
                <div className="grid grid-cols-2 grid-rows-2 flex-1 text-sm gap-1.5">
                    <div className="flex flex-col items-center justify-center bg-blue-100 rounded-md border border-blue-300">
                        <BookOpen size={20} className="text-blue-600 rounded-md" />
                        <p className="text-blue-600 text-[16px]">
                            <strong className="text-xl">{total.courses}</strong> khóa học
                        </p>
                    </div>
                    <div className="flex flex-col items-center justify-center bg-purple-100 rounded-md border border-purple-300">
                        <PlayCircle size={20} className="text-purple-600 rounded-md" />
                        <p className="text-purple-600 text-[16px]">
                            <strong className="text-xl">{total.lectures}</strong> bài giảng
                        </p>
                    </div>
                    <div className="flex flex-col items-center justify-center bg-green-100 col-span-2 rounded-md border border-green-300">
                        <Users size={20} className="text-green-600 rounded-md" />
                        <p className="text-green-600 text-[16px]">
                            <strong className="text-xl">{total.users}</strong> lượt đăng ký
                        </p>
                    </div>
                </div>
            </div>
            <div className="bg-white border border-gray-300 rounded-md row-span-1 col-span-2 p-1.5 flex flex-col">
                <h3 className="font-medium text-gray-600 uppercase text-center mb-2">
                    Top 3 khóa học {month ? "tháng " + month + "/" + year : "năm " + year}
                </h3>

                <div className="space-y-2 flex-1 flex flex-col justify-center">
                    {top3PopolarCourses.map((course) => (
                        <div
                            key={course.top}
                            className={`${getRankStyle(course.top)} flex items-center justify-between`}
                        >
                            <div className="flex items-center text-sm gap-x-2">
                                <div>{getRankIcon(course.top)}</div>
                                <p className="line-clamp-1">{course.name}</p>
                            </div>
                            <p className="text-sm">#{course.top}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default CourseStats;
