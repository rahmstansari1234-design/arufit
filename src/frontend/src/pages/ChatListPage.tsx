import { Link, useNavigate } from "@tanstack/react-router";
import { MessageSquare, Search } from "lucide-react";
import { useState } from "react";
import { Skeleton } from "../components/ui/skeleton";
import { useConversations } from "../hooks/useBackend";

function formatTime(ts: bigint): string {
  const d = new Date(Number(ts) / 1_000_000);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "now";
  if (diffMins < 60) return `${diffMins}m`;
  if (diffHours < 24) return `${diffHours}h`;
  if (diffDays < 7) return `${diffDays}d`;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export default function ChatListPage() {
  const navigate = useNavigate();
  const { data: conversations = [], isLoading } = useConversations();
  const [search, setSearch] = useState("");

  const filtered = conversations.filter((c) =>
    (c.lastMessage ?? "").toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="max-w-lg mx-auto h-full flex flex-col">
      {/* Header */}
      <div className="px-4 pt-4 pb-3">
        <div className="flex border-b border-border mb-3">
          <Link
            to="/chat"
            className="flex-1 py-3 text-center font-medium text-sm text-[#4CAF7D] border-b-2 border-[#4CAF7D]"
            data-ocid="chatlist.tab_messages"
          >
            Messages
          </Link>
          <Link
            to="/chat/groups"
            className="flex-1 py-3 text-center font-medium text-sm text-muted-foreground hover:text-foreground"
            data-ocid="chatlist.tab_groups"
          >
            Groups
          </Link>
        </div>
        <div className="relative">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search conversations"
            className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-card border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            data-ocid="chatlist.search_input"
          />
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-1">
        {isLoading ? (
          <div className="space-y-2">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-16 w-full rounded-xl" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div
            className="flex flex-col items-center justify-center py-16 text-center"
            data-ocid="chatlist.empty_state"
          >
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <MessageSquare size={24} className="text-muted-foreground" />
            </div>
            <p className="font-display font-semibold text-foreground mb-1">
              {search ? "No results" : "No messages yet"}
            </p>
            <p className="text-sm text-muted-foreground">
              {search
                ? "Try a different search term"
                : "Start a conversation with someone"}
            </p>
          </div>
        ) : (
          filtered.map((conv, i) => (
            <button
              type="button"
              key={conv.participantId.toString()}
              onClick={() =>
                navigate({
                  to: "/chat/$userId",
                  params: { userId: conv.participantId.toString() },
                })
              }
              className="w-full flex items-center gap-3 px-3 py-3 rounded-xl bg-card hover:bg-muted/50 transition-smooth active:scale-[0.98] text-left"
              data-ocid={`chatlist.item.${i + 1}`}
            >
              {/* Avatar */}
              <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center flex-shrink-0 overflow-hidden">
                <span className="font-display font-bold text-sm text-primary">
                  {getInitials("User")}
                </span>
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-sm text-foreground truncate">
                    User
                  </span>
                  <span className="text-[11px] text-muted-foreground flex-shrink-0 ml-2">
                    {formatTime(conv.lastMessageAt)}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <p className="text-xs text-muted-foreground truncate flex-1">
                    {conv.lastMessage ?? "No messages yet"}
                  </p>
                  {conv.unreadCount > 0n && (
                    <span className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />
                  )}
                </div>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
}
