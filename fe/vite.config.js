import path from "path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
    plugins: [react(), tailwindcss()],
    define: {
        "process.env": {},
    },
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./src"),
            "@components": path.resolve(__dirname, "./src/components"),
            "@pages": path.resolve(__dirname, "./src/pages"),
            "@hooks": path.resolve(__dirname, "./src/hooks"),
            "@utils": path.resolve(__dirname, "./src/common/utils"),
            "@common": path.resolve(__dirname, "./src/common"),
            "@assets": path.resolve(__dirname, "./src/assets"),
            "@types": path.resolve(__dirname, "./src/common/types"),
            "@constants": path.resolve(__dirname, "./src/common/constants"),
            "@store": path.resolve(__dirname, "./src/store"),
            "@helpers": path.resolve(__dirname, "./src/common/helpers"),
        },
    },
});
