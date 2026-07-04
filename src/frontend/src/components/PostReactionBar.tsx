import { Heart, MessageCircle, Share2 } from "lucide-react";
import { useCallback, useRef, useState } from "react";
import type { PostView } from "../backend.d";
import { usePostReactions } from "../hooks/useBackend";
import PostReactionPicker from "./PostReactionPicker";

interface BurstParticle {
  id: number;
  emoji: string;
  x: number;
  y: number;
  tx: number;
  ty: number;
}

interface PostReactionBarProps {
  post: PostView;
}

export default function PostReactionBar({ post }: PostReactionBarProps) {
  const { data: reactions = [] } = usePostReactions(post.id);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [bursts, setBursts] = useState<BurstParticle[]>([]);
  const burstIdRef = useRef(0);
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isLongPress = useRef(false);

  const myReaction = reactions.find((r) => r.reactedByMe)?.emoji ?? null;
  const totalCount = reactions.reduce((sum, r) => sum + Number(r.count), 0);
  const topReactions = reactions
    .filter((r) => Number(r.count) > 0)
    .slice(0, 3)
    .map((r) => r.emoji);

  const handleBurst = useCallback((emoji: string, x: number, y: number) => {
    const newParticles: BurstParticle[] = [];
    const count = 3 + Math.floor(Math.random() * 3); // 3-5 particles

    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + Math.random() * 0.5;
      const distance = 40 + Math.random() * 60;
      newParticles.push({
        id: burstIdRef.current++,
        emoji,
        x,
        y,
        tx: Math.cos(angle) * distance,
        ty: Math.sin(angle) * distance - 40,
      });
    }

    setBursts((prev) => [...prev, ...newParticles]);

    // Remove particles after animation
    setTimeout(() => {
      setBursts((prev) =>
        prev.filter((p) => !newParticles.find((np) => np.id === p.id)),
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

  const handleLikePressEnd = (_e: React.MouseEvent | React.TouchEvent) => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
    if (!isLongPress.current) {
      // Short tap - open picker directly
      setPickerOpen(true);
    }
  };

  const handleReactionBarClick = () => {
    setPickerOpen(true);
  };

  return (
    <>
      {/* Burst particles */}
      {bursts.map((p) => (
        <div
          key={p.id}
          className="emoji-burst"
          style={{
            left: p.x,
            top: p.y,
            ["--tx" as string]: `${p.tx}px`,
            ["--ty" as string]: `${p.ty}px`,
          }}
        >
          {p.emoji}
        </div>
      ))}

      {/* Reaction summary row */}
      {totalCount > 0 && (
        <button
          type="button"
          onClick={handleReactionBarClick}
          className="flex items-center gap-1.5 px-4 py-2 group"
          data-ocid="feed.reaction_bar.button"
        >
          <div className="flex -space-x-1">
            {topReactions.map((emoji, _i) => (
              <span
                key={emoji}
                className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-white dark:bg-[#1A1A1A] border border-[#F5F5F5] dark:border-[#333] text-xs"
              >
                {emoji}
              </span>
            ))}
          </div>
          <span className="text-xs text-[#6B7280] font-medium group-hover:text-[#4CAF7D] transition-colors">
            {totalCount}{" "}
            {totalCount === 1 ? "person reacted" : "people reacted"}
          </span>
        </button>
      )}

      {/* Actions row */}
      <div className="flex items-center gap-5 px-4 py-3 border-t border-[#F5F5F5] dark:border-[#333]">
        <button
          type="button"
          onMouseDown={handleLikePressStart}
          onMouseUp={handleLikePressEnd}
          onTouchStart={handleLikePressStart}
          onTouchEnd={handleLikePressEnd}
          className="flex items-center gap-1.5 group select-none"
          data-ocid="feed.like.button"
        >
          {myReaction ? (
            <span className="text-xl leading-none transition-transform group-active:scale-90">
              {myReaction}
            </span>
          ) : (
            <Heart className="w-5 h-5 text-[#6B7280] group-hover:text-[#4CAF7D] transition-colors" />
          )}
          <span
            className={`text-xs font-medium transition-all duration-200 ${
              myReaction ? "text-[#4CAF7D]" : "text-[#6B7280]"
            }`}
            style={{
              animation:
                totalCount > 0
                  ? "soft-pop 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)"
                  : "none",
            }}
          >
            {totalCount > 0 ? totalCount : "Like"}
          </span>
        </button>

        <button
          type="button"
          className="flex items-center gap-1.5 group"
          data-ocid="feed.comment.button"
        >
          <MessageCircle className="w-5 h-5 text-[#6B7280] group-hover:text-[#4CAF7D] transition-colors" />
          <span className="text-xs text-[#6B7280]">
            {Number(post.commentsCount) > 0
              ? Number(post.commentsCount)
              : "Comment"}
          </span>
        </button>

        <button
          type="button"
          className="flex items-center gap-1.5 group ml-auto"
          data-ocid="feed.share.button"
        >
          <Share2 className="w-5 h-5 text-[#6B7280] group-hover:text-[#4CAF7D] transition-colors" />
        </button>
      </div>

      {/* Reaction Picker */}
      {pickerOpen && (
        <PostReactionPicker
          postId={post.id}
          reactions={reactions}
          onClose={() => setPickerOpen(false)}
          onBurst={handleBurst}
        />
      )}
    </>
  );
}
