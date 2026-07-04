import { c as createLucideIcon, u as useNavigate, a as useParams, j as jsxRuntimeExports, S as Skeleton } from "./index-BBmdRvnk.js";
import { H as useUserProfile, G as useUserPosts, g as useIsFollowing, h as useFollowUser, i as useUnfollowUser } from "./useBackend-CcBHNUn3.js";
import { A as ArrowLeft } from "./arrow-left-BcjYN8zZ.js";
import { U as UserPlus } from "./user-plus-0p9Z1W1A.js";
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode = [
  ["path", { d: "m16 11 2 2 4-4", key: "9rsbq5" }],
  ["path", { d: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2", key: "1yyitq" }],
  ["circle", { cx: "9", cy: "7", r: "4", key: "nufk8" }]
];
const UserCheck = createLucideIcon("user-check", __iconNode);
function getInitials(name) {
  return name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
}
function formatCount(n) {
  const v = typeof n === "bigint" ? Number(n) : n;
  if (v >= 1e6) return `${(v / 1e6).toFixed(1)}M`;
  if (v >= 1e3) return `${(v / 1e3).toFixed(1)}K`;
  return String(v);
}
function PostThumbnail({ post, index }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "div",
    {
      className: "aspect-square rounded-xl overflow-hidden bg-muted/40 cursor-pointer transition-smooth hover:opacity-90 active:scale-95",
      "data-ocid": `userprofile.post.item.${index + 1}`,
      children: post.mediaUrl ? /* @__PURE__ */ jsxRuntimeExports.jsx(
        "img",
        {
          src: post.mediaUrl,
          alt: "",
          className: "w-full h-full object-cover",
          loading: "lazy"
        }
      ) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-full h-full flex items-center justify-center p-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] text-muted-foreground line-clamp-3 leading-snug", children: post.caption }) })
    }
  );
}
function UserProfilePage() {
  const navigate = useNavigate();
  const { userId } = useParams({ from: "/profile/$userId" });
  const { data: profile, isLoading: profileLoading } = useUserProfile(userId);
  const { data: posts = [], isLoading: postsLoading } = useUserPosts(userId);
  const { data: isFollowing = false } = useIsFollowing(userId);
  const followUser = useFollowUser();
  const unfollowUser = useUnfollowUser();
  const displayName = (profile == null ? void 0 : profile.displayName) ?? "User";
  const username = (profile == null ? void 0 : profile.username) ?? "user";
  const bio = (profile == null ? void 0 : profile.bio) ?? "";
  const avatarUrl = profile == null ? void 0 : profile.avatarUrl;
  const followersCount = (profile == null ? void 0 : profile.followersCount) ?? 0n;
  const followingCount = (profile == null ? void 0 : profile.followingCount) ?? 0n;
  const postsCount = BigInt(posts.length);
  function handleFollowToggle() {
    if (isFollowing) {
      unfollowUser.mutate(userId);
    } else {
      followUser.mutate(userId);
    }
  }
  if (profileLoading) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-4 pt-4 pb-8 space-y-4 max-w-lg mx-auto", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-32 w-full rounded-2xl" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-center -mt-10", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "w-20 h-20 rounded-full" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-6 w-40 mx-auto" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-4 w-24 mx-auto" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-3 gap-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-14 rounded-xl" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-14 rounded-xl" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-14 rounded-xl" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-3 gap-2", children: [1, 2, 3, 4, 5, 6].map((i) => /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "aspect-square rounded-xl" }, i)) })
    ] });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "pb-8 max-w-lg mx-auto", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "relative h-32 bg-gradient-to-b from-muted to-background", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      "button",
      {
        type: "button",
        onClick: () => navigate({ to: "/explore" }),
        className: "absolute top-3 left-3 w-9 h-9 rounded-full bg-card/80 backdrop-blur-sm flex items-center justify-center shadow-sm transition-smooth active:scale-95",
        "data-ocid": "userprofile.back_button",
        "aria-label": "Back",
        children: /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, { size: 16, className: "text-foreground" })
      }
    ) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-5 -mt-10 relative", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-end justify-between", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-20 h-20 rounded-full bg-card border-4 border-background shadow-md flex items-center justify-center overflow-hidden", children: avatarUrl ? /* @__PURE__ */ jsxRuntimeExports.jsx(
          "img",
          {
            src: avatarUrl,
            alt: "",
            className: "w-full h-full object-cover"
          }
        ) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-display font-bold text-xl text-primary", children: getInitials(displayName) }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            type: "button",
            onClick: handleFollowToggle,
            disabled: followUser.isPending || unfollowUser.isPending,
            className: `mb-1 flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-semibold transition-smooth active:scale-95 disabled:opacity-50 ${isFollowing ? "bg-primary text-primary-foreground" : "border border-primary text-primary hover:bg-primary/5"}`,
            "data-ocid": "userprofile.follow_button",
            children: isFollowing ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(UserCheck, { size: 14 }),
              "Following"
            ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(UserPlus, { size: 14 }),
              "Follow"
            ] })
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "font-display font-bold text-xl text-foreground leading-tight", children: displayName }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-muted-foreground", children: [
          "@",
          username
        ] }),
        bio && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground mt-2 italic leading-relaxed", children: bio })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-3 gap-2 mt-4", children: [
        { label: "Posts", value: formatCount(postsCount) },
        { label: "Followers", value: formatCount(followersCount) },
        { label: "Following", value: formatCount(followingCount) }
      ].map((stat) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "div",
        {
          className: "text-center py-2 rounded-xl bg-card shadow-sm",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-display font-bold text-base text-foreground", children: stat.value }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] text-muted-foreground uppercase tracking-wide", children: stat.label })
          ]
        },
        stat.label
      )) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-4 mt-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-display font-semibold text-sm text-foreground mb-3", children: "Posts" }),
      postsLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-3 gap-2", children: [1, 2, 3, 4, 5, 6].map((i) => /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "aspect-square rounded-xl" }, i)) }) : posts.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "div",
        {
          className: "text-center py-12 bg-card rounded-2xl",
          "data-ocid": "userprofile.posts.empty_state",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-3xl mb-2", children: "📷" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-display font-semibold text-foreground mb-1", children: "No posts yet" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "This user hasn't shared anything yet" })
          ]
        }
      ) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-3 gap-2", children: posts.map((post, i) => /* @__PURE__ */ jsxRuntimeExports.jsx(PostThumbnail, { post, index: i }, String(post.id))) })
    ] })
  ] });
}
export {
  UserProfilePage as default
};
