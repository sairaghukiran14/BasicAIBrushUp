"use client";

import { useCallback, useSyncExternalStore } from "react";

type Mode = "light" | "dark";

const listeners = new Set<() => void>();

function subscribe(onChange: () => void) {
  listeners.add(onChange);
  const mq = window.matchMedia("(prefers-color-scheme: dark)");
  mq.addEventListener("change", onChange);
  return () => {
    listeners.delete(onChange);
    mq.removeEventListener("change", onChange);
  };
}

// The <html data-theme> attribute is the source of truth — it is set before
// first paint by the inline script in the root layout.
function readMode(): Mode {
  const attr = document.documentElement.getAttribute("data-theme");
  if (attr === "light" || attr === "dark") return attr;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function serverMode(): Mode {
  return "light";
}

export default function ThemeToggle() {
  const mode = useSyncExternalStore(subscribe, readMode, serverMode);

  const toggle = useCallback(() => {
    const next: Mode = readMode() === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    try {
      window.localStorage.setItem("rfm-theme", next);
    } catch {
      /* private mode — the choice just does not persist */
    }
    listeners.forEach((l) => l());
  }, []);

  const isDark = mode === "dark";

  return (
    <button
      type="button"
      className="icon-btn"
      onClick={toggle}
      aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
      title={isDark ? "Light theme" : "Dark theme"}
    >
      {isDark ? (
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
          <circle cx="12" cy="12" r="4.2" />
          <path
            d="M12 2.5v2.2M12 19.3v2.2M2.5 12h2.2M19.3 12h2.2M5.2 5.2l1.6 1.6M17.2 17.2l1.6 1.6M18.8 5.2l-1.6 1.6M6.8 17.2l-1.6 1.6"
            strokeLinecap="round"
          />
        </svg>
      ) : (
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
          <path d="M20 14.2A8.2 8.2 0 0 1 9.8 4a8.4 8.4 0 1 0 10.2 10.2z" strokeLinejoin="round" />
        </svg>
      )}
    </button>
  );
}
