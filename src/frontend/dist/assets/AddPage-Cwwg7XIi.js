import { c as createLucideIcon, u as useNavigate, r as reactExports, j as jsxRuntimeExports } from "./index-BBmdRvnk.js";
import { u as ue } from "./index-DaxY6rW6.js";
import { j as useCreatePost, k as useCreateStory } from "./useBackend-CcBHNUn3.js";
import { X } from "./x-1QW4ZYNO.js";
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode$1 = [
  ["path", { d: "M16 5h6", key: "1vod17" }],
  ["path", { d: "M19 2v6", key: "4bpg5p" }],
  ["path", { d: "M21 11.5V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7.5", key: "1ue2ih" }],
  ["path", { d: "m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21", key: "1xmnt7" }],
  ["circle", { cx: "9", cy: "9", r: "2", key: "af1f0g" }]
];
const ImagePlus = createLucideIcon("image-plus", __iconNode$1);
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode = [["path", { d: "M21 12a9 9 0 1 1-6.219-8.56", key: "13zald" }]];
const LoaderCircle = createLucideIcon("loader-circle", __iconNode);
const MOOD_TAGS = ["Gym", "Rest", "Eating", "Progress", "Mindset"];
function AddPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = reactExports.useState("Post");
  const [postText, setPostText] = reactExports.useState("");
  const [postMood, setPostMood] = reactExports.useState(null);
  const [postImage, setPostImage] = reactExports.useState(null);
  const [storyImage, setStoryImage] = reactExports.useState(null);
  const [storyCaption, setStoryCaption] = reactExports.useState("");
  const [storyMood, setStoryMood] = reactExports.useState(null);
  const postFileRef = reactExports.useRef(null);
  const storyFileRef = reactExports.useRef(null);
  const createPost = useCreatePost();
  const createStory = useCreateStory();
  const handleImagePick = reactExports.useCallback(
    (file, setter) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        var _a;
        if ((_a = e.target) == null ? void 0 : _a.result) {
          setter(e.target.result);
        }
      };
      reader.readAsDataURL(file);
    },
    []
  );
  const handleSharePost = async () => {
    if (!postText.trim()) return;
    try {
      await createPost.mutateAsync({
        caption: postText.trim(),
        mediaUrl: postImage ?? void 0,
        moodTag: postMood ?? void 0
      });
      ue.success("Post shared!");
      navigate({ to: "/" });
    } catch {
      ue.error("Failed to share post");
    }
  };
  const handleShareStory = async () => {
    if (!storyImage) return;
    try {
      await createStory.mutateAsync({
        mediaUrl: storyImage ?? void 0,
        moodTag: storyMood ?? void 0,
        caption: storyCaption || void 0
      });
      ue.success("Story shared!");
      navigate({ to: "/" });
    } catch {
      ue.error("Failed to share story");
    }
  };
  const isPostValid = postText.trim().length > 0;
  const isStoryValid = !!storyImage;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen bg-white", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("header", { className: "sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-[#F5F5F5]", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-4 py-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-xl font-bold font-display text-[#1A1A1A] mb-3", children: "Create" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex border-b border-[#F5F5F5]", children: ["Post", "Story"].map((tab) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "button",
        {
          type: "button",
          onClick: () => setActiveTab(tab),
          className: `flex-1 pb-2.5 text-sm font-semibold transition-colors relative ${activeTab === tab ? "text-[#4CAF7D]" : "text-[#6B7280] hover:text-[#1A1A1A]"}`,
          "data-ocid": `add.${tab.toLowerCase()}_tab`,
          children: [
            tab,
            activeTab === tab && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "absolute bottom-0 left-0 right-0 h-0.5 bg-[#4CAF7D] rounded-full" })
          ]
        },
        tab
      )) })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("main", { className: "px-4 py-4 mb-20", children: activeTab === "Post" ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "textarea",
        {
          value: postText,
          onChange: (e) => setPostText(e.target.value),
          placeholder: "What's on your mind?",
          rows: 4,
          className: "w-full p-4 bg-[#F5F5F5] rounded-xl text-sm text-[#1A1A1A] placeholder:text-[#9CA3AF] resize-none focus:outline-none focus:ring-2 focus:ring-[#4CAF7D]/30 transition-all",
          "data-ocid": "add.post.textarea"
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-medium text-[#6B7280] mb-2 uppercase tracking-wide", children: "Mood" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-2", children: MOOD_TAGS.map((tag) => /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            type: "button",
            onClick: () => setPostMood(postMood === tag ? null : tag),
            className: `px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 ${postMood === tag ? "bg-[#4CAF7D] text-white" : "bg-[#F5F5F5] text-[#6B7280] hover:bg-[#4CAF7D]/10"}`,
            "data-ocid": "add.mood.chip",
            children: tag
          },
          tag
        )) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "input",
          {
            ref: postFileRef,
            type: "file",
            accept: "image/*",
            className: "hidden",
            onChange: (e) => {
              var _a;
              const file = (_a = e.target.files) == null ? void 0 : _a[0];
              if (file) handleImagePick(file, setPostImage);
            }
          }
        ),
        postImage ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative rounded-xl overflow-hidden", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "img",
            {
              src: postImage,
              alt: "Selected",
              className: "w-full max-h-64 object-cover"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              type: "button",
              onClick: () => setPostImage(null),
              className: "absolute top-2 right-2 w-8 h-8 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 transition-colors",
              "data-ocid": "add.post.remove_image",
              children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "w-4 h-4" })
            }
          )
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "button",
          {
            type: "button",
            onClick: () => {
              var _a;
              return (_a = postFileRef.current) == null ? void 0 : _a.click();
            },
            className: "w-full py-8 border-2 border-dashed border-[#E5E7EB] rounded-xl flex flex-col items-center gap-2 text-[#6B7280] hover:border-[#4CAF7D]/30 hover:bg-[#4CAF7D]/5 transition-all",
            "data-ocid": "add.post.image_picker",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(ImagePlus, { className: "w-6 h-6" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-medium", children: "Add Photo" })
            ]
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          type: "button",
          onClick: handleSharePost,
          disabled: !isPostValid || createPost.isPending,
          className: `w-full py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${isPostValid && !createPost.isPending ? "bg-[#4CAF7D] text-white hover:bg-[#43A047] active:scale-[0.98]" : "bg-[#F5F5F5] text-[#9CA3AF] cursor-not-allowed"}`,
          "data-ocid": "add.post.submit_button",
          children: createPost.isPending ? /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center justify-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "w-4 h-4 animate-spin" }),
            "Sharing..."
          ] }) : "Share Post"
        }
      )
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "input",
        {
          ref: storyFileRef,
          type: "file",
          accept: "image/*",
          className: "hidden",
          onChange: (e) => {
            var _a;
            const file = (_a = e.target.files) == null ? void 0 : _a[0];
            if (file) handleImagePick(file, setStoryImage);
          }
        }
      ),
      storyImage ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative rounded-xl overflow-hidden aspect-[3/4] max-h-[400px]", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "img",
          {
            src: storyImage,
            alt: "Story",
            className: "w-full h-full object-cover"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            type: "button",
            onClick: () => setStoryImage(null),
            className: "absolute top-2 right-2 w-8 h-8 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 transition-colors",
            "data-ocid": "add.story.remove_image",
            children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "w-4 h-4" })
          }
        )
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "button",
        {
          type: "button",
          onClick: () => {
            var _a;
            return (_a = storyFileRef.current) == null ? void 0 : _a.click();
          },
          className: "w-full aspect-[3/4] max-h-[400px] border-2 border-dashed border-[#E5E7EB] rounded-xl flex flex-col items-center justify-center gap-3 text-[#6B7280] hover:border-[#4CAF7D]/30 hover:bg-[#4CAF7D]/5 transition-all",
          "data-ocid": "add.story.image_picker",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(ImagePlus, { className: "w-10 h-10" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-medium", children: "Tap to select photo" })
          ]
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "input",
        {
          type: "text",
          value: storyCaption,
          onChange: (e) => setStoryCaption(e.target.value),
          placeholder: "Add a caption...",
          className: "w-full p-4 bg-[#F5F5F5] rounded-xl text-sm text-[#1A1A1A] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#4CAF7D]/30 transition-all",
          "data-ocid": "add.story.caption_input"
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-medium text-[#6B7280] mb-2 uppercase tracking-wide", children: "Mood" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-2", children: MOOD_TAGS.map((tag) => /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            type: "button",
            onClick: () => setStoryMood(storyMood === tag ? null : tag),
            className: `px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 ${storyMood === tag ? "bg-[#4CAF7D] text-white" : "bg-[#F5F5F5] text-[#6B7280] hover:bg-[#4CAF7D]/10"}`,
            "data-ocid": "add.story.mood.chip",
            children: tag
          },
          tag
        )) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          type: "button",
          onClick: handleShareStory,
          disabled: !isStoryValid || createStory.isPending,
          className: `w-full py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${isStoryValid && !createStory.isPending ? "bg-[#4CAF7D] text-white hover:bg-[#43A047] active:scale-[0.98]" : "bg-[#F5F5F5] text-[#9CA3AF] cursor-not-allowed"}`,
          "data-ocid": "add.story.submit_button",
          children: createStory.isPending ? /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center justify-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "w-4 h-4 animate-spin" }),
            "Sharing..."
          ] }) : "Share Story"
        }
      )
    ] }) })
  ] });
}
export {
  AddPage as default
};
