import React from "react";
import BlogEditor from "./components/BlogEditor";
import { ReturnButton } from "@components";

const NewBlog = () => {
    return (
        <section className="flex-1 flex flex-col h-full">
            <div className="px-4 pt-2 pb-8 flex flex-1 flex-col">
                <ReturnButton value="Quay lại" />
                <BlogEditor />
            </div>
        </section>
    );
};

export default NewBlog;
