import { Link, useRouterState } from "@tanstack/react-router";
import { Compass, Home, MessageCircle, PlusCircle, User } from "lucide-react";
import { useAppStore } from "../store";

const NAV_LABELS = {
  home: "Home",
  explore: "Explore",
  add: "Add",
  chat: "Chat",
  profile: "Profile",
} as const;

const tabs: Array<{
  path: string;
  label: string;
  ocid: string;
  icon: typeof Home;
  isCenter?: boolean;
}> = [
  { path: "/", label: NAV_LABELS.home, ocid: "nav-home", icon: Home },
  {
    path: "/explore",
    label: NAV_LABELS.explore,
    ocid: "nav-explore",
    icon: Compass,
  },
  {
    path: "/add",
    label: NAV_LABELS.add,
    ocid: "nav-add",
    icon: PlusCircle,
    isCenter: true,
  },
  {
    path: "/chat",
    label: NAV_LABELS.chat,
    ocid: "nav-chat",
    icon: MessageCircle,
  },
  {
    path: "/profile",
    label: NAV_LABELS.profile,
    ocid: "nav-profile",
    icon: User,
  },
];

export default function BottomNav() {
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;
  const unreadMessages = useAppStore((s) => s.unreadMessages);

  const isActive = (path: string) => {
    if (path === "/") return currentPath === "/";
    return currentPath.startsWith(path);
  };

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 glass-warm border-t border-border/40"
      style={{ borderRadius: "2.25rem 2.25rem 0 0", overflow: "hidden" }}
      data-ocid="bottom-nav"
    >
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto px-2 pb-safe">
        {tabs.map(({ path, label, ocid, icon: Icon, isCenter }) => {
          const active = isActive(path);
          if (isCenter) {
            return (
              <Link
                key={path}
                to={path}
                className="flex flex-col items-center justify-center gap-1 flex-1 h-full min-w-0"
                data-ocid={ocid}
              >
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center shadow-lg"
                  style={{ backgroundColor: "#4CAF7D" }}
                >
                  <Icon size={22} className="text-white" strokeWidth={2.2} />
                </div>
              </Link>
            );
          }
          return (
            <Link
              key={path}
              to={path}
              className="touch-ripple flex flex-col items-center justify-center gap-1 flex-1 h-full min-w-0 rounded-2xl transition-colors-fast relative"
              data-ocid={ocid}
              aria-current={active ? "page" : undefined}
            >
              <div className="relative flex items-center justify-center w-10 h-8">
                {active && (
                  <span
                    className="absolute inset-0 rounded-xl"
                    style={{
                      background:
                        "radial-gradient(ellipse at 50% 60%, oklch(0.63 0.12 145 / 0.16) 0%, oklch(0.63 0.12 145 / 0.08) 70%, transparent 100%)",
                      transition:
                        "opacity 0.3s cubic-bezier(0.34,1.56,0.64,1), transform 0.3s cubic-bezier(0.34,1.56,0.64,1)",
                      animation:
                        "soft-pop 0.3s cubic-bezier(0.34,1.56,0.64,1) both",
                    }}
                    aria-hidden="true"
                  />
                )}
                <Icon
                  size={active ? 22 : 20}
                  className="relative z-10 transition-all duration-300"
                  style={{ color: active ? "#4CAF7D" : "#6B7280" }}
                  strokeWidth={active ? 2.4 : 1.7}
                  aria-hidden="true"
                />
                {path === "/chat" && unreadMessages > 0 && (
                  <span className="absolute -top-0.5 -right-1 w-2 h-2 rounded-full bg-[#4CAF7D] z-20" />
                )}
              </div>
              <span
                className={`text-[10px] font-semibold leading-none tracking-wide transition-all duration-300 ${active ? "text-[#4CAF7D]" : "text-muted-foreground"}`}
              >
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
