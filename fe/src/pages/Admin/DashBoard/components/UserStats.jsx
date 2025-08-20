import React, { useEffect, useState } from "react";
import { API } from "@utils";
import { User } from "lucide-react";
import { Bar, BarChart, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

const PIE_CHART_COLORS = ["#00c950", "#2b7fff", "#ffc658"];

const UserStats = ({ month, year }) => {
    const [barData, setBarData] = useState([]);
    const [total, setTotal] = useState(0);
    const [pieData, setPieData] = useState([]);

    const fetchStatistics = async () => {
        try {
            const res = await API.get(`/nguoidung/stats?month=${month}&year=${year}`);
            setBarData(res.data.userRegistrationStats);
            setTotal(res.data.total);
            setPieData(res.data.registrationMethodStats);
        } catch (error) {
            console.error("Error fetching statistics:", error);
        }
    };

    useEffect(() => {
        fetchStatistics();
    }, [month, year]);

    return (
        <div className="grid grid-cols-4 gap-x-1.5 flex-1 h-full">
            <div className="col-span-1 grid grid-rows-3 gap-y-1 h-full">
                <div className="row-span-1 bg-white rounded-md border border-gray-300 flex flex-col items-center justify-center gap-y-2">
                    <p className="font-medium">Tổng người dùng</p>
                    <div className="flex items-center text-blue-700">
                        <User size={34} className="bg-blue-200 rounded-full p-1.5" />
                        <span className="text-2xl font-semibold ml-2">{total}</span>
                    </div>
                </div>
                <div className="row-span-2 bg-white rounded-md border border-gray-300 text-xs flex flex-col">
                    <p className="text-sm ml-2 mb-2 mt-2 font-medium text-gray-600">Phương thức đăng ký</p>
                    <div className="flex-1 min-h-0">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={pieData}
                                    dataKey="count"
                                    nameKey="method"
                                    cx="50%"
                                    cy="50%"
                                    outerRadius="70%"
                                    label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                                >
                                    {pieData.map((_, index) => (
                                        <Cell key={`cell-${index}`} fill={PIE_CHART_COLORS[index]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
            <div className="col-span-3 bg-white text-xs border border-gray-300 rounded-md flex flex-col">
                <p className="text-sm ml-2 mt-2 mb-2 font-medium text-gray-600">
                    Số lượng người đăng ký {month ? "tháng " + month + "/" + year : "năm " + year}
                </p>
                <div className="flex-1 min-h-0 pr-2 pb-2">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={barData}>
                            <XAxis dataKey="period" />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="email" stackId="a" fill="#ffc658" />
                            <Bar dataKey="google" stackId="a" fill="#00c950" />
                            <Bar dataKey="facebook" stackId="a" fill="#2b7fff" />
                            <Legend verticalAlign="bottom" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};

export default UserStats;
