import { useNavigate } from "@tanstack/react-router";
// Auth handled by router guard
import { Bell, MessageCircle, Plus, Share2, User } from "lucide-react";
import type { PostView, StoryView } from "../backend.d";
import PostReactionBar from "../components/PostReactionBar";
import { useActiveStories, useHomeFeed } from "../hooks/useBackend";

function timeAgo(ts: bigint): string {
  const now = Date.now();
  const then = Number(ts) / 1_000_000;
  const diff = Math.max(0, now - then);
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

function MoodPill({ tag }: { tag?: string }) {
  if (!tag) return null;
  return (
    <span className="inline-flex items-center rounded-full bg-[#4CAF7D]/10 px-2.5 py-0.5 text-xs font-medium text-[#4CAF7D]">
      {tag}
    </span>
  );
}

function StoryAvatar({
  story,
  onClick,
}: {
  story: StoryView;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex flex-col items-center gap-1.5 min-w-[72px]"
      data-ocid="story.item.button"
    >
      <div className="relative">
        <div className="w-14 h-14 rounded-full p-[2px] bg-gradient-to-tr from-[#4CAF7D] to-[#81C784]">
          <div className="w-full h-full rounded-full bg-white p-[2px]">
            {story.authorAvatarUrl ? (
              <img
                src={story.authorAvatarUrl}
                alt={story.authorDisplayName}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <div className="w-full h-full rounded-full bg-[#F5F5F5] flex items-center justify-center">
                <User className="w-5 h-5 text-[#6B7280]" />
              </div>
            )}
          </div>
        </div>
      </div>
      <span className="text-[11px] text-[#1A1A1A] truncate max-w-[64px]">
        {story.authorDisplayName}
      </span>
    </button>
  );
}

function FeedCard({ post }: { post: PostView }) {
  return (
    <article
      className="bg-white dark:bg-[#1A1A1A] rounded-2xl shadow-sm border border-[#F5F5F5] dark:border-[#333] overflow-hidden animate-fade-up"
      data-ocid="feed.item.card"
    >
      {/* Header */}
      <div className="flex items-center gap-3 p-4">
        {post.authorAvatarUrl ? (
          <img
            src={post.authorAvatarUrl}
            alt={post.authorDisplayName}
            className="w-10 h-10 rounded-full object-cover"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-[#F5F5F5] dark:bg-[#333] flex items-center justify-center">
            <User className="w-5 h-5 text-[#6B7280]" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-[#1A1A1A] dark:text-white truncate">
            {post.authorDisplayName}
          </p>
          <p className="text-xs text-[#6B7280]">
            @{post.authorUsername} · {timeAgo(post.createdAt)}
          </p>
        </div>
        <MoodPill tag={post.moodTag} />
      </div>

      {/* Content */}
      <div className="px-4 pb-3">
        <p className="text-sm text-[#1A1A1A] dark:text-white leading-relaxed whitespace-pre-wrap">
          {post.caption}
        </p>
      </div>

      {/* Image */}
      {post.mediaUrl && (
        <div className="px-4 pb-3">
          <img
            src={post.mediaUrl}
            alt="Post"
            className="w-full rounded-xl object-cover max-h-[400px]"
          />
        </div>
      )}

      {/* Reaction Bar */}
      <PostReactionBar post={post} />
    </article>
  );
}

function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-[#F5F5F5] overflow-hidden p-4 space-y-3">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-[#F5F5F5] animate-pulse" />
        <div className="space-y-2 flex-1">
          <div className="h-3 w-32 bg-[#F5F5F5] rounded animate-pulse" />
          <div className="h-2.5 w-20 bg-[#F5F5F5] rounded animate-pulse" />
        </div>
      </div>
      <div className="h-3 w-full bg-[#F5F5F5] rounded animate-pulse" />
      <div className="h-3 w-3/4 bg-[#F5F5F5] rounded animate-pulse" />
      <div className="h-48 w-full bg-[#F5F5F5] rounded-xl animate-pulse" />
      <div className="flex gap-4 pt-2">
        <div className="h-5 w-12 bg-[#F5F5F5] rounded animate-pulse" />
        <div className="h-5 w-16 bg-[#F5F5F5] rounded animate-pulse" />
      </div>
    </div>
  );
}

function SkeletonStory() {
  return (
    <div className="flex flex-col items-center gap-1.5 min-w-[72px]">
      <div className="w-14 h-14 rounded-full bg-[#F5F5F5] animate-pulse" />
      <div className="h-2.5 w-10 bg-[#F5F5F5] rounded animate-pulse" />
    </div>
  );
}

export default function FeedPage() {
  const navigate = useNavigate();
  // User identity available via router context if needed
  const { data: posts, isLoading: postsLoading } = useHomeFeed();
  const { data: stories, isLoading: storiesLoading } = useActiveStories();

  return (
    <div className="min-h-screen bg-white">
      {/* Top Bar */}
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-[#F5F5F5]">
        <div className="flex items-center justify-between px-4 py-3">
          <h1 className="text-xl font-bold font-display text-[#1A1A1A]">
            Arufit
          </h1>
          <button
            type="button"
            className="relative p-2 rounded-full hover:bg-[#F5F5F5] transition-colors"
            data-ocid="feed.notifications.button"
          >
            <Bell className="w-5 h-5 text-[#1A1A1A]" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#4CAF7D] rounded-full" />
          </button>
        </div>
      </header>

      {/* Stories Row */}
      <div className="border-b border-[#F5F5F5] py-4">
        <div className="flex gap-4 px-4 overflow-x-auto scrollbar-hide">
          {/* Your Story */}
          <button
            type="button"
            onClick={() => navigate({ to: "/add" })}
            className="flex flex-col items-center gap-1.5 min-w-[72px]"
            data-ocid="feed.your_story.button"
          >
            <div className="relative">
              <div className="w-14 h-14 rounded-full bg-[#F5F5F5] flex items-center justify-center border-2 border-dashed border-[#4CAF7D]">
                <Plus className="w-5 h-5 text-[#4CAF7D]" />
              </div>
            </div>
            <span className="text-[11px] text-[#6B7280]">Your Story</span>
          </button>

          {storiesLoading
            ? Array.from({ length: 5 }, (_, i) => `story-${i}`).map((id) => (
                <SkeletonStory key={id} />
              ))
            : stories?.map((story) => (
                <StoryAvatar
                  key={story.id.toString()}
                  story={story}
                  onClick={() => {}}
                />
              ))}
        </div>
      </div>

      {/* Feed */}
      <main className="px-4 py-4 space-y-4 mb-20">
        {postsLoading ? (
          <>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </>
        ) : posts && posts.length > 0 ? (
          posts.map((post) => <FeedCard key={post.id.toString()} post={post} />)
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-full bg-[#F5F5F5] flex items-center justify-center mb-4">
              <User className="w-8 h-8 text-[#6B7280]" />
            </div>
            <h3 className="text-lg font-semibold text-[#1A1A1A] mb-1">
              Follow people to see their posts here
            </h3>
            <p className="text-sm text-[#6B7280] max-w-xs">
              Discover fitness enthusiasts on the Explore tab and start building
              your community
            </p>
          </div>
        )}
      </main>

      {/* Floating Add Button */}
      <button
        type="button"
        onClick={() => navigate({ to: "/add" })}
        className="fixed bottom-24 right-4 w-14 h-14 rounded-full bg-[#4CAF7D] text-white shadow-lg flex items-center justify-center hover:bg-[#43A047] active:scale-95 transition-all z-40"
        data-ocid="feed.add_button"
      >
        <Plus className="w-6 h-6" />
      </button>
    </div>
  );
}
