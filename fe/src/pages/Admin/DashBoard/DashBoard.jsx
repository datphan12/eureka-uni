import React, { useState } from "react";
import UserStats from "./components/UserStats";
import GroupStats from "./components/GroupStats";
import CourseStats from "./components/CourseStats";
import BlogStats from "./components/BlogStats";
import TransactionStats from "./components/TransactionStats";
import DraggableFilter from "./components/DraggableFilter";

const DashBoard = () => {
    const currentYear = 2025;
    const [month, setMonth] = useState(null);
    const [year, setYear] = useState(currentYear);

    const handleReset = () => {
        setMonth(null);
        setYear(currentYear);
    };

    return (
        <section className="dashboard flex-1 p-2 bg-gray-100 flex flex-col rounded-md">
            {/* filter */}
            <DraggableFilter
                month={month}
                year={year}
                onMonthChange={setMonth}
                onYearChange={setYear}
                onReset={handleReset}
            />
            <div className="flex flex-col flex-1 gap-y-1.5">
                <div className="flex-1 grid grid-cols-6 gap-x-1.5">
                    <div className="col-span-4 flex">
                        <UserStats month={month} year={year} />
                    </div>
                    <div className="col-span-2 flex">
                        <GroupStats month={month} year={year} />
                    </div>
                </div>
                <div className="flex-1 grid grid-cols-6 gap-x-1.5">
                    <div className="col-span-4 flex">
                        <CourseStats month={month} year={year} />
                    </div>
                    <div className="col-span-2 flex">
                        <div className="grid grid-cols-2 grid-rows-2 flex-1 gap-1.5">
                            <BlogStats month={month} year={year} />
                            <TransactionStats month={month} year={year} />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default DashBoard;
