import { useEffect, useId, useRef, useState } from "react";

import { useTheme } from "../../theme/ThemeContext.js";
import HeaderIcon from "../Header/HeaderIcon.jsx";
import iconCss from "../Header/HeaderIconButton.module.css";
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
        className={iconCss.button}
        aria-label={`Appearance: ${selected.label}, ${resolvedTheme} theme`}
        aria-expanded={open}
        aria-controls={open ? panelId : undefined}
        title="Change appearance"
        onClick={() => setOpen((value) => !value)}
      >
        <HeaderIcon name={preference} />
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
                  <HeaderIcon name={option.value} />
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
