import React, { useEffect, useState } from "react";
import { Title } from "@components";
import CommentInput from "./CommentInput";
import CommentCard from "./CommentCard";
import { ChevronLeft, X } from "lucide-react";

const CommentSide = ({ phanHois }) => {
    const [showCommentSide, setShowCommentSide] = useState(true);

    const [comments, setComments] = useState([]);

    useEffect(() => {
        if (phanHois) {
            setComments(phanHois);
        }
    }, [phanHois]);

    const handleShowCommentSide = () => {
        setShowCommentSide(!showCommentSide);
    };

    return (
        <>
            {!showCommentSide && (
                <button
                    onClick={handleShowCommentSide}
                    className="absolute top-6 right-0 flex gap-x-2 items-center bg-blue-500 px-4 py-2 rounded-md shadow-md transition-all hover:-translate-x-2"
                >
                    <ChevronLeft className="w-6 h-6 text-white" />
                    <p className="text-lg font-semibold text-white">Bình luận</p>
                </button>
            )}

            <div
                className={`bg-white flex flex-col lg:w-[40%] px-4 border border-primary/40 mx-1.5 lg:mx-0 lg:mr-2 rounded-lg py-2 gap-y-2 shadow transition-all duration-300 ease-in-out max-h-[calc(100vh-110px)] overflow-y-auto ${
                    showCommentSide ? "translate-x-0" : "opacity-0 translate-x-full"
                }`}
            >
                <div className="flex">
                    <Title value="Bình luận" className="font-semibold text-lg text-center flex-1" />
                    <button onClick={handleShowCommentSide} className="cursor-pointer hidden lg:block">
                        <X size={24} className="text-red-600" />
                    </button>
                </div>

                <div className="flex-1 flex flex-col gap-y-2 max-h-fit overflow-y-auto">
                    {/* main box */}
                    <div className="flex-1 mb-12 max-h-[calc(100vh-220px)] overflow-y-auto no-scrollbar">
                        {comments && comments.length === 0 ? (
                            <p className="text-center text-gray-500 text-sm">Chưa có bình luận nào</p>
                        ) : (
                            comments.map((comment, index) => <CommentCard key={index} comment={comment} />)
                        )}
                    </div>
                    {/* type comment */}
                    <CommentInput setComments={setComments} />
                </div>
            </div>
        </>
    );
};

export default CommentSide;
