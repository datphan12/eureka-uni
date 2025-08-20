import React from "react";
import CourseCard from "./CourseCard";

const CourseGrid = ({ courses, owner = false }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {courses.map((course, index) => (
                <div key={index} className="transform transition-all duration-300 hover:scale-105">
                    <CourseCard course={course} owner={owner} />
                </div>
            ))}
        </div>
    );
};

export default CourseGrid;
