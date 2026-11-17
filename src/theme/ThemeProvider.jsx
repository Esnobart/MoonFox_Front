import { useCallback, useEffect, useLayoutEffect, useMemo, useState } from "react";

import { ThemeContext } from "./ThemeContext.js";
import {
  normalizeThemePreference,
  readThemePreference,
  resolveTheme,
  THEME_STORAGE_KEY,
} from "./theme.js";

const systemThemeQuery = "(prefers-color-scheme: dark)";
const getSystemTheme = () =>
  window.matchMedia(systemThemeQuery).matches ? "dark" : "light";

export default function ThemeProvider({ children }) {
  const [preference, setPreference] = useState(readThemePreference);
  const [systemTheme, setSystemTheme] = useState(getSystemTheme);
  const [now, setNow] = useState(() => new Date());
  const resolvedTheme = resolveTheme(preference, systemTheme, now);

  useLayoutEffect(() => {
    document.documentElement.dataset.theme = resolvedTheme;
    document.documentElement.dataset.themePreference = preference;
  }, [preference, resolvedTheme]);

  useEffect(() => {
    const media = window.matchMedia(systemThemeQuery);
    let clockTimeout;

    const handleSystemChange = (event) => {
      setSystemTheme(event.matches ? "dark" : "light");
    };

    // Align with local minute boundaries, including 07:00 and 19:00.
    const scheduleClockUpdate = () => {
      const currentTime = new Date();
      const delay = 60_000 - (currentTime.getSeconds() * 1000 + currentTime.getMilliseconds());
      clockTimeout = window.setTimeout(() => {
        setNow(new Date());
        scheduleClockUpdate();
      }, delay);
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        setNow(new Date());
        setSystemTheme(getSystemTheme());
        window.clearTimeout(clockTimeout);
        scheduleClockUpdate();
      }
    };

    const handleStorage = (event) => {
      if (event.key === THEME_STORAGE_KEY || event.key === null) {
        setPreference(normalizeThemePreference(event.newValue));
        setNow(new Date());
      }
    };

    media.addEventListener("change", handleSystemChange);
    window.addEventListener("storage", handleStorage);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    scheduleClockUpdate();

    return () => {
      media.removeEventListener("change", handleSystemChange);
      window.removeEventListener("storage", handleStorage);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.clearTimeout(clockTimeout);
    };
  }, []);

  const changePreference = useCallback((value) => {
    const nextPreference = normalizeThemePreference(value);
    setPreference(nextPreference);
    setNow(new Date());

    try {
      localStorage.setItem(THEME_STORAGE_KEY, nextPreference);
    } catch {
      // The current tab still works when browser storage is unavailable.
    }
  }, []);

  const value = useMemo(
    () => ({ preference, resolvedTheme, setPreference: changePreference }),
    [preference, resolvedTheme, changePreference],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
