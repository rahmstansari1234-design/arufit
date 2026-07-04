import { useNavigate } from "@tanstack/react-router";
import { LogOut, Moon, RotateCcw, Shield, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";

const ONBOARDING_KEY = "arufit-onboarding-v1-done";

function useTheme() {
  const [isDark, setIsDark] = useState<boolean>(() => {
    if (typeof document === "undefined") return false;
    return document.documentElement.classList.contains("dark");
  });

  function toggle() {
    const next = !isDark;
    setIsDark(next);
    if (next) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }

  useEffect(() => {
    const saved = localStorage.getItem("theme");
    if (saved === "dark") {
      document.documentElement.classList.add("dark");
      setIsDark(true);
    } else if (saved === "light") {
      document.documentElement.classList.remove("dark");
      setIsDark(false);
    }
  }, []);

  return { isDark, toggle };
}

function SectionHeader({ title }: { title: string }) {
  return (
    <h2 className="font-display font-semibold text-base tracking-wide text-foreground/70 uppercase text-xs mb-3 mt-1 pl-1">
      {title}
    </h2>
  );
}

export default function Settings() {
  const navigate = useNavigate();
  const { isDark, toggle: toggleTheme } = useTheme();

  function handleLogout() {
    localStorage.clear();
    toast.success("Logged out");
    navigate({ to: "/auth" });
  }

  return (
    <div className="px-4 pt-8 pb-8 space-y-7 max-w-lg mx-auto">
      {/* Page Header */}
      <div className="space-y-0.5">
        <h1 className="text-3xl font-display font-bold text-foreground">
          Settings
        </h1>
        <p className="text-muted-foreground text-sm font-body">
          Manage your preferences and account
        </p>
      </div>

      {/* ── Appearance ── */}
      <section data-ocid="appearance-section">
        <SectionHeader title="Appearance" />
        <Card
          className="rounded-2xl shadow-elevated border-border/60 p-5"
          data-ocid="appearance-card"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="font-display font-semibold text-foreground text-sm">
                Theme
              </p>
              <p className="text-xs text-muted-foreground mt-0.5 font-body">
                {isDark ? "Dark mode is on" : "Light mode is on"}
              </p>
            </div>
            <button
              type="button"
              onClick={toggleTheme}
              aria-label="Toggle theme"
              className={`relative inline-flex items-center w-16 h-8 rounded-full transition-smooth border focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
                isDark ? "bg-accent border-accent/60" : "bg-muted border-border"
              }`}
              data-ocid="theme-toggle"
            >
              <span
                className={`absolute flex items-center justify-center w-6 h-6 rounded-full shadow-subtle transition-smooth ${
                  isDark
                    ? "translate-x-9 bg-accent-foreground text-accent"
                    : "translate-x-1 bg-card text-foreground"
                }`}
              >
                {isDark ? <Moon size={13} /> : <Sun size={13} />}
              </span>
            </button>
          </div>
        </Card>
      </section>

      {/* ── Privacy ── */}
      <section data-ocid="privacy-section">
        <SectionHeader title="Privacy" />
        <Card
          className="rounded-2xl shadow-elevated border-border/60 overflow-hidden"
          data-ocid="privacy-card"
        >
          <div className="h-1 w-full bg-primary/60" />
          <div className="p-5">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Shield size={18} className="text-primary" aria-hidden="true" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1.5">
                  <p className="font-display font-semibold text-foreground text-sm">
                    Your data is private
                  </p>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/15 text-primary uppercase tracking-wide">
                    Secured
                  </span>
                </div>
                <p className="text-xs text-muted-foreground font-body leading-relaxed">
                  All your posts, messages, and profile data are stored
                  securely. No personal data is ever shared with other users
                  without your consent.
                </p>
                <div className="mt-3 space-y-1.5">
                  {[
                    "Your data is visible only to you and your followers",
                    "Messages are private and end-to-end secured",
                    "No cross-user data sharing of any kind",
                    "Uninstall removes all your data instantly",
                  ].map((point) => (
                    <div
                      key={point}
                      className="flex items-center gap-2 text-xs text-muted-foreground font-body"
                    >
                      <div className="w-1.5 h-1.5 rounded-full bg-primary/50 flex-shrink-0" />
                      {point}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </Card>
      </section>

      {/* ── Help & Guide ── */}
      <section data-ocid="help-guide-section">
        <SectionHeader title="Help & Guide" />
        <Card
          className="rounded-2xl shadow-elevated border-border/60 p-5"
          data-ocid="help-guide-card"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="font-display font-semibold text-foreground text-sm">
                Onboarding Tour
              </p>
              <p className="text-xs text-muted-foreground mt-0.5 font-body max-w-[200px]">
                Re-run the welcome guide to explore all features
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                localStorage.removeItem(ONBOARDING_KEY);
                window.location.reload();
              }}
              className="rounded-xl border-border font-body gap-1.5 text-foreground hover:bg-muted/60 shadow-subtle"
              data-ocid="restart-onboarding-btn"
            >
              <RotateCcw size={14} />
              Restart Tour
            </Button>
          </div>
        </Card>
      </section>

      {/* ── Logout ── */}
      <section data-ocid="logout-section">
        <SectionHeader title="Account" />
        <Card
          className="rounded-2xl shadow-elevated border-border/60 p-5"
          data-ocid="logout-card"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="font-display font-semibold text-foreground text-sm">
                Sign Out
              </p>
              <p className="text-xs text-muted-foreground mt-0.5 font-body">
                Log out of your Arufit account
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="rounded-xl border-destructive/30 text-destructive hover:bg-destructive/10 font-body gap-1.5 shadow-subtle"
              data-ocid="logout-btn"
            >
              <LogOut size={14} />
              Log Out
            </Button>
          </div>
        </Card>
      </section>
    </div>
  );
}
