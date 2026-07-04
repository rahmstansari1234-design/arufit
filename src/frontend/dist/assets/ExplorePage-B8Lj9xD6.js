import { c as createLucideIcon, r as reactExports, j as jsxRuntimeExports, U as User, u as useNavigate } from "./index-BBmdRvnk.js";
import { e as useTrendingPosts, f as useSuggestedUsers, g as useIsFollowing, h as useFollowUser, i as useUnfollowUser } from "./useBackend-CcBHNUn3.js";
import { S as Search } from "./search-DF2OFUbk.js";
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode = [["path", { d: "M20 6 9 17l-5-5", key: "1gmf2c" }]];
const Check = createLucideIcon("check", __iconNode);
const MOOD_FILTERS = [
  "All",
  "Gym",
  "Rest",
  "Eating",
  "Progress",
  "Mindset"
];
function timeAgo(ts) {
  const now = Date.now();
  const then = Number(ts) / 1e6;
  const diff = Math.max(0, now - then);
  const mins = Math.floor(diff / 6e4);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  return `${Math.floor(hrs / 24)}d`;
}
function MoodPill({ tag }) {
  if (!tag) return null;
  return /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "inline-flex items-center rounded-full bg-[#4CAF7D]/10 px-2 py-0.5 text-[10px] font-medium text-[#4CAF7D]", children: tag });
}
function PostGridCard({ post }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white rounded-xl shadow-sm border border-[#F5F5F5] overflow-hidden", children: [
    post.mediaUrl ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "aspect-square", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      "img",
      {
        src: post.mediaUrl,
        alt: "",
        className: "w-full h-full object-cover"
      }
    ) }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "aspect-square bg-[#F5F5F5] flex items-center justify-center p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-[#1A1A1A] line-clamp-4 text-center", children: post.caption }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-2.5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mb-1.5", children: [
        post.authorAvatarUrl ? /* @__PURE__ */ jsxRuntimeExports.jsx(
          "img",
          {
            src: post.authorAvatarUrl,
            alt: "",
            className: "w-5 h-5 rounded-full object-cover"
          }
        ) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-5 h-5 rounded-full bg-[#F5F5F5] flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(User, { className: "w-3 h-3 text-[#6B7280]" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[11px] text-[#1A1A1A] font-medium truncate", children: post.authorDisplayName })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(MoodPill, { tag: post.moodTag }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] text-[#6B7280]", children: timeAgo(post.createdAt) })
      ] })
    ] })
  ] });
}
function FollowButton({ userId }) {
  const { data: isFollowing } = useIsFollowing(userId);
  const follow = useFollowUser();
  const unfollow = useUnfollowUser();
  const handleClick = () => {
    if (isFollowing) {
      unfollow.mutate(userId);
    } else {
      follow.mutate(userId);
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "button",
    {
      type: "button",
      onClick: handleClick,
      disabled: follow.isPending || unfollow.isPending,
      className: `px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 ${isFollowing ? "bg-[#4CAF7D] text-white" : "border border-[#4CAF7D] text-[#4CAF7D] hover:bg-[#4CAF7D]/5"}`,
      "data-ocid": "explore.follow.button",
      children: follow.isPending || unfollow.isPending ? "..." : isFollowing ? /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "w-3 h-3" }),
        " Following"
      ] }) : "Follow"
    }
  );
}
function UserCard({
  user
}) {
  useNavigate();
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white rounded-xl shadow-sm border border-[#F5F5F5] p-4 flex items-center gap-3", children: [
    user.avatarUrl ? /* @__PURE__ */ jsxRuntimeExports.jsx(
      "img",
      {
        src: user.avatarUrl,
        alt: user.displayName,
        className: "w-12 h-12 rounded-full object-cover"
      }
    ) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-12 h-12 rounded-full bg-[#F5F5F5] flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(User, { className: "w-5 h-5 text-[#6B7280]" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-semibold text-[#1A1A1A] truncate", children: user.displayName }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-[#6B7280] truncate", children: [
        "@",
        user.username
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(FollowButton, { userId: user.id.toString() })
  ] });
}
function ExplorePage() {
  const [query, setQuery] = reactExports.useState("");
  const [activeFilter, setActiveFilter] = reactExports.useState("All");
  const { data: trendingPosts, isLoading: trendingLoading } = useTrendingPosts();
  const { data: allUsers, isLoading: usersLoading } = useSuggestedUsers();
  const filteredTrending = reactExports.useMemo(() => {
    if (!trendingPosts) return [];
    if (activeFilter === "All") return trendingPosts;
    return trendingPosts.filter((p) => p.moodTag === activeFilter);
  }, [trendingPosts, activeFilter]);
  reactExports.useMemo(() => {
    if (!trendingPosts) return [];
    if (activeFilter === "All") return trendingPosts;
    return trendingPosts.filter((p) => p.moodTag === activeFilter);
  }, [trendingPosts, activeFilter]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen bg-white", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("header", { className: "sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-[#F5F5F5]", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-4 py-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-xl font-bold font-display text-[#1A1A1A] mb-3", children: "Explore" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7280]" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "input",
          {
            type: "text",
            placeholder: "Search posts, people...",
            value: query,
            onChange: (e) => setQuery(e.target.value),
            className: "w-full pl-10 pr-4 py-2.5 bg-[#F5F5F5] rounded-xl text-sm text-[#1A1A1A] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#4CAF7D]/30 transition-all",
            "data-ocid": "explore.search_input"
          }
        )
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "px-4 py-3 border-b border-[#F5F5F5]", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex gap-2 overflow-x-auto scrollbar-hide", children: MOOD_FILTERS.map((filter) => /* @__PURE__ */ jsxRuntimeExports.jsx(
      "button",
      {
        type: "button",
        onClick: () => setActiveFilter(filter),
        className: `px-4 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all duration-200 ${activeFilter === filter ? "bg-[#4CAF7D] text-white" : "border border-[#E5E7EB] text-[#6B7280] hover:border-[#4CAF7D]/30"}`,
        "data-ocid": "explore.filter.tab",
        children: filter
      },
      filter
    )) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("main", { className: "px-4 py-4 space-y-6 mb-20", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-sm font-semibold text-[#1A1A1A] mb-3", children: "Trending Now" }),
        trendingLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 gap-3", children: ["t0", "t1", "t2", "t3"].map((id) => /* @__PURE__ */ jsxRuntimeExports.jsx(
          "div",
          {
            className: "aspect-square bg-[#F5F5F5] rounded-xl animate-pulse"
          },
          id
        )) }) : filteredTrending.length > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 gap-3", children: filteredTrending.map((post) => /* @__PURE__ */ jsxRuntimeExports.jsx(PostGridCard, { post }, post.id.toString())) }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-center py-8", children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-[#6B7280]", children: "No trending posts in this category yet" }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-sm font-semibold text-[#1A1A1A] mb-3", children: "Discover People" }),
        usersLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-3", children: ["u0", "u1", "u2"].map((id) => /* @__PURE__ */ jsxRuntimeExports.jsx(
          "div",
          {
            className: "h-16 bg-[#F5F5F5] rounded-xl animate-pulse"
          },
          id
        )) }) : allUsers && allUsers.length > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-3", children: allUsers.slice(0, 6).map((user) => /* @__PURE__ */ jsxRuntimeExports.jsx(UserCard, { user }, user.id.toString())) }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-center py-8", children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-[#6B7280]", children: "No users to discover yet" }) })
      ] })
    ] })
  ] });
}
export {
  ExplorePage as default
};
