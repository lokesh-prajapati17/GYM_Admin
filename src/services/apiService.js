import axios from "axios";
import store from "../store";
import { logout } from "../store/authSlice";
import { BASE_URL } from "./constants";

const api = axios.create({
    baseURL: BASE_URL,
    headers: {
        "Content-Type": "application/json",
    },
});

api.interceptors.request.use(
    (config) => {
        const token = store.getState().auth.token;
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (error.response && error.response.status === 401) {
            const msg = error.response.data?.message || "";
            // Only logout on real token failures, not RBAC/permission denials
            const isTokenFailure =
                msg.includes("no token") ||
                msg.includes("token failed") ||
                msg.includes("not found or inactive");
            if (isTokenFailure) {
                store.dispatch(logout());
                window.location.href = "/login";
            }
        }
        return Promise.reject(error);
    }
);

export default api;
