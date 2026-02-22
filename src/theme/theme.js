import { createTheme } from "@mui/material/styles";

const baseOptions = {
    typography: {
        fontFamily: '"Outfit", "Inter", "Roboto", "Helvetica", "Arial", sans-serif',
        h1: { fontWeight: 700 },
        h2: { fontWeight: 700 },
        h3: { fontWeight: 600 },
        h4: { fontWeight: 600 },
        h5: { fontWeight: 600 },
        h6: { fontWeight: 600 },
        button: { textTransform: "none", fontWeight: 600 },
    },
    shape: {
        borderRadius: 12,
    },
};

const palettes = {
    ocean: {
        primary: { main: "#3b82f6", light: "#60a5fa", dark: "#2563eb", contrastText: "#fff" },
        secondary: { main: "#14b8a6", light: "#2dd4bf", dark: "#0d9488" },
    },
    forest: {
        primary: { main: "#22c55e", light: "#4ade80", dark: "#16a34a", contrastText: "#fff" },
        secondary: { main: "#f59e0b", light: "#fbbf24", dark: "#d97706" },
    },
    sunset: {
        primary: { main: "#f97316", light: "#fb923c", dark: "#ea580c", contrastText: "#fff" },
        secondary: { main: "#e11d48", light: "#f43f5e", dark: "#be123c" },
    },
    midnight: {
        primary: { main: "#8b5cf6", light: "#a78bfa", dark: "#7c3aed", contrastText: "#fff" },
        secondary: { main: "#ec4899", light: "#f472b6", dark: "#db2777" },
    },
};

export const getTheme = (mode, color) => {
    const selectedPalette = palettes[color] || palettes.ocean;
    const isDark = mode === "dark";

    return createTheme({
        ...baseOptions,
        palette: {
            mode,
            ...selectedPalette,
            background: {
                default: isDark ? "#0f172a" : "#f1f5f9",
                paper: isDark ? "#1e293b" : "#ffffff",
            },
            text: {
                primary: isDark ? "#f1f5f9" : "#0f172a",
                secondary: isDark ? "#94a3b8" : "#64748b",
            },
            divider: isDark ? "rgba(148, 163, 184, 0.12)" : "rgba(0, 0, 0, 0.08)",
            success: { main: "#22c55e", light: "#4ade80", dark: "#16a34a" },
            warning: { main: "#f59e0b", light: "#fbbf24", dark: "#d97706" },
            error: { main: "#ef4444", light: "#f87171", dark: "#dc2626" },
            info: { main: "#0ea5e9", light: "#38bdf8", dark: "#0284c7" },
        },
        components: {
            MuiCssBaseline: {
                styleOverrides: {
                    body: {
                        scrollbarWidth: "thin",
                        "&::-webkit-scrollbar": { width: "6px", height: "6px" },
                        "&::-webkit-scrollbar-track": { background: "transparent" },
                        "&::-webkit-scrollbar-thumb": {
                            background: isDark ? "rgba(148, 163, 184, 0.3)" : "rgba(0, 0, 0, 0.15)",
                            borderRadius: "3px",
                        },
                    },
                },
            },
            MuiButton: {
                styleOverrides: {
                    root: {
                        borderRadius: 10,
                        padding: "8px 20px",
                        fontWeight: 600,
                    },
                },
            },
            MuiCard: {
                styleOverrides: {
                    root: {
                        borderRadius: 16,
                        backgroundImage: "none",
                        boxShadow: isDark
                            ? "0 4px 6px -1px rgba(0, 0, 0, 0.5)"
                            : "0 1px 3px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0, 0, 0, 0.04)",
                    },
                },
            },
            MuiOutlinedInput: {
                styleOverrides: {
                    root: {
                        borderRadius: 10,
                        "& .MuiOutlinedInput-notchedOutline": {
                            borderColor: isDark ? "rgba(148, 163, 184, 0.25)" : "rgba(0, 0, 0, 0.15)",
                        },
                        "&:hover .MuiOutlinedInput-notchedOutline": {
                            borderColor: selectedPalette.primary.main,
                        },
                        "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                            borderColor: selectedPalette.primary.main,
                        },
                    },
                },
            },
            MuiInputLabel: {
                styleOverrides: {
                    root: {
                        color: isDark ? "#94a3b8" : "#64748b",
                        "&.Mui-focused": {
                            color: selectedPalette.primary.main,
                        },
                    },
                },
            },
            MuiTableHead: {
                styleOverrides: {
                    root: {
                        "& .MuiTableCell-head": {
                            fontWeight: 700,
                            fontSize: "0.75rem",
                            textTransform: "uppercase",
                            letterSpacing: "0.06em",
                            color: isDark ? "#94a3b8" : "#64748b",
                            backgroundColor: isDark ? "rgba(30, 41, 59, 0.9)" : "rgba(241, 245, 249, 0.8)",
                            borderBottomColor: isDark ? "rgba(148, 163, 184, 0.12)" : "rgba(0, 0, 0, 0.08)",
                            padding: "14px 16px",
                        },
                    },
                },
            },
            MuiTableCell: {
                styleOverrides: {
                    root: {
                        borderBottomColor: isDark ? "rgba(148, 163, 184, 0.08)" : "rgba(0, 0, 0, 0.06)",
                        padding: "12px 16px",
                    },
                },
            },
            MuiTableRow: {
                styleOverrides: {
                    root: {
                        "&.MuiTableRow-hover:hover": {
                            backgroundColor: isDark
                                ? `${selectedPalette.primary.main}08`
                                : `${selectedPalette.primary.main}04`,
                        },
                    },
                },
            },
            MuiDrawer: {
                styleOverrides: {
                    paper: {
                        backgroundColor: isDark ? "#0f172a" : "#ffffff",
                        backgroundImage: "none",
                    },
                },
            },
            MuiDialog: {
                styleOverrides: {
                    paper: {
                        borderRadius: 16,
                        backgroundImage: "none",
                        backgroundColor: isDark ? "#1e293b" : "#ffffff",
                    },
                },
            },
            MuiChip: {
                styleOverrides: {
                    root: {
                        fontWeight: 600,
                        borderRadius: 8,
                    },
                },
            },
            MuiSelect: {
                styleOverrides: {
                    root: {
                        borderRadius: 10,
                    },
                },
            },
            MuiPaper: {
                styleOverrides: {
                    root: {
                        backgroundImage: "none",
                    },
                },
            },
            MuiSwitch: {
                styleOverrides: {
                    root: {
                        "& .MuiSwitch-switchBase.Mui-checked": {
                            color: selectedPalette.primary.main,
                        },
                        "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
                            backgroundColor: selectedPalette.primary.main,
                        },
                    },
                },
            },
        },
    });
};
