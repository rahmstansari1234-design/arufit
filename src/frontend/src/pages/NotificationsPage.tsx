import { Bell, Heart, MessageCircle, UserPlus } from "lucide-react";
import { Skeleton } from "../components/ui/skeleton";
import {
  useMarkAllNotificationsRead,
  useNotifications,
} from "../hooks/useBackend";
import type { Notification } from "../types";

function formatTime(ts: bigint): string {
  const d = new Date(Number(ts) / 1_000_000);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function NotificationIcon({ type }: { type: Notification["notifType"] }) {
  switch (type) {
    case "like":
      return <Heart size={18} className="text-red-500" />;
    case "comment":
      return <MessageCircle size={18} className="text-primary" />;
    case "follow":
      return <UserPlus size={18} className="text-primary" />;
    case "message":
      return <MessageCircle size={18} className="text-blue-500" />;
    case "storyReply":
      return <Bell size={18} className="text-amber-500" />;
    default:
      return <Bell size={18} className="text-muted-foreground" />;
  }
}

function NotificationRow({
  notif,
  index,
}: { notif: Notification; index: number }) {
  return (
    <div
      className={`flex items-start gap-3 px-4 py-3 rounded-xl transition-smooth ${
        notif.isRead ? "bg-card" : "bg-primary/5"
      }`}
      data-ocid={`notifications.item.${index + 1}`}
    >
      <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
        <NotificationIcon type={notif.notifType} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-foreground">
          <span className="font-semibold">@{notif.actorUsername}</span>{" "}
          {notif.notifType === "like" && "liked your post"}
          {notif.notifType === "comment" && "commented on your post"}
          {notif.notifType === "follow" && "started following you"}
          {notif.notifType === "message" && "sent you a message"}
          {notif.notifType === "storyReply" && "replied to your story"}
        </p>
        <p className="text-xs text-muted-foreground mt-0.5">
          {formatTime(notif.createdAt)}
        </p>
      </div>
      {!notif.isRead && (
        <span className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-2" />
      )}
    </div>
  );
}

export default function NotificationsPage() {
  const { data: notifications = [], isLoading } = useNotifications();
  const markAllRead = useMarkAllNotificationsRead();

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="max-w-lg mx-auto h-full flex flex-col">
      {/* Header */}
      <div className="px-4 pt-4 pb-3 flex items-center justify-between">
        <h1 className="font-display font-bold text-xl text-foreground">
          Notifications
        </h1>
        {unreadCount > 0 && (
          <button
            type="button"
            onClick={() => markAllRead.mutate()}
            className="text-xs font-semibold text-primary hover:text-primary/80 transition-colors"
            data-ocid="notifications.mark_all_read"
          >
            Mark all read
          </button>
        )}
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-1">
        {isLoading ? (
          <div className="space-y-2">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-16 w-full rounded-xl" />
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <div
            className="flex flex-col items-center justify-center py-16 text-center"
            data-ocid="notifications.empty_state"
          >
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <Bell size={24} className="text-muted-foreground" />
            </div>
            <p className="font-display font-semibold text-foreground mb-1">
              No notifications yet
            </p>
            <p className="text-sm text-muted-foreground">
              When people interact with you, you&apos;ll see it here
            </p>
          </div>
        ) : (
          notifications.map((notif, i) => (
            <NotificationRow key={notif.id} notif={notif} index={i} />
          ))
        )}
      </div>
    </div>
  );
}
