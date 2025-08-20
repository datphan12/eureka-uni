import React, { useEffect, useState } from "react";
import { API } from "@utils";
import { Users, UserPlus, Trophy, Medal, Award } from "lucide-react";

const GroupStats = ({ month, year }) => {
    const [total, setTotal] = useState({});
    const [createdGroupInPeriod, setCreatedGroupInPeriod] = useState({});
    const [top3ActiveGroups, setTop3ActiveGroups] = useState([]);

    const fetchStats = async () => {
        try {
            const res = await API.get(`/nhom-hoc-tap/stats?year=${year}&month=${month}`);
            setTotal(res.data.total);
            setCreatedGroupInPeriod(res.data.createdGroupInPeriod);
            setTop3ActiveGroups(res.data.top3ActiveGroups);
        } catch (error) {
            console.log(error);
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
        <div className="flex-1 grid grid-rows-2 grid-cols-2 gap-2">
            <div className="border border-gray-300 rounded-md bg-white flex flex-col items-center justify-center gap-y-2">
                <p className="text-lg text-gray-600 font-medium">Tổng số nhóm</p>
                <div className="text-2xl font-semibold flex items-center gap-x-2 text-blue-700">
                    <div className="rounded-full bg-blue-200 p-2">
                        <Users size={20} />
                    </div>
                    {total.count}
                </div>
                <div className="flex text-sm gap-x-2">
                    {total.stats &&
                        total.stats.map((stat, index) => (
                            <p key={index} className="font-thin">
                                {stat.type}: <strong className="text-lg font-medium">{stat.count}</strong>
                            </p>
                        ))}
                </div>
            </div>
            <div className="border border-gray-300 rounded-md bg-white flex flex-col items-center justify-center gap-y-2">
                <p className="text-center px-2 text-lg text-gray-600 font-medium">
                    Số nhóm được tạo trong {createdGroupInPeriod.period}
                </p>
                <div className="text-2xl font-semibold flex items-center gap-x-2 text-green-700">
                    <div className="rounded-full bg-green-200 p-2">
                        <UserPlus size={20} />
                    </div>
                    {createdGroupInPeriod.total}
                </div>
            </div>
            <div className="border border-gray-300 rounded-lg bg-white col-span-2 px-4 py-2 shadow-sm space-y-2">
                <h3 className="font-medium text-gray-600 uppercase text-center">
                    Top 3 Nhóm Hoạt Động {month ? "tháng " + month + "/" + year : "năm " + year}
                </h3>

                {top3ActiveGroups.map((group) => (
                    <div key={group.top} className={`${getRankStyle(group.top)} flex items-center justify-between`}>
                        <div className="flex items-center text-sm gap-x-2">
                            <div>{getRankIcon(group.top)}</div>
                            <p className="line-clamp-1">{group.name}</p>
                        </div>
                        <p className="text-sm">#{group.top}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default GroupStats;
