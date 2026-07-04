import { useInternetIdentity } from "@caffeineai/core-infrastructure";
import { RouterProvider } from "@tanstack/react-router";
import { useEffect } from "react";
import SplashScreen from "./components/SplashScreen";
import { router } from "./router";
import { useAppStore } from "./store";

export default function App() {
  const { identity } = useInternetIdentity();
  const themeMode = useAppStore((s) => s.theme.mode);

  useEffect(() => {
    const root = document.documentElement;
    if (themeMode === "dark") {
      root.classList.add("dark");
    } else if (themeMode === "light") {
      root.classList.remove("dark");
    } else {
      const prefersDark = window.matchMedia(
        "(prefers-color-scheme: dark)",
      ).matches;
      if (prefersDark) root.classList.add("dark");
      else root.classList.remove("dark");
    }
  }, [themeMode]);

  return (
    <>
      <SplashScreen />
      <RouterProvider
        router={router}
        context={{ auth: { isAuthenticated: !!identity } }}
      />
    </>
  );
}
