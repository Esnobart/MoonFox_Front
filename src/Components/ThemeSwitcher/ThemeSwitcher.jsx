import { useEffect, useId, useRef, useState } from "react";

import { useTheme } from "../../theme/ThemeContext.js";
import css from "./ThemeSwitcher.module.css";

const options = [
  { value: "system", label: "System", description: "Follow your device" },
  { value: "light", label: "Light", description: "A brighter appearance" },
  { value: "dark", label: "Dark", description: "Easy on the eyes" },
  {
    value: "schedule",
    label: "Scheduled",
    description: "Light from 07:00 to 19:00",
  },
];

function ThemeIcon({ mode }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {mode === "system" && (
        <>
          <rect x="3" y="4" width="18" height="12" rx="2" />
          <path d="M8 20h8m-4-4v4" />
        </>
      )}
      {mode === "light" && (
        <>
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5" />
        </>
      )}
      {mode === "dark" && (
        <path d="M20.5 13a8.5 8.5 0 0 1-9.5-9.5A8.5 8.5 0 1 0 20.5 13Z" />
      )}
      {mode === "schedule" && (
        <>
          <circle cx="12" cy="12" r="9" />
          <path d="M12 7v5l3 2" />
        </>
      )}
    </svg>
  );
}

export default function ThemeSwitcher() {
  const { preference, resolvedTheme, setPreference } = useTheme();
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);
  const triggerRef = useRef(null);
  const panelRef = useRef(null);
  const panelId = useId();
  const selected = options.find((option) => option.value === preference);

  useEffect(() => {
    if (!open) return;

    panelRef.current?.querySelector("input:checked")?.focus();

    const handlePointerDown = (event) => {
      if (!rootRef.current?.contains(event.target)) setOpen(false);
    };

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [open]);

  const handleKeyDown = (event) => {
    if (event.key === "Escape" && open) {
      event.preventDefault();
      event.stopPropagation();
      setOpen(false);
      triggerRef.current?.focus();
    }
  };

  return (
    <div
      className={css.switcher}
      ref={rootRef}
      onKeyDown={handleKeyDown}
      onBlur={(event) => {
        if (
          event.relatedTarget &&
          !event.currentTarget.contains(event.relatedTarget)
        ) {
          setOpen(false);
        }
      }}
    >
      <button
        type="button"
        ref={triggerRef}
        className={css.trigger}
        aria-label={`Appearance: ${selected.label}, ${resolvedTheme} theme`}
        aria-expanded={open}
        aria-controls={open ? panelId : undefined}
        title="Change appearance"
        onClick={() => setOpen((value) => !value)}
      >
        <ThemeIcon mode={preference} />
      </button>

      {open && (
        <div className={css.panel} id={panelId} ref={panelRef}>
          <fieldset className={css.options}>
            <legend className={css.title}>Appearance</legend>
            {options.map((option) => (
              <label key={option.value} className={css.option}>
                <input
                  type="radio"
                  name={`${panelId}-theme`}
                  value={option.value}
                  checked={preference === option.value}
                  onChange={() => setPreference(option.value)}
                />
                <span className={css.optionIcon}>
                  <ThemeIcon mode={option.value} />
                </span>
                <span className={css.optionText}>
                  <span className={css.label}>{option.label}</span>
                  <span className={css.description}>{option.description}</span>
                </span>
                <span className={css.check} aria-hidden="true">
                  ✓
                </span>
              </label>
            ))}
          </fieldset>
          <p className={css.note}>Scheduled times use your local time.</p>
        </div>
      )}
    </div>
  );
}
