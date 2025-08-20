import React, { useState } from "react";
import NoteArea from "./NoteArea";
import CommentArea from "./CommentArea";
import DocumentArea from "./DocumentArea";

const ACTION = ["Bình luận", "Ghi chú", "Tài liệu"];

const LessonAction = ({ lessonId }) => {
    const [currentAction, setCurrentAction] = useState("Bình luận");

    const renderContent = () => {
        switch (currentAction) {
            case "Ghi chú":
                return <NoteArea lessonId={lessonId} />;
            case "Tài liệu":
                return <DocumentArea lessonId={lessonId} />;
            case "Bình luận":
                return <CommentArea lessonId={lessonId} />;
            default:
                return null;
        }
    };

    return (
        <div className="h-[85vh] flex flex-col">
            {/* header */}
            <div>
                <ul className="flex w-full">
                    {ACTION.map((action) => (
                        <li
                            key={action}
                            className={`py-2 px-4 cursor-pointer transition-colors ${
                                currentAction === action ? "bg-primary text-white" : "hover:bg-gray-100"
                            }`}
                            onClick={() => setCurrentAction(action)}
                        >
                            {action}
                        </li>
                    ))}
                </ul>
            </div>
            {/* main */}
            <div className="flex-1 overflow-y-auto no-scrollbar mb-12 border border-[#ccc] rounded-md shadow">
                {renderContent()}
            </div>
        </div>
    );
};

export default LessonAction;
