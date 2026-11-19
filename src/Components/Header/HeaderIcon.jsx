export default function HeaderIcon({ name }) {
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
      {name === "user" && (
        <>
          <circle cx="12" cy="7.5" r="3.5" />
          <path d="M4.5 21v-2a6.5 6.5 0 0 1 6.5-6.5h2a6.5 6.5 0 0 1 6.5 6.5v2Z" />
        </>
      )}
      {name === "basket" && (
        <path d="m7 9 5-6 5 6M3 9h18l-2 11H5ZM9 12l.5 5m5.5-5-.5 5" />
      )}
      {name === "system" && (
        <>
          <rect x="3" y="4" width="18" height="12" rx="2" />
          <path d="M8 20h8m-4-4v4" />
        </>
      )}
      {name === "light" && (
        <>
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5" />
        </>
      )}
      {name === "dark" && (
        <path d="M20.5 13a8.5 8.5 0 0 1-9.5-9.5A8.5 8.5 0 1 0 20.5 13Z" />
      )}
      {name === "schedule" && (
        <>
          <circle cx="12" cy="12" r="9" />
          <path d="M12 7v5l3 2" />
        </>
      )}
    </svg>
  );
}
