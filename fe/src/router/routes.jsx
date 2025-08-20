import { createBrowserRouter } from "react-router-dom";
import { lazy, Suspense } from "react";
import MainLayout from "../layout/MainLayout";
import AdminLayout from "../layout/AdminLayout";
import { RequireAuth, RequireAdmin, RequireGuest } from "../middlewares/ProtectedRoute";

const Home = lazy(() => import("@pages").then((module) => ({ default: module.Home })));
const Group = lazy(() => import("@pages").then((module) => ({ default: module.Group })));
const Forum = lazy(() => import("@pages").then((module) => ({ default: module.Forum })));
const Login = lazy(() => import("@pages").then((module) => ({ default: module.Login })));
const SignUp = lazy(() => import("@pages").then((module) => ({ default: module.SignUp })));
const CourseDetail = lazy(() => import("@pages").then((module) => ({ default: module.CourseDetail })));
const CourseLessons = lazy(() => import("@pages").then((module) => ({ default: module.CourseLessons })));
const NewBlog = lazy(() => import("@pages").then((module) => ({ default: module.NewBlog })));
const Blog = lazy(() => import("@pages").then((module) => ({ default: module.Blog })));
const BlogCMS = lazy(() => import("@pages").then((module) => ({ default: module.BlogCMS })));
const UserCMS = lazy(() => import("@pages").then((module) => ({ default: module.UserCMS })));
const GroupCMS = lazy(() => import("@pages").then((module) => ({ default: module.GroupCMS })));
const CourseCMS = lazy(() => import("@pages").then((module) => ({ default: module.CourseCMS })));
const TransactionCMS = lazy(() => import("@pages").then((module) => ({ default: module.TransactionCMS })));
const DashBoard = lazy(() => import("@pages").then((module) => ({ default: module.DashBoard })));
const Google = lazy(() => import("@pages").then((module) => ({ default: module.Google })));
const Facebook = lazy(() => import("@pages").then((module) => ({ default: module.Facebook })));
const VideoCall = lazy(() => import("@pages").then((module) => ({ default: module.VideoCall })));
const PaymentSuccess = lazy(() => import("@pages").then((module) => ({ default: module.PaymentSuccess })));
const VerifyEmail = lazy(() => import("@pages").then((module) => ({ default: module.VerifyEmail })));
const ResetPassword = lazy(() => import("@pages").then((module) => ({ default: module.ResetPassword })));
const Me = lazy(() => import("@pages").then((module) => ({ default: module.Me })));
const MyBlog = lazy(() => import("@pages").then((module) => ({ default: module.MyBlog })));
const MyCourse = lazy(() => import("@pages").then((module) => ({ default: module.MyCourse })));

const LoadingSpinner = () => (
    <div className="flex items-center justify-center flex-1">
        <div className="flex-col gap-4 w-full flex items-center justify-center">
            <div className="w-12 h-12 border-4 text-blue-400 text-xl animate-spin border-gray-300 flex items-center justify-center border-t-blue-400 rounded-full">
                <svg viewBox="0 0 24 24" fill="currentColor" height="1em" width="1em" className="animate-ping">
                    <path d="M12.001 4.8c-3.2 0-5.2 1.6-6 4.8 1.2-1.6 2.6-2.2 4.2-1.8.913.228 1.565.89 2.288 1.624C13.666 10.618 15.027 12 18.001 12c3.2 0 5.2-1.6 6-4.8-1.2 1.6-2.6 2.2-4.2 1.8-.913-.228-1.565-.89-2.288-1.624C16.337 6.182 14.976 4.8 12.001 4.8zm-6 7.2c-3.2 0-5.2 1.6-6 4.8 1.2-1.6 2.6-2.2 4.2-1.8.913.228 1.565.89 2.288 1.624 1.177 1.194 2.538 2.576 5.512 2.576 3.2 0 5.2-1.6 6-4.8-1.2 1.6-2.6 2.2-4.2 1.8-.913-.228-1.565-.89-2.288-1.624C10.337 13.382 8.976 12 6.001 12z"></path>
                </svg>
            </div>
        </div>
    </div>
);

const LazyWrapper = ({ children }) => <Suspense fallback={<LoadingSpinner />}>{children}</Suspense>;

export const routes = createBrowserRouter([
    {
        path: "/",
        element: <MainLayout />,
        children: [
            {
                path: "/",
                element: (
                    <LazyWrapper>
                        <Home />
                    </LazyWrapper>
                ),
            },
            {
                path: "/khoa-hoc/:id",
                element: (
                    <LazyWrapper>
                        <CourseDetail />
                    </LazyWrapper>
                ),
            },
            {
                path: "/bai-viet",
                element: (
                    <LazyWrapper>
                        <Forum />
                    </LazyWrapper>
                ),
            },
            {
                path: "/bai-viet/:id",
                element: (
                    <LazyWrapper>
                        <Blog />
                    </LazyWrapper>
                ),
            },
            {
                path: "/nhom-hoc-tap",
                element: (
                    <RequireAuth>
                        <LazyWrapper>
                            <Group />
                        </LazyWrapper>
                    </RequireAuth>
                ),
            },
            {
                path: "/bai-viet-moi",
                element: (
                    <RequireAuth>
                        <LazyWrapper>
                            <NewBlog />
                        </LazyWrapper>
                    </RequireAuth>
                ),
            },
            {
                path: "/khoa-hoc/:id/bai-giang",
                element: (
                    <RequireAuth>
                        <LazyWrapper>
                            <CourseLessons />
                        </LazyWrapper>
                    </RequireAuth>
                ),
            },
            {
                path: "me/bai-viet",
                element: (
                    <RequireAuth>
                        <LazyWrapper>
                            <MyBlog />
                        </LazyWrapper>
                    </RequireAuth>
                ),
            },
            {
                path: "me/bai-viet/:id",
                element: (
                    <RequireAuth>
                        <LazyWrapper>
                            <MyBlog />
                        </LazyWrapper>
                    </RequireAuth>
                ),
            },
            {
                path: "me/khoa-hoc",
                element: (
                    <RequireAuth>
                        <LazyWrapper>
                            <MyCourse />
                        </LazyWrapper>
                    </RequireAuth>
                ),
                children: [
                    {
                        path: ":id",
                        element: (
                            <RequireAuth>
                                <LazyWrapper>
                                    <MyCourse />
                                </LazyWrapper>
                            </RequireAuth>
                        ),
                    },
                ],
            },

            //OAuth callback
            {
                path: "/auth/google/callback",
                element: (
                    <LazyWrapper>
                        <Google />
                    </LazyWrapper>
                ),
            },
            {
                path: "/auth/facebook/callback",
                element: (
                    <LazyWrapper>
                        <Facebook />
                    </LazyWrapper>
                ),
            },
        ],
    },
    {
        path: "/video-call",
        element: (
            <RequireAuth>
                <LazyWrapper>
                    <VideoCall />
                </LazyWrapper>
            </RequireAuth>
        ),
    },
    {
        path: "/me",
        element: (
            <RequireAuth>
                <LazyWrapper>
                    <Me />
                </LazyWrapper>
            </RequireAuth>
        ),
    },
    {
        path: "/payment-success",
        element: (
            <RequireAuth>
                <LazyWrapper>
                    <PaymentSuccess />
                </LazyWrapper>
            </RequireAuth>
        ),
    },

    {
        path: "/dang-nhap",
        element: (
            <RequireGuest>
                <LazyWrapper>
                    <Login />
                </LazyWrapper>
            </RequireGuest>
        ),
    },
    {
        path: "/dang-ky",
        element: (
            <RequireGuest>
                <LazyWrapper>
                    <SignUp />
                </LazyWrapper>
            </RequireGuest>
        ),
    },
    {
        path: "/auth/reset-password",
        element: (
            <LazyWrapper>
                <ResetPassword />
            </LazyWrapper>
        ),
    },
    {
        path: "/auth/verify-email",
        element: (
            <LazyWrapper>
                <VerifyEmail />
            </LazyWrapper>
        ),
    },

    //Admin routes
    {
        path: "/admin",
        element: (
            <RequireAdmin>
                <AdminLayout />
            </RequireAdmin>
        ),
        children: [
            {
                path: "",
                element: (
                    <LazyWrapper>
                        <DashBoard />
                    </LazyWrapper>
                ),
            },
            {
                path: "quan-ly-nguoi-dung",
                element: (
                    <LazyWrapper>
                        <UserCMS />
                    </LazyWrapper>
                ),
            },
            {
                path: "quan-ly-nguoi-dung/:id",
                element: (
                    <LazyWrapper>
                        <UserCMS />
                    </LazyWrapper>
                ),
            },
            {
                path: "quan-ly-nhom",
                element: (
                    <LazyWrapper>
                        <GroupCMS />
                    </LazyWrapper>
                ),
            },
            {
                path: "quan-ly-nhom/:id",
                element: (
                    <LazyWrapper>
                        <GroupCMS />
                    </LazyWrapper>
                ),
            },
            {
                path: "quan-ly-khoa-hoc",
                element: (
                    <LazyWrapper>
                        <CourseCMS />
                    </LazyWrapper>
                ),
            },
            {
                path: "quan-ly-khoa-hoc/:id",
                element: (
                    <LazyWrapper>
                        <CourseCMS />
                    </LazyWrapper>
                ),
            },
            {
                path: "quan-ly-bai-dang",
                element: (
                    <LazyWrapper>
                        <BlogCMS />
                    </LazyWrapper>
                ),
            },
            {
                path: "quan-ly-bai-dang/:id",
                element: (
                    <LazyWrapper>
                        <BlogCMS />
                    </LazyWrapper>
                ),
            },
            {
                path: "quan-ly-giao-dich",
                element: (
                    <LazyWrapper>
                        <TransactionCMS />
                    </LazyWrapper>
                ),
            },
            {
                path: "quan-ly-giao-dich/:id",
                element: (
                    <LazyWrapper>
                        <TransactionCMS />
                    </LazyWrapper>
                ),
            },
        ],
    },
]);
