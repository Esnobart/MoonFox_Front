import { useEffect, useId, useRef, useState } from "react";

import css from "./ImageUploadField.module.css";

const acceptedTypes = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
];
const maxFileSize = 10 * 1024 * 1024;

function ImageUploadField({ images, onChange, maxImages = 5, label = "Photos" }) {
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

  const handleFilesChange = (event) => {
    const files = Array.from(event.target.files || []);
    event.target.value = "";
    if (!files.length) return;

    const addedImages = [];
    const errors = new Set();

    files.forEach((file) => {
      if (!acceptedTypes.includes(file.type)) {
        errors.add("Choose JPG, PNG, WebP, GIF or AVIF images.");
        return;
      }

      if (file.size === 0) {
        errors.add("Choose a photo file that is not empty.");
        return;
      }

      if (file.size > maxFileSize) {
        errors.add("Each photo must be 10 MiB or smaller.");
        return;
      }

      if (images.length + addedImages.length >= maxImages) {
        errors.add(
          `You can add up to ${maxImages} photos. Extra files were skipped.`,
        );
        return;
      }

      const url = URL.createObjectURL(file);
      previewUrls.current.add(url);
      addedImages.push({ id: crypto.randomUUID(), url, file });
    });

    if (addedImages.length) {
      onChange([...images, ...addedImages]);
    }

    setError([...errors].join(" "));
  };

  const handleRemove = (imageId) => {
    const image = images.find((item) => item.id === imageId);

    if (image && previewUrls.current.delete(image.url)) {
      URL.revokeObjectURL(image.url);
    }

    onChange(images.filter((item) => item.id !== imageId));
    setError("");
  };

  return (
    <fieldset className={css.field} aria-describedby={`${fieldId}-hint`}>
      <legend className={css.legend}>{label}</legend>
      <p className={css.counter} role="status">
        {images.length} / {maxImages} photos
      </p>

      <input
        ref={inputRef}
        type="file"
        accept={acceptedTypes.join(",")}
        multiple={maxImages > 1}
        onChange={handleFilesChange}
        aria-label={`Choose ${label.toLowerCase()}`}
        hidden
      />

      <ul className={css.gallery}>
        {images.map((image, index) => (
          <li key={image.id} className={css.photo}>
            <img
              className={css.preview}
              src={image.url}
              alt={`Photo ${index + 1}`}
            />
            <button
              type="button"
              className={css.removeButton}
              onClick={() => handleRemove(image.id)}
              aria-label={`Remove photo ${index + 1}`}
            >
              Remove
            </button>
          </li>
        ))}

        {images.length < maxImages && (
          <li>
            <button
              type="button"
              className={css.addButton}
              onClick={() => inputRef.current?.click()}
            >
              <span className={css.plus} aria-hidden="true">
                +
              </span>
              <span>Add photo</span>
            </button>
          </li>
        )}
      </ul>

      <p id={`${fieldId}-hint`} className={css.hint}>
        JPG, PNG, WebP, GIF or AVIF. Up to 10 MiB per photo.
      </p>
      {error && (
        <p className={css.error} role="alert">
          {error}
        </p>
      )}
    </fieldset>
  );
}

export default ImageUploadField;
