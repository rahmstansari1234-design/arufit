import { useNavigate } from "@tanstack/react-router";
import { ImagePlus, Loader2, X } from "lucide-react";
import { useCallback, useRef, useState } from "react";
import { toast } from "sonner";
import { useCreatePost, useCreateStory } from "../hooks/useBackend";

type Tab = "Post" | "Story";

const MOOD_TAGS = ["Gym", "Rest", "Eating", "Progress", "Mindset"] as const;

export default function AddPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>("Post");

  // Post state
  const [postText, setPostText] = useState("");
  const [postMood, setPostMood] = useState<string | null>(null);
  const [postImage, setPostImage] = useState<string | null>(null);

  // Story state
  const [storyImage, setStoryImage] = useState<string | null>(null);
  const [storyCaption, setStoryCaption] = useState("");
  const [storyMood, setStoryMood] = useState<string | null>(null);

  const postFileRef = useRef<HTMLInputElement>(null);
  const storyFileRef = useRef<HTMLInputElement>(null);

  const createPost = useCreatePost();
  const createStory = useCreateStory();

  const handleImagePick = useCallback(
    (file: File, setter: (url: string) => void) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          setter(e.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    },
    [],
  );

  const handleSharePost = async () => {
    if (!postText.trim()) return;
    try {
      await createPost.mutateAsync({
        caption: postText.trim(),
        mediaUrl: postImage ?? undefined,
        moodTag: postMood ?? undefined,
      });
      toast.success("Post shared!");
      navigate({ to: "/" });
    } catch {
      toast.error("Failed to share post");
    }
  };

  const handleShareStory = async () => {
    if (!storyImage) return;
    try {
      await createStory.mutateAsync({
        mediaUrl: storyImage ?? undefined,
        moodTag: storyMood ?? undefined,
        caption: storyCaption || undefined,
      });
      toast.success("Story shared!");
      navigate({ to: "/" });
    } catch {
      toast.error("Failed to share story");
    }
  };

  const isPostValid = postText.trim().length > 0;
  const isStoryValid = !!storyImage;

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-[#F5F5F5]">
        <div className="px-4 py-3">
          <h1 className="text-xl font-bold font-display text-[#1A1A1A] mb-3">
            Create
          </h1>
          {/* Tab Switcher */}
          <div className="flex border-b border-[#F5F5F5]">
            {(["Post", "Story"] as Tab[]).map((tab) => (
              <button
                type="button"
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 pb-2.5 text-sm font-semibold transition-colors relative ${
                  activeTab === tab
                    ? "text-[#4CAF7D]"
                    : "text-[#6B7280] hover:text-[#1A1A1A]"
                }`}
                data-ocid={`add.${tab.toLowerCase()}_tab`}
              >
                {tab}
                {activeTab === tab && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#4CAF7D] rounded-full" />
                )}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="px-4 py-4 mb-20">
        {activeTab === "Post" ? (
          <div className="space-y-4">
            {/* Text Area */}
            <textarea
              value={postText}
              onChange={(e) => setPostText(e.target.value)}
              placeholder="What's on your mind?"
              rows={4}
              className="w-full p-4 bg-[#F5F5F5] rounded-xl text-sm text-[#1A1A1A] placeholder:text-[#9CA3AF] resize-none focus:outline-none focus:ring-2 focus:ring-[#4CAF7D]/30 transition-all"
              data-ocid="add.post.textarea"
            />

            {/* Mood Tags */}
            <div>
              <p className="text-xs font-medium text-[#6B7280] mb-2 uppercase tracking-wide">
                Mood
              </p>
              <div className="flex flex-wrap gap-2">
                {MOOD_TAGS.map((tag) => (
                  <button
                    type="button"
                    key={tag}
                    onClick={() => setPostMood(postMood === tag ? null : tag)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 ${
                      postMood === tag
                        ? "bg-[#4CAF7D] text-white"
                        : "bg-[#F5F5F5] text-[#6B7280] hover:bg-[#4CAF7D]/10"
                    }`}
                    data-ocid="add.mood.chip"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            {/* Image Picker */}
            <div>
              <input
                ref={postFileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleImagePick(file, setPostImage);
                }}
              />
              {postImage ? (
                <div className="relative rounded-xl overflow-hidden">
                  <img
                    src={postImage}
                    alt="Selected"
                    className="w-full max-h-64 object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => setPostImage(null)}
                    className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 transition-colors"
                    data-ocid="add.post.remove_image"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => postFileRef.current?.click()}
                  className="w-full py-8 border-2 border-dashed border-[#E5E7EB] rounded-xl flex flex-col items-center gap-2 text-[#6B7280] hover:border-[#4CAF7D]/30 hover:bg-[#4CAF7D]/5 transition-all"
                  data-ocid="add.post.image_picker"
                >
                  <ImagePlus className="w-6 h-6" />
                  <span className="text-xs font-medium">Add Photo</span>
                </button>
              )}
            </div>

            {/* Share Button */}
            <button
              type="button"
              onClick={handleSharePost}
              disabled={!isPostValid || createPost.isPending}
              className={`w-full py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                isPostValid && !createPost.isPending
                  ? "bg-[#4CAF7D] text-white hover:bg-[#43A047] active:scale-[0.98]"
                  : "bg-[#F5F5F5] text-[#9CA3AF] cursor-not-allowed"
              }`}
              data-ocid="add.post.submit_button"
            >
              {createPost.isPending ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Sharing...
                </span>
              ) : (
                "Share Post"
              )}
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Story Image Picker */}
            <input
              ref={storyFileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleImagePick(file, setStoryImage);
              }}
            />
            {storyImage ? (
              <div className="relative rounded-xl overflow-hidden aspect-[3/4] max-h-[400px]">
                <img
                  src={storyImage}
                  alt="Story"
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => setStoryImage(null)}
                  className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 transition-colors"
                  data-ocid="add.story.remove_image"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => storyFileRef.current?.click()}
                className="w-full aspect-[3/4] max-h-[400px] border-2 border-dashed border-[#E5E7EB] rounded-xl flex flex-col items-center justify-center gap-3 text-[#6B7280] hover:border-[#4CAF7D]/30 hover:bg-[#4CAF7D]/5 transition-all"
                data-ocid="add.story.image_picker"
              >
                <ImagePlus className="w-10 h-10" />
                <span className="text-sm font-medium">Tap to select photo</span>
              </button>
            )}

            {/* Caption */}
            <input
              type="text"
              value={storyCaption}
              onChange={(e) => setStoryCaption(e.target.value)}
              placeholder="Add a caption..."
              className="w-full p-4 bg-[#F5F5F5] rounded-xl text-sm text-[#1A1A1A] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#4CAF7D]/30 transition-all"
              data-ocid="add.story.caption_input"
            />

            {/* Mood Tags */}
            <div>
              <p className="text-xs font-medium text-[#6B7280] mb-2 uppercase tracking-wide">
                Mood
              </p>
              <div className="flex flex-wrap gap-2">
                {MOOD_TAGS.map((tag) => (
                  <button
                    type="button"
                    key={tag}
                    onClick={() => setStoryMood(storyMood === tag ? null : tag)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 ${
                      storyMood === tag
                        ? "bg-[#4CAF7D] text-white"
                        : "bg-[#F5F5F5] text-[#6B7280] hover:bg-[#4CAF7D]/10"
                    }`}
                    data-ocid="add.story.mood.chip"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            {/* Share Button */}
            <button
              type="button"
              onClick={handleShareStory}
              disabled={!isStoryValid || createStory.isPending}
              className={`w-full py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                isStoryValid && !createStory.isPending
                  ? "bg-[#4CAF7D] text-white hover:bg-[#43A047] active:scale-[0.98]"
                  : "bg-[#F5F5F5] text-[#9CA3AF] cursor-not-allowed"
              }`}
              data-ocid="add.story.submit_button"
            >
              {createStory.isPending ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Sharing...
                </span>
              ) : (
                "Share Story"
              )}
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
