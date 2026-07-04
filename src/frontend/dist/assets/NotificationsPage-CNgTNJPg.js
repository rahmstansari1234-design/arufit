import { j as jsxRuntimeExports, S as Skeleton, B as Bell, M as MessageCircle } from "./index-BBmdRvnk.js";
import { I as useNotifications, J as useMarkAllNotificationsRead } from "./useBackend-CcBHNUn3.js";
import { U as UserPlus } from "./user-plus-0p9Z1W1A.js";
import { H as Heart } from "./heart-aqTGjQUP.js";
function formatTime(ts) {
  const d = new Date(Number(ts) / 1e6);
  const now = /* @__PURE__ */ new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 6e4);
  const diffHours = Math.floor(diffMs / 36e5);
  const diffDays = Math.floor(diffMs / 864e5);
  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}
function NotificationIcon({ type }) {
  switch (type) {
    case "like":
      return /* @__PURE__ */ jsxRuntimeExports.jsx(Heart, { size: 18, className: "text-red-500" });
    case "comment":
      return /* @__PURE__ */ jsxRuntimeExports.jsx(MessageCircle, { size: 18, className: "text-primary" });
    case "follow":
      return /* @__PURE__ */ jsxRuntimeExports.jsx(UserPlus, { size: 18, className: "text-primary" });
    case "message":
      return /* @__PURE__ */ jsxRuntimeExports.jsx(MessageCircle, { size: 18, className: "text-blue-500" });
    case "storyReply":
      return /* @__PURE__ */ jsxRuntimeExports.jsx(Bell, { size: 18, className: "text-amber-500" });
    default:
      return /* @__PURE__ */ jsxRuntimeExports.jsx(Bell, { size: 18, className: "text-muted-foreground" });
  }
}
function NotificationRow({
  notif,
  index
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      className: `flex items-start gap-3 px-4 py-3 rounded-xl transition-smooth ${notif.isRead ? "bg-card" : "bg-primary/5"}`,
      "data-ocid": `notifications.item.${index + 1}`,
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-10 h-10 rounded-full bg-muted flex items-center justify-center flex-shrink-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx(NotificationIcon, { type: notif.notifType }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-foreground", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-semibold", children: [
              "@",
              notif.actorUsername
            ] }),
            " ",
            notif.notifType === "like" && "liked your post",
            notif.notifType === "comment" && "commented on your post",
            notif.notifType === "follow" && "started following you",
            notif.notifType === "message" && "sent you a message",
            notif.notifType === "storyReply" && "replied to your story"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mt-0.5", children: formatTime(notif.createdAt) })
        ] }),
        !notif.isRead && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-2" })
      ]
    }
  );
}
function NotificationsPage() {
  const { data: notifications = [], isLoading } = useNotifications();
  const markAllRead = useMarkAllNotificationsRead();
  const unreadCount = notifications.filter((n) => !n.isRead).length;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-lg mx-auto h-full flex flex-col", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-4 pt-4 pb-3 flex items-center justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "font-display font-bold text-xl text-foreground", children: "Notifications" }),
      unreadCount > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          type: "button",
          onClick: () => markAllRead.mutate(),
          className: "text-xs font-semibold text-primary hover:text-primary/80 transition-colors",
          "data-ocid": "notifications.mark_all_read",
          children: "Mark all read"
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1 overflow-y-auto px-4 pb-4 space-y-1", children: isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2", children: [1, 2, 3, 4].map((i) => /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-16 w-full rounded-xl" }, i)) }) : notifications.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "div",
      {
        className: "flex flex-col items-center justify-center py-16 text-center",
        "data-ocid": "notifications.empty_state",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Bell, { size: 24, className: "text-muted-foreground" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-display font-semibold text-foreground mb-1", children: "No notifications yet" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "When people interact with you, you'll see it here" })
        ]
      }
    ) : notifications.map((notif, i) => /* @__PURE__ */ jsxRuntimeExports.jsx(NotificationRow, { notif, index: i }, notif.id)) })
  ] });
}
export {
  NotificationsPage as default
};
