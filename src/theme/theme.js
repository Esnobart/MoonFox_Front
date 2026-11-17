export const THEME_STORAGE_KEY = "moonfox-theme";
export const THEME_PREFERENCES = ["system", "light", "dark", "schedule"];

export function normalizeThemePreference(value) {
  return THEME_PREFERENCES.includes(value) ? value : "system";
}

export function readThemePreference() {
  try {
    return normalizeThemePreference(localStorage.getItem(THEME_STORAGE_KEY));
  } catch {
    return "system";
  }
}

export function resolveTheme(preference, systemTheme, date = new Date()) {
  switch (normalizeThemePreference(preference)) {
    case "light":
    case "dark":
      return preference;
    case "schedule":
      return date.getHours() >= 7 && date.getHours() < 19 ? "light" : "dark";
    default:
      return systemTheme === "dark" ? "dark" : "light";
  }
}
