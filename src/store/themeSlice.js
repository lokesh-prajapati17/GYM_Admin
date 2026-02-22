import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    mode: localStorage.getItem("themeMode") || "dark",
    color: localStorage.getItem("themeColor") || "ocean",
};

const themeSlice = createSlice({
    name: "theme",
    initialState,
    reducers: {
        toggleMode: (state) => {
            state.mode = state.mode === "light" ? "dark" : "light";
            localStorage.setItem("themeMode", state.mode);
        },
        setMode: (state, action) => {
            state.mode = action.payload;
            localStorage.setItem("themeMode", state.mode);
        },
        setColor: (state, action) => {
            state.color = action.payload;
            localStorage.setItem("themeColor", state.color);
        },
    },
});

export const { toggleMode, setMode, setColor } = themeSlice.actions;
export default themeSlice.reducer;
