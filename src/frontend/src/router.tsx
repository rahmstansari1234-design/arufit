import {
  Outlet,
  createRootRoute,
  createRoute,
  createRouter,
  redirect,
} from "@tanstack/react-router";
import { Suspense, lazy } from "react";
import Layout from "./components/Layout";
import { Skeleton } from "./components/ui/skeleton";

const FeedPage = lazy(() => import("./pages/FeedPage"));
const ExplorePage = lazy(() => import("./pages/ExplorePage"));
const AddPage = lazy(() => import("./pages/AddPage"));
const ChatListPage = lazy(() => import("./pages/ChatListPage"));
const ChatPage = lazy(() => import("./pages/ChatPage"));
const GroupChatListPage = lazy(() => import("./pages/GroupChatListPage"));
const GroupChatPage = lazy(() => import("./pages/GroupChatPage"));
const ProfilePage = lazy(() => import("./pages/ProfilePage"));
const UserProfilePage = lazy(() => import("./pages/UserProfilePage"));
const AuthPage = lazy(() => import("./pages/AuthPage"));
const NotificationsPage = lazy(() => import("./pages/NotificationsPage"));
const SettingsPage = lazy(() => import("./pages/Settings"));

function PageSkeleton() {
  return (
    <div className="p-4 space-y-3">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-4 w-32" />
      <Skeleton className="h-32 w-full rounded-2xl" />
      <Skeleton className="h-20 w-full rounded-2xl" />
      <Skeleton className="h-20 w-full rounded-2xl" />
    </div>
  );
}

const rootRoute = createRootRoute({
  component: () => (
    <Layout>
      <Suspense fallback={<PageSkeleton />}>
        <Outlet />
      </Suspense>
    </Layout>
  ),
  beforeLoad: ({ context, location }) => {
    const auth = (context as { auth?: { isAuthenticated: boolean } }).auth;
    const isAuthRoute = location.pathname === "/auth";
    if (!auth?.isAuthenticated && !isAuthRoute) {
      throw redirect({ to: "/auth" });
    }
    if (auth?.isAuthenticated && isAuthRoute) {
      throw redirect({ to: "/" });
    }
  },
});

// ── Social routes ──────────────────────────────────────────────────────────

const feedRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: FeedPage,
});

const exploreRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/explore",
  component: ExplorePage,
});

const addRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/add",
  component: AddPage,
});

const chatListRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/chat",
  component: ChatListPage,
});

const chatRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/chat/$userId",
  component: ChatPage,
});

const groupChatListRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/chat/groups",
  component: GroupChatListPage,
});

const groupChatRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/chat/group/$groupId",
  component: GroupChatPage,
});

const profileRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/profile",
  component: ProfilePage,
});

const userProfileRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/profile/$userId",
  component: UserProfilePage,
});

const notificationsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/notifications",
  component: NotificationsPage,
});

// ── Auth route ─────────────────────────────────────────────────────────────

const authRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/auth",
  component: AuthPage,
});

const settingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/settings",
  component: SettingsPage,
});

const routeTree = rootRoute.addChildren([
  feedRoute,
  exploreRoute,
  addRoute,
  chatListRoute,
  chatRoute,
  groupChatListRoute,
  groupChatRoute,
  profileRoute,
  userProfileRoute,
  notificationsRoute,
  authRoute,
  settingsRoute,
]);

export const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
