import { c as createLucideIcon, u as useNavigate, r as reactExports, j as jsxRuntimeExports, S as Skeleton } from "./index-BBmdRvnk.js";
import { t as useGroupChats, v as useCreateGroup, w as useSearchUsers } from "./useBackend-CcBHNUn3.js";
import { A as ArrowLeft } from "./arrow-left-BcjYN8zZ.js";
import { S as Search } from "./search-DF2OFUbk.js";
import { P as Plus } from "./plus-C5Z1jNYO.js";
import { C as Crown } from "./crown-COE5gTfo.js";
import { X } from "./x-1QW4ZYNO.js";
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode = [
  ["path", { d: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2", key: "1yyitq" }],
  ["path", { d: "M16 3.128a4 4 0 0 1 0 7.744", key: "16gr8j" }],
  ["path", { d: "M22 21v-2a4 4 0 0 0-3-3.87", key: "kshegd" }],
  ["circle", { cx: "9", cy: "7", r: "4", key: "nufk8" }]
];
const Users = createLucideIcon("users", __iconNode);
function formatTime(ts) {
  if (!ts) return "";
  const d = new Date(Number(ts) / 1e6);
  const now = /* @__PURE__ */ new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 6e4);
  const diffHours = Math.floor(diffMs / 36e5);
  const diffDays = Math.floor(diffMs / 864e5);
  if (diffMins < 1) return "now";
  if (diffMins < 60) return `${diffMins}m`;
  if (diffHours < 24) return `${diffHours}h`;
  if (diffDays < 7) return `${diffDays}d`;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}
function getInitials(name) {
  return name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
}
function GroupAvatar({
  name,
  avatarUrl,
  size = "md"
}) {
  const sizeClasses = {
    sm: "w-9 h-9 text-xs",
    md: "w-12 h-12 text-sm",
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
function GroupCard({
  group,
  index
}) {
  const navigate = useNavigate();
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "button",
    {
      type: "button",
      onClick: () => navigate({
        to: "/chat/group/$groupId",
        params: { groupId: group.groupId }
      }),
      className: "w-full flex items-center gap-3 px-3 py-3 rounded-xl bg-card hover:bg-muted/50 transition-smooth active:scale-[0.98] text-left",
      "data-ocid": `groupchatlist.item.${index + 1}`,
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(GroupAvatar, { name: group.name, avatarUrl: group.avatarUrl }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold text-sm text-foreground truncate", children: group.name }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[11px] text-muted-foreground flex-shrink-0 ml-2", children: formatTime(group.lastMessageAt) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5 mt-0.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground truncate flex-1", children: group.lastMessage ?? "No messages yet" }),
            group.unreadCount > 0n && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "min-w-[18px] h-[18px] px-1.5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center flex-shrink-0 animate-pulse", children: Number(group.unreadCount) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1 mt-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Users, { size: 10, className: "text-muted-foreground" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-[10px] text-muted-foreground", children: [
              group.members.length,
              " members"
            ] }),
            group.adminIds.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-0.5 ml-1 text-[10px] text-primary", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Crown, { size: 9 }),
              group.adminIds.length,
              " admin",
              group.adminIds.length > 1 ? "s" : ""
            ] })
          ] })
        ] })
      ]
    }
  );
}
function CreateGroupSheet({
  open,
  onClose
}) {
  const [name, setName] = reactExports.useState("");
  const [avatarUrl, setAvatarUrl] = reactExports.useState("");
  const [search, setSearch] = reactExports.useState("");
  const [selectedIds, setSelectedIds] = reactExports.useState(/* @__PURE__ */ new Set());
  const createGroup = useCreateGroup();
  const { data: users = [] } = useSearchUsers(search);
  function toggleUser(id) {
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
      (id) => id
    );
    createGroup.mutate(
      { name: name.trim(), avatarUrl: avatarUrl || void 0, memberIds },
      {
        onSuccess: () => {
          onClose();
          setName("");
          setAvatarUrl("");
          setSelectedIds(/* @__PURE__ */ new Set());
        }
      }
    );
  }
  if (!open) return null;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "fixed inset-0 z-50 flex items-end justify-center", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "div",
      {
        className: "absolute inset-0 bg-background/60 backdrop-blur-sm",
        onClick: onClose,
        onKeyUp: onClose,
        role: "button",
        tabIndex: 0
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "div",
      {
        className: "relative w-full max-w-lg glass-modal rounded-t-3xl max-h-[85vh] flex flex-col animate-fade-up",
        "data-ocid": "groupchatlist.create_modal",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between px-5 pt-5 pb-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-display font-bold text-lg text-foreground", children: "New Group" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                type: "button",
                onClick: onClose,
                className: "w-8 h-8 rounded-full bg-muted flex items-center justify-center transition-smooth active:scale-95",
                "data-ocid": "groupchatlist.close_modal_button",
                "aria-label": "Close",
                children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { size: 16, className: "text-foreground" })
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 overflow-y-auto px-5 pb-6 space-y-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "label",
                {
                  htmlFor: "group-name-input",
                  className: "text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block",
                  children: "Group Name"
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "input",
                {
                  id: "group-name-input",
                  type: "text",
                  value: name,
                  onChange: (e) => setName(e.target.value),
                  placeholder: "e.g. Gym Squad",
                  className: "w-full px-4 py-3 rounded-xl bg-card border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50",
                  "data-ocid": "groupchatlist.name_input"
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "label",
                {
                  htmlFor: "group-avatar-input",
                  className: "text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block",
                  children: "Avatar URL (optional)"
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "input",
                {
                  id: "group-avatar-input",
                  type: "text",
                  value: avatarUrl,
                  onChange: (e) => setAvatarUrl(e.target.value),
                  placeholder: "https://...",
                  className: "w-full px-4 py-3 rounded-xl bg-card border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50",
                  "data-ocid": "groupchatlist.avatar_input"
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "label",
                {
                  htmlFor: "group-members-search",
                  className: "text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block",
                  children: [
                    "Add Members (",
                    selectedIds.size,
                    " selected)"
                  ]
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative mb-3", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Search,
                  {
                    size: 16,
                    className: "absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "input",
                  {
                    id: "group-members-search",
                    type: "text",
                    value: search,
                    onChange: (e) => setSearch(e.target.value),
                    placeholder: "Search users...",
                    className: "w-full pl-9 pr-4 py-2.5 rounded-xl bg-card border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50",
                    "data-ocid": "groupchatlist.search_input"
                  }
                )
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1 max-h-48 overflow-y-auto", children: [
                users.map((user) => {
                  var _a;
                  const id = ((_a = user.id) == null ? void 0 : _a.toString()) ?? "";
                  const isSelected = selectedIds.has(id);
                  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
                    "button",
                    {
                      type: "button",
                      onClick: () => toggleUser(id),
                      className: `w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-smooth text-left ${isSelected ? "bg-primary/10 border border-primary/30" : "bg-card hover:bg-muted/50 border border-transparent"}`,
                      "data-ocid": `groupchatlist.user_item.${id}`,
                      children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-9 h-9 rounded-full bg-muted flex items-center justify-center flex-shrink-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-display font-bold text-xs text-primary", children: getInitials(
                          user.displayName || user.username || "User"
                        ) }) }),
                        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-semibold text-foreground truncate", children: user.displayName || user.username }),
                          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground", children: [
                            "@",
                            user.username
                          ] })
                        ] }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx(
                          "div",
                          {
                            className: `w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-smooth ${isSelected ? "bg-primary border-primary" : "border-muted-foreground/40"}`,
                            children: isSelected && /* @__PURE__ */ jsxRuntimeExports.jsxs(
                              "svg",
                              {
                                width: "12",
                                height: "12",
                                viewBox: "0 0 12 12",
                                fill: "none",
                                children: [
                                  /* @__PURE__ */ jsxRuntimeExports.jsx("title", { children: "Selected" }),
                                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                                    "path",
                                    {
                                      d: "M2 6L5 9L10 3",
                                      stroke: "white",
                                      strokeWidth: "2",
                                      strokeLinecap: "round",
                                      strokeLinejoin: "round"
                                    }
                                  )
                                ]
                              }
                            )
                          }
                        )
                      ]
                    },
                    id
                  );
                }),
                search && users.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground text-center py-4", children: "No users found" })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                type: "button",
                onClick: handleCreate,
                disabled: !name.trim() || createGroup.isPending,
                className: "w-full py-3.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm transition-smooth active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed",
                "data-ocid": "groupchatlist.create_button",
                children: createGroup.isPending ? "Creating..." : "Create Group"
              }
            )
          ] })
        ]
      }
    )
  ] });
}
function GroupChatListPage() {
  const navigate = useNavigate();
  const { data: groups = [], isLoading } = useGroupChats();
  const [showCreate, setShowCreate] = reactExports.useState(false);
  const [search, setSearch] = reactExports.useState("");
  const filtered = groups.filter(
    (g) => g.name.toLowerCase().includes(search.toLowerCase())
  );
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-lg mx-auto h-full flex flex-col relative", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 px-4 pt-4 pb-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          type: "button",
          onClick: () => navigate({ to: "/chat" }),
          className: "w-9 h-9 rounded-full bg-muted flex items-center justify-center transition-smooth active:scale-95",
          "data-ocid": "groupchatlist.back_button",
          "aria-label": "Back",
          children: /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, { size: 16, className: "text-foreground" })
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "font-display font-bold text-xl text-foreground flex-1", children: "Groups" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "px-4 pb-3", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Search,
        {
          size: 16,
          className: "absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "input",
        {
          type: "text",
          value: search,
          onChange: (e) => setSearch(e.target.value),
          placeholder: "Search groups",
          className: "w-full pl-9 pr-4 py-2.5 rounded-xl bg-card border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50",
          "data-ocid": "groupchatlist.search_input"
        }
      )
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1 overflow-y-auto px-4 pb-24 space-y-1", children: isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2", children: [1, 2, 3, 4].map((i) => /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-20 w-full rounded-xl" }, i)) }) : filtered.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "div",
      {
        className: "flex flex-col items-center justify-center py-16 text-center",
        "data-ocid": "groupchatlist.empty_state",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Users, { size: 24, className: "text-muted-foreground" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-display font-semibold text-foreground mb-1", children: search ? "No results" : "No groups yet" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: search ? "Try a different search term" : "Create a group to start chatting together" })
        ]
      }
    ) : filtered.map((group, i) => /* @__PURE__ */ jsxRuntimeExports.jsx(GroupCard, { group, index: i }, group.groupId)) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "button",
      {
        type: "button",
        onClick: () => setShowCreate(true),
        className: "absolute bottom-6 right-4 w-14 h-14 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-elevated transition-smooth active:scale-90 hover:shadow-warm",
        style: {
          transitionTimingFunction: "cubic-bezier(0.34, 1.56, 0.64, 1)"
        },
        "data-ocid": "groupchatlist.new_group_button",
        "aria-label": "New Group",
        children: /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { size: 24 })
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      CreateGroupSheet,
      {
        open: showCreate,
        onClose: () => setShowCreate(false)
      }
    )
  ] });
}
export {
  GroupChatListPage as default
};
