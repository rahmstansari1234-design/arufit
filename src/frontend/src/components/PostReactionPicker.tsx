import { useEffect, useRef } from "react";
import { useReactToPost, useRemovePostReaction } from "../hooks/useBackend";
import type { PostReactionSummary } from "../types";

const REACTION_EMOJIS = [
  { emoji: "❤️", label: "Like" },
  { emoji: "🧡", label: "Love" },
  { emoji: "😂", label: "Laugh" },
  { emoji: "😮", label: "Wow" },
  { emoji: "😢", label: "Sad" },
  { emoji: "😡", label: "Angry" },
];

interface PostReactionPickerProps {
  postId: string;
  reactions: PostReactionSummary[];
  onClose: () => void;
  onBurst: (emoji: string, x: number, y: number) => void;
}

export default function PostReactionPicker({
  postId,
  reactions,
  onClose,
  onBurst,
}: PostReactionPickerProps) {
  const reactMutation = useReactToPost();
  const removeMutation = useRemovePostReaction();
  const pickerRef = useRef<HTMLDivElement>(null);

  const myReaction = reactions.find((r) => r.reactedByMe)?.emoji ?? null;

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        onClose();
      }
    }
    function handleTouchOutside(e: TouchEvent) {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        onClose();
      }
    }
    function handleEsc(e: KeyboardEvent) {
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

  const handleEmojiClick = (
    emoji: string,
    e: React.MouseEvent | React.TouchEvent,
  ) => {
    e.stopPropagation();

    let clientX: number;
    let clientY: number;
    if ("touches" in e) {
      clientX = e.touches[0]?.clientX ?? 0;
      clientY = e.touches[0]?.clientY ?? 0;
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

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center pb-24 sm:items-center sm:pb-0">
      {/* Invisible backdrop */}
      <div
        className="absolute inset-0 bg-transparent"
        onClick={onClose}
        onKeyUp={onClose}
        role="button"
        tabIndex={0}
        data-ocid="reaction_picker.backdrop"
      />

      {/* Picker container with spring animation */}
      <div
        ref={pickerRef}
        className="reaction-picker relative z-10 animate-soft-pop"
        style={{
          animation: "soft-pop 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) both",
        }}
        data-ocid="reaction_picker.panel"
      >
        {REACTION_EMOJIS.map(({ emoji, label }) => {
          const isActive = myReaction === emoji;
          return (
            <button
              key={emoji}
              type="button"
              onClick={(e) => handleEmojiClick(emoji, e)}
              onTouchStart={(e) => handleEmojiClick(emoji, e)}
              className={`reaction-emoji ${isActive ? "active" : ""}`}
              style={{
                outline: isActive
                  ? "2px solid oklch(var(--accent-primary))"
                  : "none",
                outlineOffset: "2px",
                borderRadius: "50%",
                padding: "0.25rem",
              }}
              aria-label={label}
              data-ocid={`reaction_picker.emoji.${label.toLowerCase()}`}
            >
              <span className="text-2xl leading-none select-none">{emoji}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
