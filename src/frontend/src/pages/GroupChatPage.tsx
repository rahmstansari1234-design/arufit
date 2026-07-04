import { useNavigate, useParams } from "@tanstack/react-router";
import {
  ArrowLeft,
  Crown,
  Info,
  MoreVertical,
  Plus,
  Reply,
  Send,
  Shield,
  Trash2,
  UserMinus,
  UserPlus,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Skeleton } from "../components/ui/skeleton";
import {
  useAddGroupMember,
  useDeleteGroup,
  useDemoteGroupAdmin,
  useGroupChats,
  useGroupMessages,
  useLeaveGroup,
  useMyProfile,
  usePromoteGroupAdmin,
  useRemoveGroupMember,
  useSearchUsers,
  useSendGroupMessage,
  useUpdateGroupInfo,
} from "../hooks/useBackend";
import type { GroupChatView, GroupMessageView, Principal } from "../types";

const EMOJI_REACTIONS = ["❤️", "😂", "😮", "😢", "👍", "🔥"];

function formatTime(ts: bigint): string {
  const d = new Date(Number(ts) / 1_000_000);
  return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function isAdmin(group: GroupChatView | undefined, userId: string): boolean {
  if (!group) return false;
  return group.adminIds.some((id) => id.toString() === userId);
}

function isMember(group: GroupChatView | undefined, userId: string): boolean {
  if (!group) return false;
  return group.members.some((id) => id.toString() === userId);
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
    sm: "w-7 h-7 text-[10px]",
    md: "w-10 h-10 text-xs",
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

function MessageBubble({
  msg,
  isMine,
  myId,
  onReply,
  index,
}: {
  msg: GroupMessageView;
  isMine: boolean;
  myId: string;
  onReply: (msg: GroupMessageView) => void;
  index: number;
}) {
  const [showActions, setShowActions] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const senderName = msg.senderDisplayName || msg.senderUsername || "User";
  const hasReactions = msg.reactions && msg.reactions.length > 0;

  return (
    <div
      className={`flex gap-2 ${isMine ? "justify-end" : "justify-start"}`}
      data-ocid={`groupchat.message.item.${index + 1}`}
    >
      {!isMine && (
        <GroupAvatar
          name={senderName}
          avatarUrl={msg.senderAvatarUrl}
          size="sm"
        />
      )}

      <div className="flex flex-col max-w-[75%]">
        {!isMine && (
          <span className="text-[11px] text-muted-foreground mb-0.5 ml-1">
            {senderName}
          </span>
        )}

        <div
          className="relative group"
          onMouseEnter={() => setShowActions(true)}
          onMouseLeave={() => {
            setShowActions(false);
            setShowEmojiPicker(false);
          }}
        >
          {/* Reply preview */}
          {msg.replyToId && (
            <div
              className={`px-3 py-1.5 rounded-t-2xl text-xs text-muted-foreground border-b border-border/50 ${
                isMine
                  ? "bg-primary/20 rounded-bl-md"
                  : "bg-muted rounded-br-md"
              }`}
            >
              Replying to message
            </div>
          )}

          <div
            className={`px-4 py-2.5 rounded-2xl ${
              isMine
                ? "bg-primary text-primary-foreground rounded-br-md"
                : "bg-card text-foreground rounded-bl-md shadow-sm"
            } ${msg.replyToId ? (isMine ? "rounded-tl-md" : "rounded-tr-md") : ""}`}
          >
            <p className="text-sm leading-relaxed">{msg.content}</p>
            {msg.mediaUrl && (
              <img
                src={msg.mediaUrl}
                alt="Media"
                className="mt-2 rounded-lg max-w-full max-h-48 object-cover"
              />
            )}
            <div
              className={`flex items-center gap-1.5 mt-1 ${
                isMine ? "justify-end" : "justify-start"
              }`}
            >
              <span
                className={`text-[10px] ${
                  isMine
                    ? "text-primary-foreground/70"
                    : "text-muted-foreground"
                }`}
              >
                {formatTime(msg.createdAt)}
              </span>
              {isMine && (
                <span className="text-[10px] text-primary-foreground/60">
                  {msg.status === "read"
                    ? "✓✓"
                    : msg.status === "delivered"
                      ? "✓✓"
                      : "✓"}
                </span>
              )}
            </div>
          </div>

          {/* Reactions */}
          {hasReactions && (
            <div
              className={`flex flex-wrap gap-1 mt-1 ${
                isMine ? "justify-end" : "justify-start"
              }`}
            >
              {msg.reactions.map(([emoji, users]) => (
                <span
                  key={emoji}
                  className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-xs bg-card border border-border shadow-sm ${
                    users.some((u) => u.toString() === myId)
                      ? "border-primary/50"
                      : ""
                  }`}
                >
                  {emoji} {users.length}
                </span>
              ))}
            </div>
          )}

          {/* Hover actions */}
          {showActions && (
            <div
              className={`absolute ${isMine ? "left-0 -translate-x-full mr-1" : "right-0 translate-x-full ml-1"} top-1/2 -translate-y-1/2 flex items-center gap-1`}
            >
              <button
                type="button"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className="w-7 h-7 rounded-full bg-card border border-border flex items-center justify-center text-xs shadow-sm hover:bg-muted transition-smooth"
                data-ocid={`groupchat.reaction_button.${index + 1}`}
              >
                😊
              </button>
              <button
                type="button"
                onClick={() => onReply(msg)}
                className="w-7 h-7 rounded-full bg-card border border-border flex items-center justify-center shadow-sm hover:bg-muted transition-smooth"
                data-ocid={`groupchat.reply_button.${index + 1}`}
              >
                <Reply size={12} className="text-foreground" />
              </button>
            </div>
          )}

          {/* Emoji picker */}
          {showEmojiPicker && (
            <div
              className={`absolute ${isMine ? "left-0 -translate-x-full" : "right-0 translate-x-full"} top-8 z-10 reaction-picker`}
            >
              {EMOJI_REACTIONS.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => setShowEmojiPicker(false)}
                  className="reaction-emoji"
                >
                  {emoji}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function SystemMessage({ content }: { content: string }) {
  return (
    <div className="flex justify-center my-2">
      <span className="px-3 py-1 rounded-full bg-muted text-[11px] text-muted-foreground">
        {content}
      </span>
    </div>
  );
}

function GroupInfoDrawer({
  group,
  myId,
  open,
  onClose,
}: {
  group: GroupChatView | undefined;
  myId: string;
  open: boolean;
  onClose: () => void;
}) {
  const [showAddMember, setShowAddMember] = useState(false);
  const [search, setSearch] = useState("");
  const [editingName, setEditingName] = useState(false);
  const [newName, setNewName] = useState("");
  const [newAvatar, setNewAvatar] = useState("");

  const addMember = useAddGroupMember();
  const removeMember = useRemoveGroupMember();
  const promoteAdmin = usePromoteGroupAdmin();
  const demoteAdmin = useDemoteGroupAdmin();
  const updateInfo = useUpdateGroupInfo();
  const leaveGroup = useLeaveGroup();
  const deleteGroup = useDeleteGroup();
  const navigate = useNavigate();
  const { data: searchUsers = [] } = useSearchUsers(search);

  const amAdmin = isAdmin(group, myId);

  function handleAddMember(userId: string) {
    if (!group) return;
    addMember.mutate(
      {
        groupId: group.groupId,
        userId: userId as unknown as Principal,
      },
      { onSuccess: () => setSearch("") },
    );
  }

  function handleRemoveMember(userId: string) {
    if (!group) return;
    removeMember.mutate({
      groupId: group.groupId,
      userId: userId as unknown as Principal,
    });
  }

  function handlePromote(userId: string) {
    if (!group) return;
    promoteAdmin.mutate({
      groupId: group.groupId,
      userId: userId as unknown as Principal,
    });
  }

  function handleDemote(userId: string) {
    if (!group) return;
    demoteAdmin.mutate({
      groupId: group.groupId,
      userId: userId as unknown as Principal,
    });
  }

  function handleUpdateInfo() {
    if (!group) return;
    updateInfo.mutate(
      {
        groupId: group.groupId,
        name: newName || null,
        avatarUrl: newAvatar || null,
      },
      {
        onSuccess: () => {
          setEditingName(false);
          setNewName("");
          setNewAvatar("");
        },
      },
    );
  }

  function handleLeave() {
    if (!group) return;
    leaveGroup.mutate(group.groupId, {
      onSuccess: () => {
        onClose();
        navigate({ to: "/chat/groups" });
      },
    });
  }

  function handleDelete() {
    if (!group) return;
    deleteGroup.mutate(group.groupId, {
      onSuccess: () => {
        onClose();
        navigate({ to: "/chat/groups" });
      },
    });
  }

  if (!open || !group) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div
        className="absolute inset-0 bg-background/40 backdrop-blur-sm"
        onClick={onClose}
        onKeyUp={onClose}
        role="button"
        tabIndex={0}
      />
      <div
        className="relative w-full max-w-sm h-full glass-modal rounded-l-3xl flex flex-col animate-fade-up"
        data-ocid="groupchat.info_drawer"
      >
        {/* Drawer header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3">
          <h2 className="font-display font-bold text-lg text-foreground">
            Group Info
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-muted flex items-center justify-center transition-smooth active:scale-95"
            data-ocid="groupchat.close_info_button"
            aria-label="Close"
          >
            <X size={16} className="text-foreground" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 pb-6 space-y-5">
          {/* Group header */}
          <div className="flex flex-col items-center py-4">
            <GroupAvatar
              name={group.name}
              avatarUrl={group.avatarUrl}
              size="lg"
            />
            {editingName ? (
              <div className="w-full mt-3 space-y-2">
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder={group.name}
                  className="w-full px-3 py-2 rounded-lg bg-card border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
                <input
                  type="text"
                  value={newAvatar}
                  onChange={(e) => setNewAvatar(e.target.value)}
                  placeholder="Avatar URL"
                  className="w-full px-3 py-2 rounded-lg bg-card border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleUpdateInfo}
                    className="flex-1 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold transition-smooth active:scale-95"
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingName(false);
                      setNewName("");
                      setNewAvatar("");
                    }}
                    className="flex-1 py-2 rounded-lg bg-muted text-foreground text-sm font-semibold transition-smooth active:scale-95"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <>
                <h3 className="font-display font-bold text-lg text-foreground mt-3">
                  {group.name}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {group.members.length} members
                </p>
                {amAdmin && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingName(true);
                      setNewName(group.name);
                      setNewAvatar(group.avatarUrl || "");
                    }}
                    className="mt-2 text-xs text-primary font-semibold"
                    data-ocid="groupchat.edit_info_button"
                  >
                    Edit Group
                  </button>
                )}
              </>
            )}
          </div>

          {/* Members */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Members
              </h4>
              {amAdmin && (
                <button
                  type="button"
                  onClick={() => setShowAddMember(!showAddMember)}
                  className="text-xs text-primary font-semibold flex items-center gap-1"
                  data-ocid="groupchat.add_member_button"
                >
                  <Plus size={12} />
                  Add
                </button>
              )}
            </div>

            {showAddMember && (
              <div className="mb-3 space-y-2">
                <div className="relative">
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search users..."
                    className="w-full px-3 py-2 rounded-lg bg-card border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
                <div className="max-h-32 overflow-y-auto space-y-1">
                  {searchUsers.map((user) => {
                    const id = user.id?.toString() ?? "";
                    const alreadyMember = isMember(group, id);
                    return (
                      <div
                        key={id}
                        className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-card"
                      >
                        <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center">
                          <span className="font-display font-bold text-[10px] text-primary">
                            {getInitials(
                              user.displayName || user.username || "User",
                            )}
                          </span>
                        </div>
                        <span className="text-sm text-foreground flex-1 truncate">
                          {user.displayName || user.username}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleAddMember(id)}
                          disabled={alreadyMember}
                          className="text-xs px-2 py-1 rounded-md bg-primary text-primary-foreground disabled:opacity-40 disabled:cursor-not-allowed transition-smooth active:scale-95"
                        >
                          {alreadyMember ? "Member" : "Add"}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="space-y-1">
              {group.memberProfiles?.map((profile, i) => {
                const pid = profile.id?.toString() ?? "";
                const isUserAdmin = group.adminIds.some(
                  (id) => id.toString() === pid,
                );
                const isMe = pid === myId;

                return (
                  <div
                    key={pid}
                    className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-card"
                    data-ocid={`groupchat.member.${i + 1}`}
                  >
                    <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                      <span className="font-display font-bold text-xs text-primary">
                        {getInitials(
                          profile.displayName || profile.username || "User",
                        )}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">
                        {profile.displayName || profile.username}
                        {isMe && (
                          <span className="text-muted-foreground font-normal ml-1">
                            (You)
                          </span>
                        )}
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        @{profile.username}
                      </p>
                    </div>
                    {isUserAdmin && (
                      <span className="group-chat-admin-badge">
                        <Crown size={9} />
                        Admin
                      </span>
                    )}
                    {amAdmin && !isMe && (
                      <div className="flex items-center gap-1">
                        {isUserAdmin ? (
                          <button
                            type="button"
                            onClick={() => handleDemote(pid)}
                            className="w-7 h-7 rounded-full bg-muted flex items-center justify-center hover:bg-destructive/10 transition-smooth"
                            title="Demote from admin"
                            data-ocid={`groupchat.demote_button.${i + 1}`}
                          >
                            <Shield
                              size={12}
                              className="text-muted-foreground"
                            />
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handlePromote(pid)}
                            className="w-7 h-7 rounded-full bg-muted flex items-center justify-center hover:bg-primary/10 transition-smooth"
                            title="Promote to admin"
                            data-ocid={`groupchat.promote_button.${i + 1}`}
                          >
                            <Crown size={12} className="text-primary" />
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleRemoveMember(pid)}
                          className="w-7 h-7 rounded-full bg-muted flex items-center justify-center hover:bg-destructive/10 transition-smooth"
                          title="Remove member"
                          data-ocid={`groupchat.remove_button.${i + 1}`}
                        >
                          <UserMinus size={12} className="text-destructive" />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-2 pt-2 border-t border-border">
            <button
              type="button"
              onClick={handleLeave}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-card hover:bg-destructive/5 text-destructive transition-smooth active:scale-[0.98] text-left"
              data-ocid="groupchat.leave_button"
            >
              <ArrowLeft size={16} />
              <span className="text-sm font-semibold">Leave Group</span>
            </button>
            {amAdmin && (
              <button
                type="button"
                onClick={handleDelete}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-card hover:bg-destructive/10 text-destructive transition-smooth active:scale-[0.98] text-left"
                data-ocid="groupchat.delete_button"
              >
                <Trash2 size={16} />
                <span className="text-sm font-semibold">Delete Group</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function GroupChatPage() {
  const navigate = useNavigate();
  const { groupId } = useParams({ from: "/chat/group/$groupId" });
  const { data: groups = [] } = useGroupChats();
  const { data: messages = [], isLoading } = useGroupMessages(groupId);
  const sendMessage = useSendGroupMessage();
  const { data: myProfile } = useMyProfile();

  const [input, setInput] = useState("");
  const [replyTo, setReplyTo] = useState<GroupMessageView | null>(null);
  const [showInfo, setShowInfo] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const group = groups.find((g) => g.groupId === groupId);
  const myId = myProfile?.id?.toString() ?? "";

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, []);

  function handleSend() {
    const text = input.trim();
    if (!text) return;
    sendMessage.mutate(
      {
        groupId,
        content: text,
        mediaUrl: null,
        replyToId: replyTo?.id ?? null,
      },
      {
        onSuccess: () => {
          setInput("");
          setReplyTo(null);
          inputRef.current?.focus();
        },
      },
    );
  }

  return (
    <div className="max-w-lg mx-auto h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-card/50 backdrop-blur-sm">
        <button
          type="button"
          onClick={() => navigate({ to: "/chat/groups" })}
          className="w-9 h-9 rounded-full bg-muted flex items-center justify-center transition-smooth active:scale-95"
          data-ocid="groupchat.back_button"
          aria-label="Back"
        >
          <ArrowLeft size={16} className="text-foreground" />
        </button>

        <button
          type="button"
          onClick={() => setShowInfo(true)}
          className="flex items-center gap-2.5 flex-1 min-w-0 text-left"
          data-ocid="groupchat.header_info_button"
        >
          <GroupAvatar
            name={group?.name ?? "Group"}
            avatarUrl={group?.avatarUrl}
            size="sm"
          />
          <div className="min-w-0">
            <p className="font-display font-semibold text-sm text-foreground truncate">
              {group?.name ?? "Group"}
            </p>
            <p className="text-[11px] text-muted-foreground">
              {group?.members.length ?? 0} members
            </p>
          </div>
        </button>

        <button
          type="button"
          onClick={() => setShowInfo(true)}
          className="w-9 h-9 rounded-full bg-muted flex items-center justify-center transition-smooth active:scale-95"
          data-ocid="groupchat.info_button"
          aria-label="Group Info"
        >
          <Info size={16} className="text-foreground" />
        </button>
      </div>

      {/* Messages */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-4 py-4 space-y-3"
      >
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className={`flex ${i % 2 === 0 ? "justify-start" : "justify-end"}`}
              >
                <Skeleton
                  className={`h-10 rounded-2xl ${i % 2 === 0 ? "w-48" : "w-40"}`}
                />
              </div>
            ))}
          </div>
        ) : messages.length === 0 ? (
          <div
            className="flex flex-col items-center justify-center py-16 text-center"
            data-ocid="groupchat.empty_state"
          >
            <p className="text-3xl mb-2">👥</p>
            <p className="font-display font-semibold text-foreground mb-1">
              Start the conversation
            </p>
            <p className="text-sm text-muted-foreground">
              Send a message to get the group chat going
            </p>
          </div>
        ) : (
          messages.map((msg, i) => {
            const isMine = msg.fromId.toString() === myId;

            // System messages
            if (msg.content.startsWith("__system:")) {
              return (
                <SystemMessage
                  key={String(msg.id)}
                  content={msg.content.replace("__system:", "")}
                />
              );
            }

            return (
              <MessageBubble
                key={String(msg.id)}
                msg={msg}
                isMine={isMine}
                myId={myId}
                onReply={setReplyTo}
                index={i}
              />
            );
          })
        )}
      </div>

      {/* Reply preview */}
      {replyTo && (
        <div className="px-4 py-2 bg-muted/50 border-t border-border flex items-center gap-2">
          <Reply size={14} className="text-primary flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-[11px] text-muted-foreground">
              Replying to{" "}
              {replyTo.senderDisplayName || replyTo.senderUsername || "User"}
            </p>
            <p className="text-xs text-foreground truncate">
              {replyTo.content}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setReplyTo(null)}
            className="w-6 h-6 rounded-full bg-muted flex items-center justify-center flex-shrink-0"
            data-ocid="groupchat.cancel_reply_button"
          >
            <X size={12} className="text-muted-foreground" />
          </button>
        </div>
      )}

      {/* Input bar */}
      <div className="px-4 py-3 border-t border-border bg-card/50 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="w-9 h-9 rounded-full bg-muted flex items-center justify-center flex-shrink-0 transition-smooth active:scale-95"
            data-ocid="groupchat.emoji_button"
            aria-label="Emoji"
          >
            <span className="text-lg">😊</span>
          </button>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSend();
            }}
            placeholder="Type a message..."
            className="flex-1 px-4 py-3 rounded-full bg-muted border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            data-ocid="groupchat.input"
          />
          <button
            type="button"
            onClick={handleSend}
            disabled={!input.trim() || sendMessage.isPending}
            className="w-11 h-11 rounded-full bg-primary text-primary-foreground flex items-center justify-center transition-smooth active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
            data-ocid="groupchat.send_button"
            aria-label="Send"
          >
            <Send size={18} />
          </button>
        </div>
      </div>

      {/* Group Info Drawer */}
      <GroupInfoDrawer
        group={group}
        myId={myId}
        open={showInfo}
        onClose={() => setShowInfo(false)}
      />
    </div>
  );
}
