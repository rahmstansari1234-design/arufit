import typography from "@tailwindcss/typography";
import containerQueries from "@tailwindcss/container-queries";
import animate from "tailwindcss-animate";

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: ["index.html", "src/**/*.{js,ts,jsx,tsx,html,css}"],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "oklch(var(--border))",
        input: "oklch(var(--input))",
        ring: "oklch(var(--ring) / <alpha-value>)",
        background: "oklch(var(--background))",
        foreground: "oklch(var(--foreground))",
        primary: {
          DEFAULT: "oklch(var(--primary) / <alpha-value>)",
          foreground: "oklch(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "oklch(var(--secondary) / <alpha-value>)",
          foreground: "oklch(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "oklch(var(--destructive) / <alpha-value>)",
          foreground: "oklch(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "oklch(var(--muted) / <alpha-value>)",
          foreground: "oklch(var(--muted-foreground) / <alpha-value>)",
        },
        accent: {
          DEFAULT: "oklch(var(--accent) / <alpha-value>)",
          foreground: "oklch(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "oklch(var(--popover))",
          foreground: "oklch(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "oklch(var(--card))",
          foreground: "oklch(var(--card-foreground))",
        },
        chart: {
          1: "oklch(var(--chart-1))",
          2: "oklch(var(--chart-2))",
          3: "oklch(var(--chart-3))",
          4: "oklch(var(--chart-4))",
          5: "oklch(var(--chart-5))",
        },
        quest: {
          unlock: "oklch(var(--quest-unlock))",
          forest: "oklch(var(--quest-forest))",
          gold: "oklch(var(--quest-gold))",
          shadow: "oklch(var(--quest-shadow))",
        },
        tier: {
          gold: "oklch(var(--tier-gold))",
          silver: "oklch(var(--tier-silver))",
          bronze: "oklch(var(--tier-bronze))",
          neutral: "oklch(var(--tier-neutral))",
        },
        sidebar: {
          DEFAULT: "oklch(var(--sidebar))",
          foreground: "oklch(var(--sidebar-foreground))",
          primary: "oklch(var(--sidebar-primary))",
          "primary-foreground": "oklch(var(--sidebar-primary-foreground))",
          accent: "oklch(var(--sidebar-accent))",
          "accent-foreground": "oklch(var(--sidebar-accent-foreground))",
          border: "oklch(var(--sidebar-border))",
          ring: "oklch(var(--sidebar-ring))",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "Georgia", "serif"],
        body: ["var(--font-body)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      borderRadius: {
        sm: "0.5rem",
        DEFAULT: "0.75rem",
        md: "0.875rem",
        lg: "1.25rem",
        xl: "1.5rem",
        "2xl": "1.75rem",
        "3xl": "2.25rem",
        "4xl": "3rem",
      },
      boxShadow: {
        xs: "0 1px 2px 0 rgba(0,0,0,0.04)",
        subtle: "0 1px 3px 0 oklch(0.18 0.05 30 / 0.07), 0 1px 2px -1px oklch(0.18 0.05 30 / 0.05)",
        elevated: "0 4px 16px 0 oklch(0.18 0.05 30 / 0.10), 0 2px 6px -1px oklch(0.18 0.05 30 / 0.07)",
        warm: "0 4px 24px 0 oklch(0.58 0.16 33 / 0.14), 0 2px 8px -1px oklch(0.58 0.16 33 / 0.08)",
        saffron: "0 4px 24px 0 oklch(0.70 0.18 50 / 0.18), 0 2px 8px -1px oklch(0.70 0.18 50 / 0.10)",
        inner: "inset 0 2px 6px 0 oklch(0.18 0.05 30 / 0.06)",
        glass: "0 8px 32px 0 oklch(0.18 0.05 30 / 0.08), 0 2px 8px -1px oklch(0.18 0.05 30 / 0.04)",
        "glass-lg": "0 16px 48px 0 oklch(0.18 0.05 30 / 0.12), 0 4px 16px -2px oklch(0.58 0.16 33 / 0.08)",
        "focus-mode": "0 4px 24px 0 oklch(0.7 0.18 50 / 0.22), 0 2px 8px -1px oklch(0.7 0.18 50 / 0.12), inset 0 1px 2px oklch(0.7 0.18 50 / 0.08)",
        "gym-card": "0 8px 40px 0 oklch(0.58 0.16 33 / 0.15), 0 4px 16px -2px oklch(0.58 0.16 33 / 0.08)",
        card: '0 1px 3px 0 rgba(0, 0, 0, 0.08)',
        hover: '0 4px 12px 0 rgba(0, 0, 0, 0.12)',
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "fade-up": {
          from: { opacity: "0", transform: "translateY(10px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% center" },
          "100%": { backgroundPosition: "200% center" },
        },
        "pulse-ring": {
          "0%, 100%": { opacity: "0.35" },
          "50%": { opacity: "0.65" },
        },
        "slide-up": {
          from: { opacity: "0", transform: "translateY(16px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "scale-in": {
          from: { opacity: "0", transform: "scale(0.92)" },
          to: { opacity: "1", transform: "scale(1)" },
        },
        "soft-pop": {
          "0%": { transform: "scale(0.96)", opacity: "0" },
          "60%": { transform: "scale(1.02)", opacity: "1" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        "breathe-pulse": {
          "0%, 100%": { transform: "scale(1)", opacity: "0.9" },
          "50%": { transform: "scale(1.06)", opacity: "1" },
        },
        "bounce-subtle": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-6px)" },
        },
        "model-enter": {
          "0%": { opacity: "0", transform: "rotateX(10deg) scale(0.92)" },
          "60%": { opacity: "1", transform: "rotateX(-2deg) scale(1.02)" },
          "100%": { opacity: "1", transform: "rotateX(0) scale(1)" },
        },
        "countdown-pulse": {
          "0%": { transform: "scale(1)", opacity: "1" },
          "50%": { transform: "scale(1.04)", opacity: "0.85" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        "card-stack-up": {
          "0%": { opacity: "0", transform: "translateY(20px) scale(0.96)" },
          "100%": { opacity: "1", transform: "translateY(0) scale(1)" },
        },
        "saffron-glow": {
          "0%, 100%": {
            boxShadow:
              "0 4px 24px 0 oklch(0.7 0.18 50 / 0.2), 0 2px 8px -1px oklch(0.7 0.18 50 / 0.1)",
          },
          "50%": {
            boxShadow:
              "0 8px 32px 0 oklch(0.7 0.18 50 / 0.4), 0 4px 16px -1px oklch(0.7 0.18 50 / 0.2)",
          },
        },
        "celebrate-burst": {
          "0%": { transform: "scale(0.3)", opacity: "0" },
          "50%": { opacity: "1" },
          "100%": { transform: "scale(1)", opacity: "0" },
        },
        "badge-pulse": {
          "0%, 100%": {
            transform: "scale(1)",
            boxShadow: "0 0 0 0 oklch(0.7 0.18 50 / 0.4)",
          },
          "50%": {
            transform: "scale(1.08)",
            boxShadow: "0 0 0 12px oklch(0.7 0.18 50 / 0)",
          },
        },
        "confetti-fall": {
          "0%": {
            opacity: "1",
            transform: "translateY(-10vh) rotate(0deg)",
          },
          "100%": {
            opacity: "0",
            transform: "translateY(100vh) rotate(720deg)",
          },
        },
        "rank-highlight": {
          "0%": {
            backgroundColor: "oklch(0.76 0.2 60 / 0)",
            boxShadow: "inset 0 0 0 0 oklch(0.76 0.2 60 / 0)",
          },
          "50%": {
            backgroundColor: "oklch(0.76 0.2 60 / 0.08)",
            boxShadow: "inset 0 0 12px oklch(0.76 0.2 60 / 0.12)",
          },
          "100%": {
            backgroundColor: "oklch(0.76 0.2 60 / 0)",
            boxShadow: "inset 0 0 0 0 oklch(0.76 0.2 60 / 0)",
          },
        },
        "quest-unlock-shimmer": {
          "0%": { opacity: "0.6", transform: "scale(0.95)" },
          "50%": { opacity: "1", transform: "scale(1.02)" },
          "100%": { opacity: "0.6", transform: "scale(0.95)" },
        },
        "flex-save-glow": {
          "0%": { boxShadow: "0 0 0 0 oklch(0.68 0.12 120 / 0.6)" },
          "70%": { boxShadow: "0 0 0 20px oklch(0.68 0.12 120 / 0)" },
          "100%": { boxShadow: "0 0 0 0 oklch(0.68 0.12 120 / 0)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-up": "fade-up 0.4s cubic-bezier(0.22, 1, 0.36, 1) both",
        "fade-in": "fade-in 0.35s ease both",
        "slide-up": "slide-up 0.45s cubic-bezier(0.22, 1, 0.36, 1) both",
        "scale-in": "scale-in 0.3s cubic-bezier(0.22, 1, 0.36, 1) both",
        shimmer: "shimmer 2.5s linear infinite",
        "pulse-ring": "pulse-ring 2s ease-in-out infinite",
        "soft-pop": "soft-pop 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) both",
        "breathe-pulse": "breathe-pulse 2.4s cubic-bezier(0.45, 0, 0.55, 1) infinite",
        "bounce-subtle": "bounce-subtle 1s ease-in-out infinite",
        "model-enter": "model-enter 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) both",
        "countdown-pulse": "countdown-pulse 0.8s cubic-bezier(0.45, 0, 0.55, 1) infinite",
        "card-stack-up": "card-stack-up 0.4s cubic-bezier(0.22, 1, 0.36, 1) both",
        "saffron-glow": "saffron-glow 2s ease-in-out infinite",
        "celebrate-burst": "celebrate-burst 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) both",
        "badge-pulse": "badge-pulse 1.5s cubic-bezier(0.45, 0, 0.55, 1) infinite",
        "confetti-fall": "confetti-fall 2.8s ease-in both",
        "rank-highlight": "rank-highlight 2s cubic-bezier(0.45, 0, 0.55, 1) infinite",
        "quest-unlock": "quest-unlock-shimmer 2s cubic-bezier(0.45, 0, 0.55, 1) infinite",
        "flex-save": "flex-save-glow 1.2s cubic-bezier(0.45, 0, 0.55, 1)",
      },
      spacing: {
        "safe-bottom": "env(safe-area-inset-bottom, 0px)",
      },
    },
  },
  plugins: [typography, containerQueries, animate],
};
