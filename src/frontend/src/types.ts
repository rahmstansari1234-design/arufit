import type { Principal } from "@icp-sdk/core/principal";
import type {
  CallStatus,
  CallView,
  CreateGroupInput,
  GroupChatView,
  GroupMessageView,
  PostReactionSummary,
} from "./backend.d";
import type {
  ChatSettings,
  CommentView,
  Conversation,
  CreatePostInput,
  CreateStoryInput,
  DisappearingMode,
  MessageStatus,
  MessageView,
  NotificationType,
  NotificationView,
  Page,
  Page_1,
  Page_2,
  PostView,
  PostVisibility,
  StoryView,
  Timestamp,
  UpsertProfileInput,
  UserProfileView,
} from "./backend.d";

export type { Principal } from "@icp-sdk/core/principal";

export type {
  PostView,
  StoryView,
  CommentView,
  MessageView,
  UserProfileView,
  NotificationView,
  Conversation,
  ChatSettings,
  UpsertProfileInput,
  CreatePostInput,
  CreateStoryInput,
  Page,
  Page_1,
  Page_2,
  DisappearingMode,
  MessageStatus,
  NotificationType,
  PostVisibility,
  Timestamp,
  GroupChatView,
  GroupMessageView,
  PostReactionSummary,
  CreateGroupInput,
  CallStatus,
  CallView,
};

// ── Re-export backend types with frontend-friendly aliases ─────────────────

export type Post = PostView;
export type Story = StoryView;
export type Comment = CommentView;
export type Message = MessageView;
export type UserProfile = UserProfileView;
export type Notification = NotificationView;

// ── Mood Tags ──────────────────────────────────────────────────────────────

export type MoodTag = "Gym" | "Rest" | "Eating" | "Progress" | "Mindset";

export const MOOD_TAGS: MoodTag[] = [
  "Gym",
  "Rest",
  "Eating",
  "Progress",
  "Mindset",
];

export function moodTagEmoji(tag: MoodTag): string {
  switch (tag) {
    case "Gym":
      return "💪";
    case "Rest":
      return "😴";
    case "Eating":
      return "🍽️";
    case "Progress":
      return "📈";
    case "Mindset":
      return "🧠";
  }
}

// ── App State Types ────────────────────────────────────────────────────────

export interface ThemeSettings {
  mode: "light" | "dark" | "system";
  accentColor: string;
  fontSize: "small" | "medium" | "large";
  reducedMotion: boolean;
}

export interface AppState {
  theme: ThemeSettings;
  chatSettings: ChatSettings;
  user: UserProfile | null;
  isAuthenticated: boolean;
  unreadNotifications: number;
  unreadMessages: number;
  isLoading: boolean;
}

// ── Frontend-specific types ─────────────────────────────────────────────────

export interface PostWithAuthor extends PostView {
  authorDisplayName: string;
  authorUsername: string;
  authorAvatarUrl?: string;
}

export interface StoryWithAuthor extends StoryView {
  authorDisplayName: string;
  authorUsername: string;
  authorAvatarUrl?: string;
}

export interface MessageWithStatus extends MessageView {
  localStatus?: "sending" | "sent" | "delivered" | "read";
}

export interface ConversationPreview {
  participantId: Principal;
  otherUserName: string;
  otherUserUsername: string;
  otherUserAvatarUrl?: string;
  lastMessage?: string;
  lastMessageAt: Timestamp;
  unreadCount: bigint;
}

// ── Utility types ──────────────────────────────────────────────────────────

export type Visibility = "everyone" | "followers";

export function formatTimestamp(ts: Timestamp): string {
  const date = new Date(Number(ts) / 1_000_000);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function formatMessageTime(ts: Timestamp): string {
  const date = new Date(Number(ts) / 1_000_000);
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

export function formatConversationTime(ts: Timestamp): string {
  const date = new Date(Number(ts) / 1_000_000);
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();
  if (isToday) {
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  }
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  if (date.toDateString() === yesterday.toDateString()) {
    return "Yesterday";
  }
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}
