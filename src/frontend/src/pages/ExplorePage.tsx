import { useNavigate } from "@tanstack/react-router";
import { Check, Search, User } from "lucide-react";
import { useMemo, useState } from "react";
import {
  useFollowUser,
  useIsFollowing,
  useSuggestedUsers,
  useTrendingPosts,
  useUnfollowUser,
} from "../hooks/useBackend";
import type { Post } from "../types";

const MOOD_FILTERS = [
  "All",
  "Gym",
  "Rest",
  "Eating",
  "Progress",
  "Mindset",
] as const;
type MoodFilter = (typeof MOOD_FILTERS)[number];

function timeAgo(ts: bigint): string {
  const now = Date.now();
  const then = Number(ts) / 1_000_000;
  const diff = Math.max(0, now - then);
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  return `${Math.floor(hrs / 24)}d`;
}

function MoodPill({ tag }: { tag?: string }) {
  if (!tag) return null;
  return (
    <span className="inline-flex items-center rounded-full bg-[#4CAF7D]/10 px-2 py-0.5 text-[10px] font-medium text-[#4CAF7D]">
      {tag}
    </span>
  );
}

function PostGridCard({ post }: { post: Post }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-[#F5F5F5] overflow-hidden">
      {post.mediaUrl ? (
        <div className="aspect-square">
          <img
            src={post.mediaUrl}
            alt=""
            className="w-full h-full object-cover"
          />
        </div>
      ) : (
        <div className="aspect-square bg-[#F5F5F5] flex items-center justify-center p-4">
          <p className="text-xs text-[#1A1A1A] line-clamp-4 text-center">
            {post.caption}
          </p>
        </div>
      )}
      <div className="p-2.5">
        <div className="flex items-center gap-2 mb-1.5">
          {post.authorAvatarUrl ? (
            <img
              src={post.authorAvatarUrl}
              alt=""
              className="w-5 h-5 rounded-full object-cover"
            />
          ) : (
            <div className="w-5 h-5 rounded-full bg-[#F5F5F5] flex items-center justify-center">
              <User className="w-3 h-3 text-[#6B7280]" />
            </div>
          )}
          <span className="text-[11px] text-[#1A1A1A] font-medium truncate">
            {post.authorDisplayName}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <MoodPill tag={post.moodTag} />
          <span className="text-[10px] text-[#6B7280]">
            {timeAgo(post.createdAt)}
          </span>
        </div>
      </div>
    </div>
  );
}

function FollowButton({ userId }: { userId: string }) {
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

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={follow.isPending || unfollow.isPending}
      className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 ${
        isFollowing
          ? "bg-[#4CAF7D] text-white"
          : "border border-[#4CAF7D] text-[#4CAF7D] hover:bg-[#4CAF7D]/5"
      }`}
      data-ocid="explore.follow.button"
    >
      {follow.isPending || unfollow.isPending ? (
        "..."
      ) : isFollowing ? (
        <span className="flex items-center gap-1">
          <Check className="w-3 h-3" /> Following
        </span>
      ) : (
        "Follow"
      )}
    </button>
  );
}

function UserCard({
  user,
}: {
  user: import("../backend.d").UserProfileView;
}) {
  const _navigate = useNavigate();

  return (
    <div className="bg-white rounded-xl shadow-sm border border-[#F5F5F5] p-4 flex items-center gap-3">
      {user.avatarUrl ? (
        <img
          src={user.avatarUrl}
          alt={user.displayName}
          className="w-12 h-12 rounded-full object-cover"
        />
      ) : (
        <div className="w-12 h-12 rounded-full bg-[#F5F5F5] flex items-center justify-center">
          <User className="w-5 h-5 text-[#6B7280]" />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-[#1A1A1A] truncate">
          {user.displayName}
        </p>
        <p className="text-xs text-[#6B7280] truncate">@{user.username}</p>
      </div>
      <FollowButton userId={user.id.toString()} />
    </div>
  );
}

export default function ExplorePage() {
  const [query, setQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<MoodFilter>("All");

  const { data: trendingPosts, isLoading: trendingLoading } =
    useTrendingPosts();
  const { data: allUsers, isLoading: usersLoading } = useSuggestedUsers();

  const filteredTrending = useMemo(() => {
    if (!trendingPosts) return [];
    if (activeFilter === "All") return trendingPosts;
    return trendingPosts.filter((p) => p.moodTag === activeFilter);
  }, [trendingPosts, activeFilter]);

  const _filteredSearch = useMemo(() => {
    if (!trendingPosts) return [];
    if (activeFilter === "All") return trendingPosts;
    return trendingPosts.filter((p) => p.moodTag === activeFilter);
  }, [trendingPosts, activeFilter]);

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-[#F5F5F5]">
        <div className="px-4 py-3">
          <h1 className="text-xl font-bold font-display text-[#1A1A1A] mb-3">
            Explore
          </h1>
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7280]" />
            <input
              type="text"
              placeholder="Search posts, people..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-[#F5F5F5] rounded-xl text-sm text-[#1A1A1A] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#4CAF7D]/30 transition-all"
              data-ocid="explore.search_input"
            />
          </div>
        </div>
      </header>

      {/* Filter Pills */}
      <div className="px-4 py-3 border-b border-[#F5F5F5]">
        <div className="flex gap-2 overflow-x-auto scrollbar-hide">
          {MOOD_FILTERS.map((filter) => (
            <button
              type="button"
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-4 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all duration-200 ${
                activeFilter === filter
                  ? "bg-[#4CAF7D] text-white"
                  : "border border-[#E5E7EB] text-[#6B7280] hover:border-[#4CAF7D]/30"
              }`}
              data-ocid="explore.filter.tab"
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      <main className="px-4 py-4 space-y-6 mb-20">
        {/* Trending Posts */}
        <section>
          <h2 className="text-sm font-semibold text-[#1A1A1A] mb-3">
            Trending Now
          </h2>
          {trendingLoading ? (
            <div className="grid grid-cols-2 gap-3">
              {["t0", "t1", "t2", "t3"].map((id) => (
                <div
                  key={id}
                  className="aspect-square bg-[#F5F5F5] rounded-xl animate-pulse"
                />
              ))}
            </div>
          ) : filteredTrending.length > 0 ? (
            <div className="grid grid-cols-2 gap-3">
              {filteredTrending.map((post) => (
                <PostGridCard key={post.id.toString()} post={post} />
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-sm text-[#6B7280]">
                No trending posts in this category yet
              </p>
            </div>
          )}
        </section>

        {/* Discover People */}
        <section>
          <h2 className="text-sm font-semibold text-[#1A1A1A] mb-3">
            Discover People
          </h2>
          {usersLoading ? (
            <div className="space-y-3">
              {["u0", "u1", "u2"].map((id) => (
                <div
                  key={id}
                  className="h-16 bg-[#F5F5F5] rounded-xl animate-pulse"
                />
              ))}
            </div>
          ) : allUsers && allUsers.length > 0 ? (
            <div className="space-y-3">
              {allUsers.slice(0, 6).map((user) => (
                <UserCard key={user.id.toString()} user={user} />
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-sm text-[#6B7280]">No users to discover yet</p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
