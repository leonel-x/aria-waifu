import { useState, useEffect } from "react";

export type Theme = "water" | "mist" | "fire" | "aura" | "void" | "wind" | "smoke";

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(() => {
    const stored = localStorage.getItem("aria-theme");
    return (stored as Theme) || "aura";
  });

  useEffect(() => {
    localStorage.setItem("aria-theme", theme);
  }, [theme]);

  const changeTheme = (newTheme: Theme) => {
    setTheme(newTheme);
  };

  return {
    theme,
    changeTheme
  };
}
