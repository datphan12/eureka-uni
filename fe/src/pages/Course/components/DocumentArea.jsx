import React, { useEffect, useState } from "react";
import { API } from "@utils";
import { Download } from "lucide-react";

const DocumentArea = ({ lessonId }) => {
    const [document, setDocument] = useState();

    const fetchDocuments = async () => {
        try {
            const res = await API.get(`/bai-giang/doc?maBaiGiang=${lessonId}`);
            console.log("sfe", res.data);
            setDocument(res.data || null);
        } catch (error) {
            console.error("Lỗi khi tải danh sách tài liệu", error);
        }
    };

    useEffect(() => {
        fetchDocuments();
    }, [lessonId]);
    return (
        <div className="p-4">
            <p className="font-medium text-lg mb-4">Tài liệu bài giảng</p>
            <div className="space-y-4">
                {document && document.urlTaiLieu.length > 0 ? (
                    document.urlTaiLieu.map((file, index) => (
                        <div
                            key={index}
                            className="flex items-center justify-between space-x-2 bg-primary/20 px-4 py-2 rounded-md border border-gray-300"
                        >
                            <p className="font-medium">
                                {file.name.length > 35 ? `${file.name.slice(0, 10)}...` : file.name}
                            </p>
                            <div className="flex items-center gap-x-2">
                                <a href={file.url} target="_blank">
                                    <Download size={16} className="text-gray-500" />
                                </a>
                            </div>
                        </div>
                    ))
                ) : (
                    <p className="text-sm text-gray-600 text-center">Không có tài liệu bài giảng nào</p>
                )}
            </div>
        </div>
    );
};

export default DocumentArea;
