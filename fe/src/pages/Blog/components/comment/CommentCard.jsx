import React from "react";
import { formatDate } from "@utils";
import { ImageViewer, Avatar } from "@components";

const CommentCard = ({ comment, owner = false }) => {
    return (
        <div className="mb-8">
            <div className="flex items-center gap-x-2 mb-2">
                <Avatar src={comment.hinhAnh} />
                <p className="font-semibold">{comment.hoTen}</p>
            </div>
            {/* content */}
            <div className="bg-primary/20 rounded-md px-3 py-1 ml-4">
                <p className="whitespace-pre-wrap mb-2">{comment.noiDung}</p>
                <div className="flex items-center gap-x-2 flex-wrap">
                    {comment.dinhKem.map((imageUrl, index) => (
                        <div key={index}>
                            <ImageViewer
                                src={imageUrl}
                                className="max-w-[80px] lg:max-w-[150px] object-cover rounded-lg bg-white"
                            />
                        </div>
                    ))}
                </div>
                <p className="text-sm text-black/60 text-right italic mt-4">{formatDate(comment.createdAt)}</p>
            </div>
        </div>
    );
};

export default CommentCard;
