import { useInternetIdentity } from "@caffeineai/core-infrastructure";
import { useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";

export default function AuthPage() {
  const { identity, login, isInitializing, isLoggingIn } =
    useInternetIdentity();
  const navigate = useNavigate();

  useEffect(() => {
    if (identity) {
      navigate({ to: "/" });
    }
  }, [identity, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm bg-card rounded-3xl shadow-subtle p-8 text-center space-y-6">
        <div className="space-y-2">
          <h1 className="font-display text-4xl font-bold text-foreground tracking-tight">
            Arufit
          </h1>
          <div className="mx-auto w-12 h-1 rounded-full bg-primary" />
        </div>

        <p className="text-muted-foreground text-sm font-body">
          Your daily life. Elevated.
        </p>

        <button
          type="button"
          data-ocid="auth.login_button"
          onClick={() => login()}
          disabled={isInitializing || isLoggingIn}
          className="w-full py-3 px-6 rounded-2xl border border-border bg-background text-foreground font-medium transition-smooth hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isInitializing
            ? "Loading..."
            : isLoggingIn
              ? "Logging in..."
              : "Continue with Internet Identity"}
        </button>
      </div>
    </div>
  );
}
