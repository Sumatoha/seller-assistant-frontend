import { create } from "zustand";

type Theme = "light" | "dark";

interface ThemeStore {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const applyTheme = (theme: Theme) => {
  if (typeof window === "undefined") return;

  const root = document.documentElement;
  if (theme === "dark") {
    root.classList.add("dark");
  } else {
    root.classList.remove("dark");
  }

  localStorage.setItem("theme", theme);
};

const getInitialTheme = (): Theme => {
  if (typeof window === "undefined") return "dark";

  const stored = localStorage.getItem("theme") as Theme | null;
  if (stored === "light" || stored === "dark") {
    return stored;
  }

  // Default to dark theme
  return "dark";
};

export const useThemeStore = create<ThemeStore>((set) => {
  // Initialize theme on mount
  if (typeof window !== "undefined") {
    const initialTheme = getInitialTheme();
    applyTheme(initialTheme);
  }

  return {
    theme: typeof window !== "undefined" ? getInitialTheme() : "dark",
    setTheme: (theme) => {
      applyTheme(theme);
      set({ theme });
    },
    toggleTheme: () => {
      set((state) => {
        const newTheme = state.theme === "dark" ? "light" : "dark";
        applyTheme(newTheme);
        return { theme: newTheme };
      });
    },
  };
});
