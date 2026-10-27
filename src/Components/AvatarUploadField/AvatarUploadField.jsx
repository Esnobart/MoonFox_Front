import { useEffect, useId, useRef, useState } from "react";

import css from "./AvatarUploadField.module.css";

const acceptedTypes = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
];
const maxFileSize = 10 * 1024 * 1024;

function AvatarUploadField({ value, onChange, username, disabled }) {
  const inputRef = useRef(null);
  const previewUrls = useRef(new Set());
  const fieldId = useId();
  const [error, setError] = useState("");

  useEffect(() => {
    const urls = previewUrls.current;
    return () => {
      urls.forEach((url) => URL.revokeObjectURL(url));
      urls.clear();
    };
  }, []);

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    if (!acceptedTypes.includes(file.type)) {
      setError("Choose a JPG, PNG, WebP, GIF or AVIF image.");
      return;
    }
    if (file.size === 0 || file.size > maxFileSize) {
      setError("Choose a photo that is not empty and is 10 MiB or smaller.");
      return;
    }

    const url = URL.createObjectURL(file);
    previewUrls.current.add(url);
    onChange({ url, file });
    if (value?.url && previewUrls.current.delete(value.url)) {
      URL.revokeObjectURL(value.url);
    }
    setError("");
  };

  return (
    <div className={css.field}>
      <span className={css.label}>Avatar</span>
      <input
        ref={inputRef}
        type="file"
        accept={acceptedTypes.join(",")}
        onChange={handleFileChange}
        disabled={disabled}
        aria-label="Choose avatar"
        hidden
      />
      <button
        type="button"
        className={css.avatar}
        onClick={() => inputRef.current?.click()}
        disabled={disabled}
        aria-label="Edit avatar"
        aria-describedby={`${fieldId}-hint${error ? ` ${fieldId}-error` : ""}`}
      >
        {value?.url ? (
          <img src={value.url} alt="Avatar preview" />
        ) : (
          <span className={css.initial} aria-hidden="true">
            {username?.trim().charAt(0).toUpperCase() || "?"}
          </span>
        )}
        <span className={css.overlay} aria-hidden="true">
          Edit
        </span>
      </button>
      <p id={`${fieldId}-hint`} className={css.hint}>
        Click your avatar to choose a photo.
        <br />
        JPG, PNG, WebP, GIF or AVIF. Up to 10 MiB.
      </p>
      {error && (
        <p id={`${fieldId}-error`} className={css.error} role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

export default AvatarUploadField;
