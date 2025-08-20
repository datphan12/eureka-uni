import React, { useEffect, useState } from "react";
import { API, formatGiaBan } from "@utils";

const TransactionStats = ({ month, year }) => {
    const [revenue, setRevenue] = useState({});

    const fetchStats = async () => {
        try {
            const res = await API.get(`/giao-dich/stats?year=${year}&month=${month}`);
            setRevenue(res.data.revenue);
        } catch (error) {
            console.error("Error fetching statistics:", error);
        }
    };

    useEffect(() => {
        fetchStats();
    }, [month, year]);

    return (
        <div className="flex">
            <div className="flex-1 flex flex-col items-center justify-center rounded-md gap-1 border bg-purple-50 border-purple-300 text-purple-600 ">
                <p className="font-medium text-base text-center px-4">Doanh thu trong {revenue.period}</p>
                <div className="flex items-center gap-2">
                    {/* <FilePlus2 size={38} className="bg-purple-200 rounded-full p-1.5" /> */}
                    <strong className="text-2xl">
                        {formatGiaBan(revenue.total)} <span className="text-base">VNĐ</span>
                    </strong>
                </div>
            </div>
        </div>
    );
};

export default TransactionStats;
