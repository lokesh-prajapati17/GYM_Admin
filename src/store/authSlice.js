import { createSlice } from "@reduxjs/toolkit";
import { encryptData, decryptData } from "../utils/cryptoUtils";

const initialState = {
    user: decryptData(localStorage.getItem("adminUser"), true) || null,
    token: decryptData(localStorage.getItem("adminToken")) || null,
    isAuthenticated: !!localStorage.getItem("adminToken"),
};

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        loginSuccess: (state, action) => {
            state.user = action.payload.user;
            state.token = action.payload.token;
            state.isAuthenticated = true;
            localStorage.setItem("adminUser", encryptData(action.payload.user));
            localStorage.setItem("adminToken", encryptData(action.payload.token));
        },
        logout: (state) => {
            state.user = null;
            state.token = null;
            state.isAuthenticated = false;
            localStorage.removeItem("adminUser");
            localStorage.removeItem("adminToken");
        },
        updateUser: (state, action) => {
            state.user = { ...state.user, ...action.payload };
            localStorage.setItem("adminUser", encryptData(state.user));
        },
    },
});

export const { loginSuccess, logout, updateUser } = authSlice.actions;
export default authSlice.reducer;
