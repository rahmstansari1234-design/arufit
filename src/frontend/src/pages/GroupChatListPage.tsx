import { useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Crown, Plus, Search, Users, X } from "lucide-react";
import { useState } from "react";
import { Skeleton } from "../components/ui/skeleton";
import {
  useCreateGroup,
  useGroupChats,
  useSearchUsers,
} from "../hooks/useBackend";
import type { Principal } from "../types";
import type { GroupChatView } from "../types";

function formatTime(ts: bigint | undefined): string {
  if (!ts) return "";
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

function GroupAvatar({
  name,
  avatarUrl,
  size = "md",
}: {
  name: string;
  avatarUrl?: string;
  size?: "sm" | "md" | "lg";
}) {
  const sizeClasses = {
    sm: "w-9 h-9 text-xs",
    md: "w-12 h-12 text-sm",
    lg: "w-16 h-16 text-lg",
  };

  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt={name}
        className={`${sizeClasses[size]} rounded-full object-cover flex-shrink-0`}
      />
    );
  }

  return (
    <div
      className={`${sizeClasses[size]} rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0`}
    >
      <span className="font-display font-bold text-primary">
        {getInitials(name)}
      </span>
    </div>
  );
}

function GroupCard({
  group,
  index,
}: {
  group: GroupChatView;
  index: number;
}) {
  const navigate = useNavigate();

  return (
    <button
      type="button"
      onClick={() =>
        navigate({
          to: "/chat/group/$groupId",
          params: { groupId: group.groupId },
        })
      }
      className="w-full flex items-center gap-3 px-3 py-3 rounded-xl bg-card hover:bg-muted/50 transition-smooth active:scale-[0.98] text-left"
      data-ocid={`groupchatlist.item.${index + 1}`}
    >
      <GroupAvatar name={group.name} avatarUrl={group.avatarUrl} />

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <span className="font-semibold text-sm text-foreground truncate">
            {group.name}
          </span>
          <span className="text-[11px] text-muted-foreground flex-shrink-0 ml-2">
            {formatTime(group.lastMessageAt)}
          </span>
        </div>
        <div className="flex items-center gap-1.5 mt-0.5">
          <p className="text-xs text-muted-foreground truncate flex-1">
            {group.lastMessage ?? "No messages yet"}
          </p>
          {group.unreadCount > 0n && (
            <span className="min-w-[18px] h-[18px] px-1.5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center flex-shrink-0 animate-pulse">
              {Number(group.unreadCount)}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1 mt-1">
          <Users size={10} className="text-muted-foreground" />
          <span className="text-[10px] text-muted-foreground">
            {group.members.length} members
          </span>
          {group.adminIds.length > 0 && (
            <span className="inline-flex items-center gap-0.5 ml-1 text-[10px] text-primary">
              <Crown size={9} />
              {group.adminIds.length} admin
              {group.adminIds.length > 1 ? "s" : ""}
            </span>
          )}
        </div>
      </div>
    </button>
  );
}

function CreateGroupSheet({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [name, setName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const createGroup = useCreateGroup();
  const { data: users = [] } = useSearchUsers(search);

  function toggleUser(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function handleCreate() {
    if (!name.trim()) return;
    const memberIds = Array.from(selectedIds).map(
      (id) => id as unknown as Principal,
    );
    createGroup.mutate(
      { name: name.trim(), avatarUrl: avatarUrl || undefined, memberIds },
      {
        onSuccess: () => {
          onClose();
          setName("");
          setAvatarUrl("");
          setSelectedIds(new Set());
        },
      },
    );
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div
        className="absolute inset-0 bg-background/60 backdrop-blur-sm"
        onClick={onClose}
        onKeyUp={onClose}
        role="button"
        tabIndex={0}
      />
      <div
        className="relative w-full max-w-lg glass-modal rounded-t-3xl max-h-[85vh] flex flex-col animate-fade-up"
        data-ocid="groupchatlist.create_modal"
      >
        {/* Sheet header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3">
          <h2 className="font-display font-bold text-lg text-foreground">
            New Group
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-muted flex items-center justify-center transition-smooth active:scale-95"
            data-ocid="groupchatlist.close_modal_button"
            aria-label="Close"
          >
            <X size={16} className="text-foreground" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 pb-6 space-y-4">
          {/* Group name */}
          <div>
            <label
              htmlFor="group-name-input"
              className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block"
            >
              Group Name
            </label>
            <input
              id="group-name-input"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Gym Squad"
              className="w-full px-4 py-3 rounded-xl bg-card border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              data-ocid="groupchatlist.name_input"
            />
          </div>

          {/* Avatar URL */}
          <div>
            <label
              htmlFor="group-avatar-input"
              className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block"
            >
              Avatar URL (optional)
            </label>
            <input
              id="group-avatar-input"
              type="text"
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              placeholder="https://..."
              className="w-full px-4 py-3 rounded-xl bg-card border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              data-ocid="groupchatlist.avatar_input"
            />
          </div>

          {/* Participant search */}
          <div>
            <label
              htmlFor="group-members-search"
              className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block"
            >
              Add Members ({selectedIds.size} selected)
            </label>
            <div className="relative mb-3">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              />
              <input
                id="group-members-search"
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search users..."
                className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-card border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                data-ocid="groupchatlist.search_input"
              />
            </div>

            {/* User list */}
            <div className="space-y-1 max-h-48 overflow-y-auto">
              {users.map((user) => {
                const id = user.id?.toString() ?? "";
                const isSelected = selectedIds.has(id);
                return (
                  <button
                    type="button"
                    key={id}
                    onClick={() => toggleUser(id)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-smooth text-left ${
                      isSelected
                        ? "bg-primary/10 border border-primary/30"
                        : "bg-card hover:bg-muted/50 border border-transparent"
                    }`}
                    data-ocid={`groupchatlist.user_item.${id}`}
                  >
                    <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                      <span className="font-display font-bold text-xs text-primary">
                        {getInitials(
                          user.displayName || user.username || "User",
                        )}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">
                        {user.displayName || user.username}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        @{user.username}
                      </p>
                    </div>
                    <div
                      className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-smooth ${
                        isSelected
                          ? "bg-primary border-primary"
                          : "border-muted-foreground/40"
                      }`}
                    >
                      {isSelected && (
                        <svg
                          width="12"
                          height="12"
                          viewBox="0 0 12 12"
                          fill="none"
                        >
                          <title>Selected</title>
                          <path
                            d="M2 6L5 9L10 3"
                            stroke="white"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      )}
                    </div>
                  </button>
                );
              })}
              {search && users.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No users found
                </p>
              )}
            </div>
          </div>

          {/* Create button */}
          <button
            type="button"
            onClick={handleCreate}
            disabled={!name.trim() || createGroup.isPending}
            className="w-full py-3.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm transition-smooth active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
            data-ocid="groupchatlist.create_button"
          >
            {createGroup.isPending ? "Creating..." : "Create Group"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function GroupChatListPage() {
  const navigate = useNavigate();
  const { data: groups = [], isLoading } = useGroupChats();
  const [showCreate, setShowCreate] = useState(false);
  const [search, setSearch] = useState("");

  const filtered = groups.filter((g) =>
    g.name.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="max-w-lg mx-auto h-full flex flex-col relative">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-4 pb-3">
        <button
          type="button"
          onClick={() => navigate({ to: "/chat" })}
          className="w-9 h-9 rounded-full bg-muted flex items-center justify-center transition-smooth active:scale-95"
          data-ocid="groupchatlist.back_button"
          aria-label="Back"
        >
          <ArrowLeft size={16} className="text-foreground" />
        </button>
        <h1 className="font-display font-bold text-xl text-foreground flex-1">
          Groups
        </h1>
      </div>

      {/* Search */}
      <div className="px-4 pb-3">
        <div className="relative">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search groups"
            className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-card border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            data-ocid="groupchatlist.search_input"
          />
        </div>
      </div>

      {/* Group list */}
      <div className="flex-1 overflow-y-auto px-4 pb-24 space-y-1">
        {isLoading ? (
          <div className="space-y-2">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-20 w-full rounded-xl" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div
            className="flex flex-col items-center justify-center py-16 text-center"
            data-ocid="groupchatlist.empty_state"
          >
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <Users size={24} className="text-muted-foreground" />
            </div>
            <p className="font-display font-semibold text-foreground mb-1">
              {search ? "No results" : "No groups yet"}
            </p>
            <p className="text-sm text-muted-foreground">
              {search
                ? "Try a different search term"
                : "Create a group to start chatting together"}
            </p>
          </div>
        ) : (
          filtered.map((group, i) => (
            <GroupCard key={group.groupId} group={group} index={i} />
          ))
        )}
      </div>

      {/* New Group FAB */}
      <button
        type="button"
        onClick={() => setShowCreate(true)}
        className="absolute bottom-6 right-4 w-14 h-14 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-elevated transition-smooth active:scale-90 hover:shadow-warm"
        style={{
          transitionTimingFunction: "cubic-bezier(0.34, 1.56, 0.64, 1)",
        }}
        data-ocid="groupchatlist.new_group_button"
        aria-label="New Group"
      >
        <Plus size={24} />
      </button>

      <CreateGroupSheet
        open={showCreate}
        onClose={() => setShowCreate(false)}
      />
    </div>
  );
}
