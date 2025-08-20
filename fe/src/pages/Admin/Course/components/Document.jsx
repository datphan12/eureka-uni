import { API, uploadFileToCloudinary, deleteFileFromCloudinary } from "@utils";
import { toast } from "react-toastify";
import { useEffect, useState } from "react";
import { Trash2, Download } from "lucide-react";

const VALID_IMAGE_TYPES = [
    ".pdf",
    ".doc",
    ".docx",
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

const Document = ({ lectureId, mode }) => {
    const [document, setDocument] = useState();
    const [loading, setLoading] = useState(false);

    const fetchDocuments = async () => {
        try {
            const res = await API.get(`/bai-giang/doc?maBaiGiang=${lectureId}`);
            console.log(res.data);
            setDocument(res.data || null);
        } catch (error) {
            console.error("Error fetching documents:", error);
            toast.error("Lỗi khi tải danh sách tài liệu");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDocuments();
    }, [lectureId]);

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        console.log(file);

        if (!VALID_IMAGE_TYPES.includes(file.type)) {
            toast.error("Loại file không được hỗ trợ.");
            return;
        }

        try {
            setLoading(true);
            const fileUrl = await uploadFileToCloudinary(file);
            e.target.value = null;

            const res = await API.post("/bai-giang/doc", {
                maBaiGiang: lectureId,
                url: fileUrl,
                name: file.name,
            });

            if (res.data.success) {
                toast.success("Tải lên thành công!");
                fetchDocuments();
            }
        } catch (error) {
            console.error("Lỗi khi upload ảnh:", error);
            toast.error("Lỗi khi upload file");
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteFile = async (url, name) => {
        if (!confirm(`Bạn có chắc muốn xóa tài liệu "${name}"?`)) return;

        try {
            setLoading(true);

            await deleteFileFromCloudinary(url);

            const res = await API.delete(`/bai-giang/doc/${lectureId}`, {
                data: {
                    url: url,
                },
            });

            if (res.data.success) {
                toast.success("Xóa tài liệu thành công!");
                fetchDocuments();
            }
        } catch (error) {
            console.error("Lỗi khi xóa tài liệu:", error);
            toast.error("Lỗi khi xóa tài liệu");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <span className="font-medium text-gray-700">Tài liệu bài giảng</span>
                {mode !== "view" && (
                    <div>
                        <label
                            htmlFor="fileInput"
                            className="cursor-pointer bg-blue-600 text-white rounded-md hover:bg-blue-700 px-3 py-1"
                        >
                            {loading ? "Đang tải lên..." : "Thêm tài liệu"}
                        </label>
                        <input type="file" id="fileInput" className="hidden" onChange={handleFileChange} />
                    </div>
                )}
            </div>
            <div className="bg-white border border-gray-300 rounded-md p-4 space-y-2">
                {document && document.urlTaiLieu.length > 0 ? (
                    document.urlTaiLieu.map((file, index) => (
                        <div
                            key={index}
                            className="flex items-center justify-between space-x-2 bg-gray-100 px-4 py-2 rounded-md border border-gray-300"
                        >
                            <p>{file.name.length > 35 ? `${file.name.slice(0, 10)}...` : file.name}</p>
                            <div className="flex items-center gap-x-2">
                                <a href={file.url} target="_blank">
                                    <Download size={16} className="text-gray-500" />
                                </a>
                                <span
                                    onClick={() => handleDeleteFile(file.url, file.name)}
                                    className={`text-red-600 hover:text-red-800 p-1 rounded ${
                                        mode === "view" && "hidden"
                                    }`}
                                    title="Xóa tài liệu"
                                    disabled={loading}
                                >
                                    <Trash2 size={16} />
                                </span>
                            </div>
                        </div>
                    ))
                ) : (
                    <p className="text-sm text-gray-600 text-center">Chưa tạo tài liệu bài giảng</p>
                )}
            </div>
        </div>
    );
};

export default Document;
