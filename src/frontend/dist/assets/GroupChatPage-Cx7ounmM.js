import { c as createLucideIcon, u as useNavigate, a as useParams, r as reactExports, j as jsxRuntimeExports, S as Skeleton } from "./index-BBmdRvnk.js";
import { t as useGroupChats, x as useGroupMessages, y as useSendGroupMessage, s as useMyProfile, z as useAddGroupMember, A as useRemoveGroupMember, B as usePromoteGroupAdmin, C as useDemoteGroupAdmin, D as useUpdateGroupInfo, E as useLeaveGroup, F as useDeleteGroup, w as useSearchUsers } from "./useBackend-CcBHNUn3.js";
import { A as ArrowLeft } from "./arrow-left-BcjYN8zZ.js";
import { X } from "./x-1QW4ZYNO.js";
import { S as Send } from "./send-RMLAsjpe.js";
import { P as Plus } from "./plus-C5Z1jNYO.js";
import { C as Crown } from "./crown-COE5gTfo.js";
import { S as Shield } from "./shield-DgdvRXMv.js";
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode$3 = [
  ["circle", { cx: "12", cy: "12", r: "10", key: "1mglay" }],
  ["path", { d: "M12 16v-4", key: "1dtifu" }],
  ["path", { d: "M12 8h.01", key: "e9boi3" }]
];
const Info = createLucideIcon("info", __iconNode$3);
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode$2 = [
  ["path", { d: "M20 18v-2a4 4 0 0 0-4-4H4", key: "5vmcpk" }],
  ["path", { d: "m9 17-5-5 5-5", key: "nvlc11" }]
];
const Reply = createLucideIcon("reply", __iconNode$2);
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode$1 = [
  ["path", { d: "M3 6h18", key: "d0wm0j" }],
  ["path", { d: "M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6", key: "4alrt4" }],
  ["path", { d: "M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2", key: "v07s0e" }],
  ["line", { x1: "10", x2: "10", y1: "11", y2: "17", key: "1uufr5" }],
  ["line", { x1: "14", x2: "14", y1: "11", y2: "17", key: "xtxkd" }]
];
const Trash2 = createLucideIcon("trash-2", __iconNode$1);
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode = [
  ["path", { d: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2", key: "1yyitq" }],
  ["circle", { cx: "9", cy: "7", r: "4", key: "nufk8" }],
  ["line", { x1: "22", x2: "16", y1: "11", y2: "11", key: "1shjgl" }]
];
const UserMinus = createLucideIcon("user-minus", __iconNode);
const EMOJI_REACTIONS = ["❤️", "😂", "😮", "😢", "👍", "🔥"];
function formatTime(ts) {
  const d = new Date(Number(ts) / 1e6);
  return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}
function getInitials(name) {
  return name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
}
function isAdmin(group, userId) {
  if (!group) return false;
  return group.adminIds.some((id) => id.toString() === userId);
}
function isMember(group, userId) {
  if (!group) return false;
  return group.members.some((id) => id.toString() === userId);
}
function GroupAvatar({
  name,
  avatarUrl,
  size = "md"
}) {
  const sizeClasses = {
    sm: "w-7 h-7 text-[10px]",
    md: "w-10 h-10 text-xs",
    lg: "w-16 h-16 text-lg"
  };
  if (avatarUrl) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      "img",
      {
        src: avatarUrl,
        alt: name,
        className: `${sizeClasses[size]} rounded-full object-cover flex-shrink-0`
      }
    );
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "div",
    {
      className: `${sizeClasses[size]} rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0`,
      children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-display font-bold text-primary", children: getInitials(name) })
    }
  );
}
function MessageBubble({
  msg,
  isMine,
  myId,
  onReply,
  index
}) {
  const [showActions, setShowActions] = reactExports.useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = reactExports.useState(false);
  const senderName = msg.senderDisplayName || msg.senderUsername || "User";
  const hasReactions = msg.reactions && msg.reactions.length > 0;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      className: `flex gap-2 ${isMine ? "justify-end" : "justify-start"}`,
      "data-ocid": `groupchat.message.item.${index + 1}`,
      children: [
        !isMine && /* @__PURE__ */ jsxRuntimeExports.jsx(
          GroupAvatar,
          {
            name: senderName,
            avatarUrl: msg.senderAvatarUrl,
            size: "sm"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col max-w-[75%]", children: [
          !isMine && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[11px] text-muted-foreground mb-0.5 ml-1", children: senderName }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "div",
            {
              className: "relative group",
              onMouseEnter: () => setShowActions(true),
              onMouseLeave: () => {
                setShowActions(false);
                setShowEmojiPicker(false);
              },
              children: [
                msg.replyToId && /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "div",
                  {
                    className: `px-3 py-1.5 rounded-t-2xl text-xs text-muted-foreground border-b border-border/50 ${isMine ? "bg-primary/20 rounded-bl-md" : "bg-muted rounded-br-md"}`,
                    children: "Replying to message"
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  "div",
                  {
                    className: `px-4 py-2.5 rounded-2xl ${isMine ? "bg-primary text-primary-foreground rounded-br-md" : "bg-card text-foreground rounded-bl-md shadow-sm"} ${msg.replyToId ? isMine ? "rounded-tl-md" : "rounded-tr-md" : ""}`,
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm leading-relaxed", children: msg.content }),
                      msg.mediaUrl && /* @__PURE__ */ jsxRuntimeExports.jsx(
                        "img",
                        {
                          src: msg.mediaUrl,
                          alt: "Media",
                          className: "mt-2 rounded-lg max-w-full max-h-48 object-cover"
                        }
                      ),
                      /* @__PURE__ */ jsxRuntimeExports.jsxs(
                        "div",
                        {
                          className: `flex items-center gap-1.5 mt-1 ${isMine ? "justify-end" : "justify-start"}`,
                          children: [
                            /* @__PURE__ */ jsxRuntimeExports.jsx(
                              "span",
                              {
                                className: `text-[10px] ${isMine ? "text-primary-foreground/70" : "text-muted-foreground"}`,
                                children: formatTime(msg.createdAt)
                              }
                            ),
                            isMine && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] text-primary-foreground/60", children: msg.status === "read" ? "✓✓" : msg.status === "delivered" ? "✓✓" : "✓" })
                          ]
                        }
                      )
                    ]
                  }
                ),
                hasReactions && /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "div",
                  {
                    className: `flex flex-wrap gap-1 mt-1 ${isMine ? "justify-end" : "justify-start"}`,
                    children: msg.reactions.map(([emoji, users]) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
                      "span",
                      {
                        className: `inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-xs bg-card border border-border shadow-sm ${users.some((u) => u.toString() === myId) ? "border-primary/50" : ""}`,
                        children: [
                          emoji,
                          " ",
                          users.length
                        ]
                      },
                      emoji
                    ))
                  }
                ),
                showActions && /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  "div",
                  {
                    className: `absolute ${isMine ? "left-0 -translate-x-full mr-1" : "right-0 translate-x-full ml-1"} top-1/2 -translate-y-1/2 flex items-center gap-1`,
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                        "button",
                        {
                          type: "button",
                          onClick: () => setShowEmojiPicker(!showEmojiPicker),
                          className: "w-7 h-7 rounded-full bg-card border border-border flex items-center justify-center text-xs shadow-sm hover:bg-muted transition-smooth",
                          "data-ocid": `groupchat.reaction_button.${index + 1}`,
                          children: "😊"
                        }
                      ),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                        "button",
                        {
                          type: "button",
                          onClick: () => onReply(msg),
                          className: "w-7 h-7 rounded-full bg-card border border-border flex items-center justify-center shadow-sm hover:bg-muted transition-smooth",
                          "data-ocid": `groupchat.reply_button.${index + 1}`,
                          children: /* @__PURE__ */ jsxRuntimeExports.jsx(Reply, { size: 12, className: "text-foreground" })
                        }
                      )
                    ]
                  }
                ),
                showEmojiPicker && /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "div",
                  {
                    className: `absolute ${isMine ? "left-0 -translate-x-full" : "right-0 translate-x-full"} top-8 z-10 reaction-picker`,
                    children: EMOJI_REACTIONS.map((emoji) => /* @__PURE__ */ jsxRuntimeExports.jsx(
                      "button",
                      {
                        type: "button",
                        onClick: () => setShowEmojiPicker(false),
                        className: "reaction-emoji",
                        children: emoji
                      },
                      emoji
                    ))
                  }
                )
              ]
            }
          )
        ] })
      ]
    }
  );
}
function SystemMessage({ content }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-center my-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "px-3 py-1 rounded-full bg-muted text-[11px] text-muted-foreground", children: content }) });
}
function GroupInfoDrawer({
  group,
  myId,
  open,
  onClose
}) {
  var _a;
  const [showAddMember, setShowAddMember] = reactExports.useState(false);
  const [search, setSearch] = reactExports.useState("");
  const [editingName, setEditingName] = reactExports.useState(false);
  const [newName, setNewName] = reactExports.useState("");
  const [newAvatar, setNewAvatar] = reactExports.useState("");
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
  function handleAddMember(userId) {
    if (!group) return;
    addMember.mutate(
      {
        groupId: group.groupId,
        userId
      },
      { onSuccess: () => setSearch("") }
    );
  }
  function handleRemoveMember(userId) {
    if (!group) return;
    removeMember.mutate({
      groupId: group.groupId,
      userId
    });
  }
  function handlePromote(userId) {
    if (!group) return;
    promoteAdmin.mutate({
      groupId: group.groupId,
      userId
    });
  }
  function handleDemote(userId) {
    if (!group) return;
    demoteAdmin.mutate({
      groupId: group.groupId,
      userId
    });
  }
  function handleUpdateInfo() {
    if (!group) return;
    updateInfo.mutate(
      {
        groupId: group.groupId,
        name: newName || null,
        avatarUrl: newAvatar || null
      },
      {
        onSuccess: () => {
          setEditingName(false);
          setNewName("");
          setNewAvatar("");
        }
      }
    );
  }
  function handleLeave() {
    if (!group) return;
    leaveGroup.mutate(group.groupId, {
      onSuccess: () => {
        onClose();
        navigate({ to: "/chat/groups" });
      }
    });
  }
  function handleDelete() {
    if (!group) return;
    deleteGroup.mutate(group.groupId, {
      onSuccess: () => {
        onClose();
        navigate({ to: "/chat/groups" });
      }
    });
  }
  if (!open || !group) return null;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "fixed inset-0 z-50 flex justify-end", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "div",
      {
        className: "absolute inset-0 bg-background/40 backdrop-blur-sm",
        onClick: onClose,
        onKeyUp: onClose,
        role: "button",
        tabIndex: 0
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "div",
      {
        className: "relative w-full max-w-sm h-full glass-modal rounded-l-3xl flex flex-col animate-fade-up",
        "data-ocid": "groupchat.info_drawer",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between px-5 pt-5 pb-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-display font-bold text-lg text-foreground", children: "Group Info" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                type: "button",
                onClick: onClose,
                className: "w-8 h-8 rounded-full bg-muted flex items-center justify-center transition-smooth active:scale-95",
                "data-ocid": "groupchat.close_info_button",
                "aria-label": "Close",
                children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { size: 16, className: "text-foreground" })
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 overflow-y-auto px-5 pb-6 space-y-5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center py-4", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                GroupAvatar,
                {
                  name: group.name,
                  avatarUrl: group.avatarUrl,
                  size: "lg"
                }
              ),
              editingName ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-full mt-3 space-y-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "input",
                  {
                    type: "text",
                    value: newName,
                    onChange: (e) => setNewName(e.target.value),
                    placeholder: group.name,
                    className: "w-full px-3 py-2 rounded-lg bg-card border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "input",
                  {
                    type: "text",
                    value: newAvatar,
                    onChange: (e) => setNewAvatar(e.target.value),
                    placeholder: "Avatar URL",
                    className: "w-full px-3 py-2 rounded-lg bg-card border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "button",
                    {
                      type: "button",
                      onClick: handleUpdateInfo,
                      className: "flex-1 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold transition-smooth active:scale-95",
                      children: "Save"
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "button",
                    {
                      type: "button",
                      onClick: () => {
                        setEditingName(false);
                        setNewName("");
                        setNewAvatar("");
                      },
                      className: "flex-1 py-2 rounded-lg bg-muted text-foreground text-sm font-semibold transition-smooth active:scale-95",
                      children: "Cancel"
                    }
                  )
                ] })
              ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-display font-bold text-lg text-foreground mt-3", children: group.name }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-muted-foreground", children: [
                  group.members.length,
                  " members"
                ] }),
                amAdmin && /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "button",
                  {
                    type: "button",
                    onClick: () => {
                      setEditingName(true);
                      setNewName(group.name);
                      setNewAvatar(group.avatarUrl || "");
                    },
                    className: "mt-2 text-xs text-primary font-semibold",
                    "data-ocid": "groupchat.edit_info_button",
                    children: "Edit Group"
                  }
                )
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "text-xs font-semibold text-muted-foreground uppercase tracking-wider", children: "Members" }),
                amAdmin && /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  "button",
                  {
                    type: "button",
                    onClick: () => setShowAddMember(!showAddMember),
                    className: "text-xs text-primary font-semibold flex items-center gap-1",
                    "data-ocid": "groupchat.add_member_button",
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { size: 12 }),
                      "Add"
                    ]
                  }
                )
              ] }),
              showAddMember && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-3 space-y-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "relative", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "input",
                  {
                    type: "text",
                    value: search,
                    onChange: (e) => setSearch(e.target.value),
                    placeholder: "Search users...",
                    className: "w-full px-3 py-2 rounded-lg bg-card border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                  }
                ) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "max-h-32 overflow-y-auto space-y-1", children: searchUsers.map((user) => {
                  var _a2;
                  const id = ((_a2 = user.id) == null ? void 0 : _a2.toString()) ?? "";
                  const alreadyMember = isMember(group, id);
                  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
                    "div",
                    {
                      className: "flex items-center gap-2 px-2 py-1.5 rounded-lg bg-card",
                      children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-7 h-7 rounded-full bg-muted flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-display font-bold text-[10px] text-primary", children: getInitials(
                          user.displayName || user.username || "User"
                        ) }) }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm text-foreground flex-1 truncate", children: user.displayName || user.username }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx(
                          "button",
                          {
                            type: "button",
                            onClick: () => handleAddMember(id),
                            disabled: alreadyMember,
                            className: "text-xs px-2 py-1 rounded-md bg-primary text-primary-foreground disabled:opacity-40 disabled:cursor-not-allowed transition-smooth active:scale-95",
                            children: alreadyMember ? "Member" : "Add"
                          }
                        )
                      ]
                    },
                    id
                  );
                }) })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-1", children: (_a = group.memberProfiles) == null ? void 0 : _a.map((profile, i) => {
                var _a2;
                const pid = ((_a2 = profile.id) == null ? void 0 : _a2.toString()) ?? "";
                const isUserAdmin = group.adminIds.some(
                  (id) => id.toString() === pid
                );
                const isMe = pid === myId;
                return /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  "div",
                  {
                    className: "flex items-center gap-2 px-3 py-2.5 rounded-xl bg-card",
                    "data-ocid": `groupchat.member.${i + 1}`,
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-9 h-9 rounded-full bg-muted flex items-center justify-center flex-shrink-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-display font-bold text-xs text-primary", children: getInitials(
                        profile.displayName || profile.username || "User"
                      ) }) }),
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm font-semibold text-foreground truncate", children: [
                          profile.displayName || profile.username,
                          isMe && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground font-normal ml-1", children: "(You)" })
                        ] }),
                        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-[11px] text-muted-foreground", children: [
                          "@",
                          profile.username
                        ] })
                      ] }),
                      isUserAdmin && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "group-chat-admin-badge", children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx(Crown, { size: 9 }),
                        "Admin"
                      ] }),
                      amAdmin && !isMe && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1", children: [
                        isUserAdmin ? /* @__PURE__ */ jsxRuntimeExports.jsx(
                          "button",
                          {
                            type: "button",
                            onClick: () => handleDemote(pid),
                            className: "w-7 h-7 rounded-full bg-muted flex items-center justify-center hover:bg-destructive/10 transition-smooth",
                            title: "Demote from admin",
                            "data-ocid": `groupchat.demote_button.${i + 1}`,
                            children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                              Shield,
                              {
                                size: 12,
                                className: "text-muted-foreground"
                              }
                            )
                          }
                        ) : /* @__PURE__ */ jsxRuntimeExports.jsx(
                          "button",
                          {
                            type: "button",
                            onClick: () => handlePromote(pid),
                            className: "w-7 h-7 rounded-full bg-muted flex items-center justify-center hover:bg-primary/10 transition-smooth",
                            title: "Promote to admin",
                            "data-ocid": `groupchat.promote_button.${i + 1}`,
                            children: /* @__PURE__ */ jsxRuntimeExports.jsx(Crown, { size: 12, className: "text-primary" })
                          }
                        ),
                        /* @__PURE__ */ jsxRuntimeExports.jsx(
                          "button",
                          {
                            type: "button",
                            onClick: () => handleRemoveMember(pid),
                            className: "w-7 h-7 rounded-full bg-muted flex items-center justify-center hover:bg-destructive/10 transition-smooth",
                            title: "Remove member",
                            "data-ocid": `groupchat.remove_button.${i + 1}`,
                            children: /* @__PURE__ */ jsxRuntimeExports.jsx(UserMinus, { size: 12, className: "text-destructive" })
                          }
                        )
                      ] })
                    ]
                  },
                  pid
                );
              }) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2 pt-2 border-t border-border", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "button",
                {
                  type: "button",
                  onClick: handleLeave,
                  className: "w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-card hover:bg-destructive/5 text-destructive transition-smooth active:scale-[0.98] text-left",
                  "data-ocid": "groupchat.leave_button",
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, { size: 16 }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-semibold", children: "Leave Group" })
                  ]
                }
              ),
              amAdmin && /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "button",
                {
                  type: "button",
                  onClick: handleDelete,
                  className: "w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-card hover:bg-destructive/10 text-destructive transition-smooth active:scale-[0.98] text-left",
                  "data-ocid": "groupchat.delete_button",
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { size: 16 }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-semibold", children: "Delete Group" })
                  ]
                }
              )
            ] })
          ] })
        ]
      }
    )
  ] });
}
function GroupChatPage() {
  var _a;
  const navigate = useNavigate();
  const { groupId } = useParams({ from: "/chat/group/$groupId" });
  const { data: groups = [] } = useGroupChats();
  const { data: messages = [], isLoading } = useGroupMessages(groupId);
  const sendMessage = useSendGroupMessage();
  const { data: myProfile } = useMyProfile();
  const [input, setInput] = reactExports.useState("");
  const [replyTo, setReplyTo] = reactExports.useState(null);
  const [showInfo, setShowInfo] = reactExports.useState(false);
  const scrollRef = reactExports.useRef(null);
  const inputRef = reactExports.useRef(null);
  const group = groups.find((g) => g.groupId === groupId);
  const myId = ((_a = myProfile == null ? void 0 : myProfile.id) == null ? void 0 : _a.toString()) ?? "";
  reactExports.useEffect(() => {
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
        replyToId: (replyTo == null ? void 0 : replyTo.id) ?? null
      },
      {
        onSuccess: () => {
          var _a2;
          setInput("");
          setReplyTo(null);
          (_a2 = inputRef.current) == null ? void 0 : _a2.focus();
        }
      }
    );
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-lg mx-auto h-full flex flex-col", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 px-4 py-3 border-b border-border bg-card/50 backdrop-blur-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          type: "button",
          onClick: () => navigate({ to: "/chat/groups" }),
          className: "w-9 h-9 rounded-full bg-muted flex items-center justify-center transition-smooth active:scale-95",
          "data-ocid": "groupchat.back_button",
          "aria-label": "Back",
          children: /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, { size: 16, className: "text-foreground" })
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "button",
        {
          type: "button",
          onClick: () => setShowInfo(true),
          className: "flex items-center gap-2.5 flex-1 min-w-0 text-left",
          "data-ocid": "groupchat.header_info_button",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              GroupAvatar,
              {
                name: (group == null ? void 0 : group.name) ?? "Group",
                avatarUrl: group == null ? void 0 : group.avatarUrl,
                size: "sm"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-display font-semibold text-sm text-foreground truncate", children: (group == null ? void 0 : group.name) ?? "Group" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-[11px] text-muted-foreground", children: [
                (group == null ? void 0 : group.members.length) ?? 0,
                " members"
              ] })
            ] })
          ]
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          type: "button",
          onClick: () => setShowInfo(true),
          className: "w-9 h-9 rounded-full bg-muted flex items-center justify-center transition-smooth active:scale-95",
          "data-ocid": "groupchat.info_button",
          "aria-label": "Group Info",
          children: /* @__PURE__ */ jsxRuntimeExports.jsx(Info, { size: 16, className: "text-foreground" })
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "div",
      {
        ref: scrollRef,
        className: "flex-1 overflow-y-auto px-4 py-4 space-y-3",
        children: isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-3", children: [1, 2, 3, 4].map((i) => /* @__PURE__ */ jsxRuntimeExports.jsx(
          "div",
          {
            className: `flex ${i % 2 === 0 ? "justify-start" : "justify-end"}`,
            children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              Skeleton,
              {
                className: `h-10 rounded-2xl ${i % 2 === 0 ? "w-48" : "w-40"}`
              }
            )
          },
          i
        )) }) : messages.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "div",
          {
            className: "flex flex-col items-center justify-center py-16 text-center",
            "data-ocid": "groupchat.empty_state",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-3xl mb-2", children: "👥" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-display font-semibold text-foreground mb-1", children: "Start the conversation" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Send a message to get the group chat going" })
            ]
          }
        ) : messages.map((msg, i) => {
          const isMine = msg.fromId.toString() === myId;
          if (msg.content.startsWith("__system:")) {
            return /* @__PURE__ */ jsxRuntimeExports.jsx(
              SystemMessage,
              {
                content: msg.content.replace("__system:", "")
              },
              String(msg.id)
            );
          }
          return /* @__PURE__ */ jsxRuntimeExports.jsx(
            MessageBubble,
            {
              msg,
              isMine,
              myId,
              onReply: setReplyTo,
              index: i
            },
            String(msg.id)
          );
        })
      }
    ),
    replyTo && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-4 py-2 bg-muted/50 border-t border-border flex items-center gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Reply, { size: 14, className: "text-primary flex-shrink-0" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-[11px] text-muted-foreground", children: [
          "Replying to",
          " ",
          replyTo.senderDisplayName || replyTo.senderUsername || "User"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-foreground truncate", children: replyTo.content })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          type: "button",
          onClick: () => setReplyTo(null),
          className: "w-6 h-6 rounded-full bg-muted flex items-center justify-center flex-shrink-0",
          "data-ocid": "groupchat.cancel_reply_button",
          children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { size: 12, className: "text-muted-foreground" })
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "px-4 py-3 border-t border-border bg-card/50 backdrop-blur-sm", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          type: "button",
          className: "w-9 h-9 rounded-full bg-muted flex items-center justify-center flex-shrink-0 transition-smooth active:scale-95",
          "data-ocid": "groupchat.emoji_button",
          "aria-label": "Emoji",
          children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-lg", children: "😊" })
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "input",
        {
          ref: inputRef,
          type: "text",
          value: input,
          onChange: (e) => setInput(e.target.value),
          onKeyDown: (e) => {
            if (e.key === "Enter") handleSend();
          },
          placeholder: "Type a message...",
          className: "flex-1 px-4 py-3 rounded-full bg-muted border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50",
          "data-ocid": "groupchat.input"
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          type: "button",
          onClick: handleSend,
          disabled: !input.trim() || sendMessage.isPending,
          className: "w-11 h-11 rounded-full bg-primary text-primary-foreground flex items-center justify-center transition-smooth active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed",
          "data-ocid": "groupchat.send_button",
          "aria-label": "Send",
          children: /* @__PURE__ */ jsxRuntimeExports.jsx(Send, { size: 18 })
        }
      )
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      GroupInfoDrawer,
      {
        group,
        myId,
        open: showInfo,
        onClose: () => setShowInfo(false)
      }
    )
  ] });
}
export {
  GroupChatPage as default
};
