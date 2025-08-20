import { create } from "zustand";

const useRecommend = create((set) => ({
    // quản lý lấy khóa học đề xuất
    courseRecommend: [],
    setCourseRecommend: (courses) => set({ courseRecommend: courses }),
    fetchedCourses: false,
    setFetchedCourses: (status) => set({ fetchedCourses: status }),

    //quản lý lấy nhóm học tập đề xuất
    groupRecommend: [],
    setGroupRecommend: (groups) => set({ groupRecommend: groups }),
    fetchedGroups: false,
    setFetchedGroups: (status) => set({ fetchedGroups: status }),

    clearRecommendations: () => set({ courseRecommend: [], groupRecommend: [] }),
}));

export default useRecommend;
