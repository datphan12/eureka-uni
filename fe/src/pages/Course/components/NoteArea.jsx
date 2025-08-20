import React, { useState, useEffect } from "react";
import { API, formatDate } from "@utils";
import { Loading } from "@components";
import { useAuthStore } from "@store";
import { Trash2 } from "lucide-react";

const NoteArea = ({ lessonId }) => {
    const [notes, setNotes] = useState([]);
    const [newNote, setNewNote] = useState("");
    const [loading, setLoading] = useState(false);
    const { user } = useAuthStore();

    useEffect(() => {
        if (lessonId && user) {
            fetchNotes();
        }
    }, [lessonId, user]);

    const fetchNotes = async () => {
        try {
            setLoading(true);

            const response = await API.get(`/bai-giang/ghi-chu`, {
                params: { maBaiGiang: lessonId },
            });

            setNotes(response.data || []);
        } catch (error) {
            console.error("Lỗi khi lấy ghi chú:", error);
            setNotes([]);
        } finally {
            setLoading(false);
        }
    };

    const handleAddNote = async () => {
        if (!newNote.trim()) return;

        try {
            setLoading(true);
            await API.post(`/bai-giang/ghi-chu`, null, {
                params: {
                    maNguoiDung: user.id,
                    maBaiGiang: lessonId,
                    noiDung: newNote,
                },
            });

            setNewNote("");
            await fetchNotes();
        } catch (error) {
            console.error("Lỗi khi thêm ghi chú:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteNote = async (noteId) => {
        if (!window.confirm("Bạn có chắc chắn muốn xóa ghi chú này không?")) {
            return;
        }

        try {
            setLoading(true);
            await API.delete(`/bai-giang/ghi-chu/${noteId}`);
            await fetchNotes();
        } catch (error) {
            console.error("Lỗi khi xóa ghi chú:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-4 flex flex-col h-full">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">Ghi chú của bạn</h2>

                <button
                    onClick={handleAddNote}
                    disabled={loading || !newNote.trim()}
                    className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary/80 disabled:bg-gray-400 transition-colors flex items-center"
                >
                    {loading ? (
                        <Loading />
                    ) : (
                        <>
                            <svg
                                className="w-4 h-4 mr-1"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                                ></path>
                            </svg>
                            Thêm ghi chú
                        </>
                    )}
                </button>
            </div>

            <div className="mb-4">
                <textarea
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary transition-all"
                    placeholder="Nhập ghi chú của bạn..."
                    rows="2"
                />
            </div>

            {/* Danh sách ghi chú */}
            <div className="flex-1 overflow-y-auto">
                {loading && notes.length === 0 ? (
                    <div className="flex items-center justify-center py-10">
                        <Loading />
                    </div>
                ) : notes.length === 0 ? (
                    <div className="text-center py-10 px-4">
                        <svg
                            className="mx-auto h-12 w-12 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="1"
                                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                            ></path>
                        </svg>
                        <p className="mt-2 text-gray-500">Bạn chưa có ghi chú nào cho bài học này</p>
                        <p className="text-sm text-gray-400 mt-1">
                            Thêm ghi chú để dễ dàng ghi nhớ kiến thức quan trọng
                        </p>
                    </div>
                ) : (
                    <ul className="space-y-3 pb-4">
                        {notes.map((note) => (
                            <li
                                key={note.id}
                                className="p-3 bg-primary/15 rounded-md border border-gray-200 hover:shadow-sm transition-shadow"
                            >
                                <div className="flex justify-between items-start">
                                    <p className="whitespace-pre-wrap text-gray-800">{note.noiDung}</p>
                                    <button
                                        onClick={() => handleDeleteNote(note.id)}
                                        className="ml-2 text-red-500 hover:text-red-600 transition-colors p-1"
                                        title="Xóa ghi chú"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>
                                <div className="text-xs text-gray-500 mt-2 flex items-center">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="h-3 w-3 mr-1"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                        />
                                    </svg>
                                    {formatDate(note.createdAt)}
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
};

export default NoteArea;
