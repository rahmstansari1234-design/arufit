import { useEffect, useState } from "react";

const LABELS = {
  appName: "Arufit",
  tagline: "Your daily life. Elevated.",
} as const;

const SESSION_KEY = "arufit-splash-shown";

export default function SplashScreen() {
  const [visible, setVisible] = useState(false);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem(SESSION_KEY)) return;
    sessionStorage.setItem(SESSION_KEY, "1");
    setVisible(true);

    const fadeTimer = setTimeout(() => setFading(true), 1800);
    const hideTimer = setTimeout(() => setVisible(false), 2400);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(hideTimer);
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      aria-label={`Loading ${LABELS.appName}`}
      data-ocid="splash.loading_state"
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white"
      style={{
        transition: "opacity 0.6s cubic-bezier(0.4, 0, 0.2, 1)",
        opacity: fading ? 0 : 1,
        pointerEvents: fading ? "none" : "auto",
      }}
    >
      {/* Brand name */}
      <h1
        className="relative z-10 animate-fade-up"
        style={{
          fontFamily: "var(--font-display)",
          fontWeight: 700,
          fontSize: "clamp(2.4rem, 8vw, 3.2rem)",
          letterSpacing: "-0.02em",
          lineHeight: 1,
          color: "#1A1A1A",
          animationDelay: "0.1s",
        }}
      >
        {LABELS.appName}
      </h1>

      {/* Soft green accent underline */}
      <div
        className="relative z-10 mt-3 animate-fade-up"
        style={{
          width: "3rem",
          height: "0.25rem",
          borderRadius: "9999px",
          backgroundColor: "#4CAF7D",
          animationDelay: "0.2s",
        }}
        aria-hidden="true"
      />

      {/* Tagline */}
      <p
        className="relative z-10 mt-4 animate-fade-up"
        style={{
          fontFamily: "var(--font-body)",
          fontWeight: 400,
          fontSize: "0.95rem",
          color: "#6B7280",
          letterSpacing: "0.02em",
          animationDelay: "0.3s",
        }}
      >
        {LABELS.tagline}
      </p>

      {/* Loading indicator dots */}
      <div
        className="relative z-10 flex gap-2 mt-12 animate-fade-up"
        style={{ animationDelay: "0.4s" }}
        aria-hidden="true"
      >
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="w-2 h-2 rounded-full"
            style={{
              backgroundColor: "#4CAF7D",
              opacity: 0.4,
              animation: `breathe-pulse 1.4s cubic-bezier(0.45, 0, 0.55, 1) ${i * 0.22}s infinite`,
            }}
          />
        ))}
      </div>
    </div>
  );
}
