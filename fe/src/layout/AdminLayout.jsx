import React from "react";
import { AdminSideBar } from "@components";
import { Outlet } from "react-router-dom";

const AdminLayout = () => {
    return (
        <div className="flex gap-x-4 min-h-screen py-2 px-2 bg-[#9197B3]/30">
            <AdminSideBar />
            <main className="flex-1 bg-white rounded-lg flex max-h-[calc(100vh-16px)]">
                <Outlet />
            </main>
        </div>
    );
};

export default AdminLayout;
