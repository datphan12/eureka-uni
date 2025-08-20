import React from "react";
import { Header, Navigation } from "@components";
import { Outlet } from "react-router-dom";

const MainLayout = () => {
    return (
        <div className="flex flex-col min-h-screen relative">
            <Header />
            <div className="flex flex-1 mb-0 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
                <Navigation />
                <main className="flex-1 flex">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default MainLayout;
