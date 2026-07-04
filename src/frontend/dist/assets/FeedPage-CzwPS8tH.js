import { c as createLucideIcon, r as reactExports, j as jsxRuntimeExports, M as MessageCircle, u as useNavigate, B as Bell, U as User } from "./index-BBmdRvnk.js";
import { u as useReactToPost, a as useRemovePostReaction, b as usePostReactions, c as useHomeFeed, d as useActiveStories } from "./useBackend-CcBHNUn3.js";
import { H as Heart } from "./heart-aqTGjQUP.js";
import { P as Plus } from "./plus-C5Z1jNYO.js";
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode = [
  ["circle", { cx: "18", cy: "5", r: "3", key: "gq8acd" }],
  ["circle", { cx: "6", cy: "12", r: "3", key: "w7nqdw" }],
  ["circle", { cx: "18", cy: "19", r: "3", key: "1xt0gg" }],
  ["line", { x1: "8.59", x2: "15.42", y1: "13.51", y2: "17.49", key: "47mynk" }],
  ["line", { x1: "15.41", x2: "8.59", y1: "6.51", y2: "10.49", key: "1n3mei" }]
];
const Share2 = createLucideIcon("share-2", __iconNode);
const REACTION_EMOJIS = [
  { emoji: "❤️", label: "Like" },
  { emoji: "🧡", label: "Love" },
  { emoji: "😂", label: "Laugh" },
  { emoji: "😮", label: "Wow" },
  { emoji: "😢", label: "Sad" },
  { emoji: "😡", label: "Angry" }
];
function PostReactionPicker({
  postId,
  reactions,
  onClose,
  onBurst
}) {
  var _a;
  const reactMutation = useReactToPost();
  const removeMutation = useRemovePostReaction();
  const pickerRef = reactExports.useRef(null);
  const myReaction = ((_a = reactions.find((r) => r.reactedByMe)) == null ? void 0 : _a.emoji) ?? null;
  reactExports.useEffect(() => {
    function handleClickOutside(e) {
      if (pickerRef.current && !pickerRef.current.contains(e.target)) {
        onClose();
      }
    }
    function handleTouchOutside(e) {
      if (pickerRef.current && !pickerRef.current.contains(e.target)) {
        onClose();
      }
    }
    function handleEsc(e) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleTouchOutside);
    document.addEventListener("keydown", handleEsc);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleTouchOutside);
      document.removeEventListener("keydown", handleEsc);
    };
  }, [onClose]);
  const handleEmojiClick = (emoji, e) => {
    var _a2, _b;
    e.stopPropagation();
    let clientX;
    let clientY;
    if ("touches" in e) {
      clientX = ((_a2 = e.touches[0]) == null ? void 0 : _a2.clientX) ?? 0;
      clientY = ((_b = e.touches[0]) == null ? void 0 : _b.clientY) ?? 0;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }
    if (myReaction === emoji) {
      removeMutation.mutate(postId);
    } else {
      reactMutation.mutate({ postId, emoji });
      onBurst(emoji, clientX, clientY);
    }
    onClose();
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "fixed inset-0 z-50 flex items-end justify-center pb-24 sm:items-center sm:pb-0", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "div",
      {
        className: "absolute inset-0 bg-transparent",
        onClick: onClose,
        onKeyUp: onClose,
        role: "button",
        tabIndex: 0,
        "data-ocid": "reaction_picker.backdrop"
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "div",
      {
        ref: pickerRef,
        className: "reaction-picker relative z-10 animate-soft-pop",
        style: {
          animation: "soft-pop 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) both"
        },
        "data-ocid": "reaction_picker.panel",
        children: REACTION_EMOJIS.map(({ emoji, label }) => {
          const isActive = myReaction === emoji;
          return /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              type: "button",
              onClick: (e) => handleEmojiClick(emoji, e),
              onTouchStart: (e) => handleEmojiClick(emoji, e),
              className: `reaction-emoji ${isActive ? "active" : ""}`,
              style: {
                outline: isActive ? "2px solid oklch(var(--accent-primary))" : "none",
                outlineOffset: "2px",
                borderRadius: "50%",
                padding: "0.25rem"
              },
              "aria-label": label,
              "data-ocid": `reaction_picker.emoji.${label.toLowerCase()}`,
              children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-2xl leading-none select-none", children: emoji })
            },
            emoji
          );
        })
      }
    )
  ] });
}
function PostReactionBar({ post }) {
  var _a;
  const { data: reactions = [] } = usePostReactions(post.id);
  const [pickerOpen, setPickerOpen] = reactExports.useState(false);
  const [bursts, setBursts] = reactExports.useState([]);
  const burstIdRef = reactExports.useRef(0);
  const longPressTimer = reactExports.useRef(null);
  const isLongPress = reactExports.useRef(false);
  const myReaction = ((_a = reactions.find((r) => r.reactedByMe)) == null ? void 0 : _a.emoji) ?? null;
  const totalCount = reactions.reduce((sum, r) => sum + Number(r.count), 0);
  const topReactions = reactions.filter((r) => Number(r.count) > 0).slice(0, 3).map((r) => r.emoji);
  const handleBurst = reactExports.useCallback((emoji, x, y) => {
    const newParticles = [];
    const count = 3 + Math.floor(Math.random() * 3);
    for (let i = 0; i < count; i++) {
      const angle = Math.PI * 2 * i / count + Math.random() * 0.5;
      const distance = 40 + Math.random() * 60;
      newParticles.push({
        id: burstIdRef.current++,
        emoji,
        x,
        y,
        tx: Math.cos(angle) * distance,
        ty: Math.sin(angle) * distance - 40
      });
    }
    setBursts((prev) => [...prev, ...newParticles]);
    setTimeout(() => {
      setBursts(
        (prev) => prev.filter((p) => !newParticles.find((np) => np.id === p.id))
      );
    }, 800);
  }, []);
  const handleLikePressStart = () => {
    isLongPress.current = false;
    longPressTimer.current = setTimeout(() => {
      isLongPress.current = true;
      setPickerOpen(true);
    }, 500);
  };
  const handleLikePressEnd = (_e) => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
    if (!isLongPress.current) {
      setPickerOpen(true);
    }
  };
  const handleReactionBarClick = () => {
    setPickerOpen(true);
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    bursts.map((p) => /* @__PURE__ */ jsxRuntimeExports.jsx(
      "div",
      {
        className: "emoji-burst",
        style: {
          left: p.x,
          top: p.y,
          ["--tx"]: `${p.tx}px`,
          ["--ty"]: `${p.ty}px`
        },
        children: p.emoji
      },
      p.id
    )),
    totalCount > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "button",
      {
        type: "button",
        onClick: handleReactionBarClick,
        className: "flex items-center gap-1.5 px-4 py-2 group",
        "data-ocid": "feed.reaction_bar.button",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex -space-x-1", children: topReactions.map((emoji, _i) => /* @__PURE__ */ jsxRuntimeExports.jsx(
            "span",
            {
              className: "inline-flex items-center justify-center w-5 h-5 rounded-full bg-white dark:bg-[#1A1A1A] border border-[#F5F5F5] dark:border-[#333] text-xs",
              children: emoji
            },
            emoji
          )) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs text-[#6B7280] font-medium group-hover:text-[#4CAF7D] transition-colors", children: [
            totalCount,
            " ",
            totalCount === 1 ? "person reacted" : "people reacted"
          ] })
        ]
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-5 px-4 py-3 border-t border-[#F5F5F5] dark:border-[#333]", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "button",
        {
          type: "button",
          onMouseDown: handleLikePressStart,
          onMouseUp: handleLikePressEnd,
          onTouchStart: handleLikePressStart,
          onTouchEnd: handleLikePressEnd,
          className: "flex items-center gap-1.5 group select-none",
          "data-ocid": "feed.like.button",
          children: [
            myReaction ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xl leading-none transition-transform group-active:scale-90", children: myReaction }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Heart, { className: "w-5 h-5 text-[#6B7280] group-hover:text-[#4CAF7D] transition-colors" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "span",
              {
                className: `text-xs font-medium transition-all duration-200 ${myReaction ? "text-[#4CAF7D]" : "text-[#6B7280]"}`,
                style: {
                  animation: totalCount > 0 ? "soft-pop 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)" : "none"
                },
                children: totalCount > 0 ? totalCount : "Like"
              }
            )
          ]
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "button",
        {
          type: "button",
          className: "flex items-center gap-1.5 group",
          "data-ocid": "feed.comment.button",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(MessageCircle, { className: "w-5 h-5 text-[#6B7280] group-hover:text-[#4CAF7D] transition-colors" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-[#6B7280]", children: Number(post.commentsCount) > 0 ? Number(post.commentsCount) : "Comment" })
          ]
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          type: "button",
          className: "flex items-center gap-1.5 group ml-auto",
          "data-ocid": "feed.share.button",
          children: /* @__PURE__ */ jsxRuntimeExports.jsx(Share2, { className: "w-5 h-5 text-[#6B7280] group-hover:text-[#4CAF7D] transition-colors" })
        }
      )
    ] }),
    pickerOpen && /* @__PURE__ */ jsxRuntimeExports.jsx(
      PostReactionPicker,
      {
        postId: post.id,
        reactions,
        onClose: () => setPickerOpen(false),
        onBurst: handleBurst
      }
    )
  ] });
}
function timeAgo(ts) {
  const now = Date.now();
  const then = Number(ts) / 1e6;
  const diff = Math.max(0, now - then);
  const mins = Math.floor(diff / 6e4);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}
function MoodPill({ tag }) {
  if (!tag) return null;
  return /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "inline-flex items-center rounded-full bg-[#4CAF7D]/10 px-2.5 py-0.5 text-xs font-medium text-[#4CAF7D]", children: tag });
}
function StoryAvatar({
  story,
  onClick
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "button",
    {
      type: "button",
      onClick,
      className: "flex flex-col items-center gap-1.5 min-w-[72px]",
      "data-ocid": "story.item.button",
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "relative", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-14 h-14 rounded-full p-[2px] bg-gradient-to-tr from-[#4CAF7D] to-[#81C784]", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-full h-full rounded-full bg-white p-[2px]", children: story.authorAvatarUrl ? /* @__PURE__ */ jsxRuntimeExports.jsx(
          "img",
          {
            src: story.authorAvatarUrl,
            alt: story.authorDisplayName,
            className: "w-full h-full rounded-full object-cover"
          }
        ) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-full h-full rounded-full bg-[#F5F5F5] flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(User, { className: "w-5 h-5 text-[#6B7280]" }) }) }) }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[11px] text-[#1A1A1A] truncate max-w-[64px]", children: story.authorDisplayName })
      ]
    }
  );
}
function FeedCard({ post }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "article",
    {
      className: "bg-white dark:bg-[#1A1A1A] rounded-2xl shadow-sm border border-[#F5F5F5] dark:border-[#333] overflow-hidden animate-fade-up",
      "data-ocid": "feed.item.card",
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 p-4", children: [
          post.authorAvatarUrl ? /* @__PURE__ */ jsxRuntimeExports.jsx(
            "img",
            {
              src: post.authorAvatarUrl,
              alt: post.authorDisplayName,
              className: "w-10 h-10 rounded-full object-cover"
            }
          ) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-10 h-10 rounded-full bg-[#F5F5F5] dark:bg-[#333] flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(User, { className: "w-5 h-5 text-[#6B7280]" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-semibold text-[#1A1A1A] dark:text-white truncate", children: post.authorDisplayName }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-[#6B7280]", children: [
              "@",
              post.authorUsername,
              " · ",
              timeAgo(post.createdAt)
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(MoodPill, { tag: post.moodTag })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "px-4 pb-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-[#1A1A1A] dark:text-white leading-relaxed whitespace-pre-wrap", children: post.caption }) }),
        post.mediaUrl && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "px-4 pb-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          "img",
          {
            src: post.mediaUrl,
            alt: "Post",
            className: "w-full rounded-xl object-cover max-h-[400px]"
          }
        ) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(PostReactionBar, { post })
      ]
    }
  );
}
function SkeletonCard() {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white rounded-2xl shadow-sm border border-[#F5F5F5] overflow-hidden p-4 space-y-3", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-10 h-10 rounded-full bg-[#F5F5F5] animate-pulse" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2 flex-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-3 w-32 bg-[#F5F5F5] rounded animate-pulse" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-2.5 w-20 bg-[#F5F5F5] rounded animate-pulse" })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-3 w-full bg-[#F5F5F5] rounded animate-pulse" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-3 w-3/4 bg-[#F5F5F5] rounded animate-pulse" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-48 w-full bg-[#F5F5F5] rounded-xl animate-pulse" }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-4 pt-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-5 w-12 bg-[#F5F5F5] rounded animate-pulse" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-5 w-16 bg-[#F5F5F5] rounded animate-pulse" })
    ] })
  ] });
}
function SkeletonStory() {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center gap-1.5 min-w-[72px]", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-14 h-14 rounded-full bg-[#F5F5F5] animate-pulse" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-2.5 w-10 bg-[#F5F5F5] rounded animate-pulse" })
  ] });
}
function FeedPage() {
  const navigate = useNavigate();
  const { data: posts, isLoading: postsLoading } = useHomeFeed();
  const { data: stories, isLoading: storiesLoading } = useActiveStories();
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen bg-white", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("header", { className: "sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-[#F5F5F5]", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between px-4 py-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-xl font-bold font-display text-[#1A1A1A]", children: "Arufit" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "button",
        {
          type: "button",
          className: "relative p-2 rounded-full hover:bg-[#F5F5F5] transition-colors",
          "data-ocid": "feed.notifications.button",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Bell, { className: "w-5 h-5 text-[#1A1A1A]" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "absolute top-1.5 right-1.5 w-2 h-2 bg-[#4CAF7D] rounded-full" })
          ]
        }
      )
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "border-b border-[#F5F5F5] py-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-4 px-4 overflow-x-auto scrollbar-hide", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "button",
        {
          type: "button",
          onClick: () => navigate({ to: "/add" }),
          className: "flex flex-col items-center gap-1.5 min-w-[72px]",
          "data-ocid": "feed.your_story.button",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "relative", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-14 h-14 rounded-full bg-[#F5F5F5] flex items-center justify-center border-2 border-dashed border-[#4CAF7D]", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "w-5 h-5 text-[#4CAF7D]" }) }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[11px] text-[#6B7280]", children: "Your Story" })
          ]
        }
      ),
      storiesLoading ? Array.from({ length: 5 }, (_, i) => `story-${i}`).map((id) => /* @__PURE__ */ jsxRuntimeExports.jsx(SkeletonStory, {}, id)) : stories == null ? void 0 : stories.map((story) => /* @__PURE__ */ jsxRuntimeExports.jsx(
        StoryAvatar,
        {
          story,
          onClick: () => {
          }
        },
        story.id.toString()
      ))
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("main", { className: "px-4 py-4 space-y-4 mb-20", children: postsLoading ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(SkeletonCard, {}),
      /* @__PURE__ */ jsxRuntimeExports.jsx(SkeletonCard, {}),
      /* @__PURE__ */ jsxRuntimeExports.jsx(SkeletonCard, {})
    ] }) : posts && posts.length > 0 ? posts.map((post) => /* @__PURE__ */ jsxRuntimeExports.jsx(FeedCard, { post }, post.id.toString())) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center justify-center py-20 text-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-16 h-16 rounded-full bg-[#F5F5F5] flex items-center justify-center mb-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(User, { className: "w-8 h-8 text-[#6B7280]" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-lg font-semibold text-[#1A1A1A] mb-1", children: "Follow people to see their posts here" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-[#6B7280] max-w-xs", children: "Discover fitness enthusiasts on the Explore tab and start building your community" })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "button",
      {
        type: "button",
        onClick: () => navigate({ to: "/add" }),
        className: "fixed bottom-24 right-4 w-14 h-14 rounded-full bg-[#4CAF7D] text-white shadow-lg flex items-center justify-center hover:bg-[#43A047] active:scale-95 transition-all z-40",
        "data-ocid": "feed.add_button",
        children: /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "w-6 h-6" })
      }
    )
  ] });
}
export {
  FeedPage as default
};
