import { useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Settings } from "lucide-react";
import { Skeleton } from "../components/ui/skeleton";
import { useMyProfile, useUserPosts } from "../hooks/useBackend";
import type { Post } from "../types";

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function formatCount(n: bigint | number): string {
  const v = typeof n === "bigint" ? Number(n) : n;
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000) return `${(v / 1_000).toFixed(1)}K`;
  return String(v);
}

function PostThumbnail({ post, index }: { post: Post; index: number }) {
  return (
    <div
      className="aspect-square rounded-xl overflow-hidden bg-muted/40 cursor-pointer transition-smooth hover:opacity-90 active:scale-95"
      data-ocid={`profile.post.item.${index + 1}`}
    >
      {post.mediaUrl ? (
        <img
          src={post.mediaUrl}
          alt=""
          className="w-full h-full object-cover"
          loading="lazy"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center p-3">
          <p className="text-[10px] text-muted-foreground line-clamp-3 leading-snug">
            {post.caption}
          </p>
        </div>
      )}
    </div>
  );
}

export default function ProfilePage() {
  const navigate = useNavigate();
  const { data: profile, isLoading: profileLoading } = useMyProfile();
  const userId = profile?.id ? profile.id.toString() : "";
  const { data: posts = [], isLoading: postsLoading } = useUserPosts(userId);

  const displayName = profile?.displayName ?? "User";
  const username = profile?.username ?? "user";
  const bio = profile?.bio ?? "";
  const avatarUrl = profile?.avatarUrl;
  const followersCount = profile?.followersCount ?? 0n;
  const followingCount = profile?.followingCount ?? 0n;
  const postsCount = profile?.postsCount ?? 0n;

  if (profileLoading) {
    return (
      <div className="px-4 pt-4 pb-8 space-y-4 max-w-lg mx-auto">
        <Skeleton className="h-32 w-full rounded-2xl" />
        <div className="flex justify-center -mt-10">
          <Skeleton className="w-20 h-20 rounded-full" />
        </div>
        <Skeleton className="h-6 w-40 mx-auto" />
        <Skeleton className="h-4 w-24 mx-auto" />
        <div className="grid grid-cols-3 gap-4">
          <Skeleton className="h-14 rounded-xl" />
          <Skeleton className="h-14 rounded-xl" />
          <Skeleton className="h-14 rounded-xl" />
        </div>
        <div className="grid grid-cols-3 gap-2">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="aspect-square rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="pb-8 max-w-lg mx-auto">
      {/* Cover */}
      <div className="relative h-32 bg-gradient-to-b from-muted to-background">
        <button
          type="button"
          onClick={() => navigate({ to: "/" })}
          className="absolute top-3 left-3 w-9 h-9 rounded-full bg-card/80 backdrop-blur-sm flex items-center justify-center shadow-sm transition-smooth active:scale-95"
          data-ocid="profile.back_button"
          aria-label="Back"
        >
          <ArrowLeft size={16} className="text-foreground" />
        </button>
        <button
          type="button"
          onClick={() => navigate({ to: "/settings" })}
          className="absolute top-3 right-3 w-9 h-9 rounded-full bg-card/80 backdrop-blur-sm flex items-center justify-center shadow-sm transition-smooth active:scale-95"
          data-ocid="profile.settings_button"
          aria-label="Settings"
        >
          <Settings size={16} className="text-foreground" />
        </button>
      </div>

      {/* Avatar + Info */}
      <div className="px-5 -mt-10 relative">
        <div className="flex items-end justify-between">
          <div className="w-20 h-20 rounded-full bg-card border-4 border-background shadow-md flex items-center justify-center overflow-hidden">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt=""
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="font-display font-bold text-xl text-primary">
                {getInitials(displayName)}
              </span>
            )}
          </div>
        </div>

        <div className="mt-3">
          <h1 className="font-display font-bold text-xl text-foreground leading-tight">
            {displayName}
          </h1>
          <p className="text-sm text-muted-foreground">@{username}</p>
          {bio && (
            <p className="text-sm text-muted-foreground mt-2 italic leading-relaxed">
              {bio}
            </p>
          )}
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-2 mt-4">
          {[
            { label: "Posts", value: formatCount(postsCount) },
            { label: "Followers", value: formatCount(followersCount) },
            { label: "Following", value: formatCount(followingCount) },
          ].map((stat) => (
            <div
              key={stat.label}
              className="text-center py-2 rounded-xl bg-card shadow-sm"
            >
              <div className="font-display font-bold text-base text-foreground">
                {stat.value}
              </div>
              <div className="text-[10px] text-muted-foreground uppercase tracking-wide">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Post grid */}
      <div className="px-4 mt-6">
        <h2 className="font-display font-semibold text-sm text-foreground mb-3">
          Posts
        </h2>
        {postsLoading ? (
          <div className="grid grid-cols-3 gap-2">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="aspect-square rounded-xl" />
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div
            className="text-center py-12 bg-card rounded-2xl"
            data-ocid="profile.posts.empty_state"
          >
            <p className="text-3xl mb-2">📷</p>
            <p className="font-display font-semibold text-foreground mb-1">
              No posts yet
            </p>
            <p className="text-sm text-muted-foreground">
              Share your first post from the Add tab
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-2">
            {posts.map((post, i) => (
              <PostThumbnail key={String(post.id)} post={post} index={i} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
