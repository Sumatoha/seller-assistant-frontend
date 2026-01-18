"use client";

import { Moon, Sun } from "lucide-react";
import { useThemeStore } from "@/lib/theme-store";

export function ThemeToggle() {
  const { theme, toggleTheme } = useThemeStore();

  return (
    <button
      onClick={toggleTheme}
      className="rounded-lg p-2 hover:bg-muted transition-all hover:scale-105 active:scale-95"
      aria-label="Toggle theme"
    >
      {theme === "dark" ? (
        <Sun className="h-5 w-5 text-muted-foreground hover:text-foreground transition-transform duration-300 rotate-0" />
      ) : (
        <Moon className="h-5 w-5 text-muted-foreground hover:text-foreground transition-transform duration-300 rotate-0" />
      )}
    </button>
  );
}
