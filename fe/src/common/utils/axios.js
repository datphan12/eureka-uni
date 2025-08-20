import axios from "axios";

const API = axios.create({
    baseURL: import.meta.env.VITE_NESTJS_API_URL || "http://localhost:3000",
    withCredentials: true,
});

API.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("accessToken");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

let isRefreshing = false;
let failedQueue = [];

const processQueue = (token) => {
    failedQueue.forEach((prom) => {
        prom.resolve(token);
    });
    failedQueue = [];
};

API.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (
            error.response?.status === 401 &&
            !originalRequest._retry &&
            !originalRequest.url.includes("/auth/refresh-token")
        ) {
            console.log("error.response?.status", error.response?.status);
            originalRequest._retry = true;

            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({
                        resolve: (token) => {
                            originalRequest.headers.Authorization = "Bearer " + token;
                            resolve(API(originalRequest));
                        },
                        reject,
                    });
                });
            }

            isRefreshing = true;

            try {
                console.log("originalRequest.url", originalRequest.url);
                const res = await API.post("/auth/refresh-token");
                console.log("res.", res.data);
                const newToken = res.data?.accessToken;
                if (!newToken) {
                    throw new Error("Không nhận được access token!");
                }

                localStorage.setItem("accessToken", newToken);
                API.defaults.headers.common["Authorization"] = `Bearer ${newToken}`;
                processQueue(newToken);

                return API(originalRequest);
            } catch (err) {
                console.log("err", err.response);
                failedQueue = [];
                localStorage.removeItem("accessToken");
                if (err.response?.status !== 500) {
                    window.location.href = "/dang-nhap";
                }
                return Promise.reject(err);
            } finally {
                isRefreshing = false;
            }
        }

        return Promise.reject(error);
    }
);

export default API;
