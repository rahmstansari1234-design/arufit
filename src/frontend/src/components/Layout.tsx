import { Link, useRouterState } from "@tanstack/react-router";
import { Bell, Moon, Sun } from "lucide-react";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { useAppStore } from "../store";
import BottomNav from "./BottomNav";

const UI = {
  appName: "Arufit",
  builtWith: "Built with love using caffeine.ai",
} as const;

interface LayoutProps {
  children: ReactNode;
  showHeader?: boolean;
}

export default function Layout({ children, showHeader = true }: LayoutProps) {
  const year = new Date().getFullYear();
  const utm = encodeURIComponent(
    typeof window !== "undefined" ? window.location.hostname : "",
  );

  const [isOnline, setIsOnline] = useState(
    typeof navigator !== "undefined" ? navigator.onLine : true,
  );

  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;
  const isAuthRoute = currentPath === "/auth";

  const unreadNotifications = useAppStore((s) => s.unreadNotifications);
  const themeMode = useAppStore((s) => s.theme.mode);
  const setTheme = useAppStore((s) => s.setTheme);

  const isDark =
    themeMode === "dark" ||
    (themeMode === "system" &&
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches);

  function toggleTheme() {
    setTheme({ mode: isDark ? "light" : "dark" });
  }

  useEffect(() => {
    function handleOnline() {
      setIsOnline(true);
    }
    function handleOffline() {
      setIsOnline(false);
    }
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* ── Premium glass header ─────────────────────────── */}
      {showHeader && !isAuthRoute && (
        <header
          className="sticky top-0 z-40 glass-warm border-b border-border/40 shadow-glass"
          data-ocid="app-header"
        >
          <div className="max-w-lg mx-auto w-full flex items-center justify-between px-5 h-[3.75rem]">
            <div className="flex items-center gap-2 select-none">
              <span className="font-display font-bold text-[20px] text-foreground tracking-tight">
                {UI.appName}
              </span>
              <span
                className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                style={{ backgroundColor: "#4CAF7D" }}
                aria-hidden="true"
              />
            </div>
            <div className="flex items-center gap-2">
              {!isOnline && (
                <output
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider"
                  style={{
                    background: "oklch(0.7 0.18 50 / 0.12)",
                    color: "oklch(0.55 0.14 47)",
                    border: "1px solid oklch(0.7 0.18 50 / 0.35)",
                  }}
                  aria-live="polite"
                  data-ocid="offline-indicator"
                >
                  <span
                    className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                    style={{ background: "oklch(0.62 0.16 47)" }}
                    aria-hidden="true"
                  />
                  Offline
                </output>
              )}
              <button
                type="button"
                onClick={toggleTheme}
                className="p-2 rounded-full hover:bg-muted/60 transition-colors"
                aria-label="Toggle theme"
                data-ocid="theme-toggle.button"
              >
                {isDark ? (
                  <Sun size={18} className="text-foreground" />
                ) : (
                  <Moon size={18} className="text-foreground" />
                )}
              </button>
              <Link
                to="/notifications"
                className="relative p-2 rounded-full hover:bg-muted/60 transition-colors"
                aria-label="Notifications"
                data-ocid="notification-bell.button"
              >
                <Bell size={20} className="text-foreground" />
                {unreadNotifications > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#4CAF7D]" />
                )}
              </Link>
            </div>
          </div>
        </header>
      )}

      {/* ── Main scrollable content area ─────────────────── */}
      <main
        className="flex-1 overflow-y-auto scrollbar-warm"
        style={{ WebkitOverflowScrolling: "touch" }}
        data-ocid="main-content"
      >
        <div
          className="max-w-lg mx-auto w-full pb-28"
          style={{
            transition:
              "opacity 0.25s cubic-bezier(0.4,0,0.2,1), transform 0.25s cubic-bezier(0.34,1.56,0.64,1)",
          }}
        >
          {children}
        </div>
      </main>

      {/* ── Bottom navigation ────────────────────────────── */}
      {!isAuthRoute && <BottomNav />}

      {/* ── Caffeine attribution ─────────────────────────── */}
      <footer className="fixed bottom-[64px] left-0 right-0 text-center py-1 pointer-events-none z-10">
        <p className="text-[10px] text-muted-foreground/35 font-body">
          © {year}.{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${utm}`}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-muted-foreground/60 transition-colors pointer-events-auto"
          >
            {UI.builtWith}
          </a>
        </p>
      </footer>
    </div>
  );
}
