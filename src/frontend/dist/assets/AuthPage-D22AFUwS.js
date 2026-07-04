import { b as useInternetIdentity, u as useNavigate, r as reactExports, j as jsxRuntimeExports } from "./index-BBmdRvnk.js";
function AuthPage() {
  const { identity, login, isInitializing, isLoggingIn } = useInternetIdentity();
  const navigate = useNavigate();
  reactExports.useEffect(() => {
    if (identity) {
      navigate({ to: "/" });
    }
  }, [identity, navigate]);
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "min-h-screen flex items-center justify-center bg-background px-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-full max-w-sm bg-card rounded-3xl shadow-subtle p-8 text-center space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "font-display text-4xl font-bold text-foreground tracking-tight", children: "Arufit" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mx-auto w-12 h-1 rounded-full bg-primary" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground text-sm font-body", children: "Your daily life. Elevated." }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "button",
      {
        type: "button",
        "data-ocid": "auth.login_button",
        onClick: () => login(),
        disabled: isInitializing || isLoggingIn,
        className: "w-full py-3 px-6 rounded-2xl border border-border bg-background text-foreground font-medium transition-smooth hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed",
        children: isInitializing ? "Loading..." : isLoggingIn ? "Logging in..." : "Continue with Internet Identity"
      }
    )
  ] }) });
}
export {
  AuthPage as default
};
