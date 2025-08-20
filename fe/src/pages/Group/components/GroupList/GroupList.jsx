import React, { useState } from "react";
import GroupListItem from "./GroupListItem";
import { useGroupStore } from "@store";

const GroupList = ({ groups, onClose }) => {
    const [openGroupId, setOpenGroupId] = useState(null);
    const error = useGroupStore((state) => state.error);

    if (!groups.length) return <p className="text-center text-gray-500">Không tìm thấy nhóm phù hợp.</p>;

    return (
        <>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <ul className="mt-4 space-y-3 max-h-[380px] overflow-y-auto no-scrollbar">
                {groups.map((group) => (
                    <GroupListItem
                        key={group.id}
                        group={group}
                        onClose={onClose}
                        openGroupId={openGroupId}
                        setOpenGroupId={setOpenGroupId}
                    />
                ))}
            </ul>
        </>
    );
};

export default GroupList;
