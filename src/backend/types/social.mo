import Common "common";
import ReactionsTypes "reactions";

module {
  // ── Follow ───────────────────────────────────────────────────────────────

  public type Follow = {
    followerId : Principal;
    followeeId : Principal;
    createdAt : Common.Timestamp;
  };

  // ── Post ─────────────────────────────────────────────────────────────────

  public type PostVisibility = { #everyone; #followers };

  public type Post = {
    id : Text;
    authorId : Principal;
    mediaUrl : ?Text;
    caption : Text;
    moodTag : ?Text;
    visibility : PostVisibility;
    likesCount : Nat;
    commentsCount : Nat;
    createdAt : Common.Timestamp;
  };

  public type PostView = {
    id : Text;
    authorId : Principal;
    authorUsername : Text;
    authorDisplayName : Text;
    authorAvatarUrl : ?Text;
    mediaUrl : ?Text;
    caption : Text;
    moodTag : ?Text;
    visibility : PostVisibility;
    likesCount : Nat;
    commentsCount : Nat;
    likedByMe : Bool;
    createdAt : Common.Timestamp;
    reactions : [ReactionsTypes.PostReactionSummary];
  };

  public type CreatePostInput = {
    mediaUrl : ?Text;
    caption : Text;
    moodTag : ?Text;
    visibility : PostVisibility;
  };

  // ── Comment ───────────────────────────────────────────────────────────────

  public type Comment = {
    id : Text;
    postId : Text;
    authorId : Principal;
    content : Text;
    parentId : ?Text;
    likesCount : Nat;
    createdAt : Common.Timestamp;
  };

  public type CommentView = {
    id : Text;
    postId : Text;
    authorId : Principal;
    authorUsername : Text;
    authorDisplayName : Text;
    authorAvatarUrl : ?Text;
    content : Text;
    parentId : ?Text;
    likesCount : Nat;
    likedByMe : Bool;
    createdAt : Common.Timestamp;
  };

  // ── Story ─────────────────────────────────────────────────────────────────

  public type Story = {
    id : Text;
    authorId : Principal;
    mediaUrl : ?Text;
    caption : ?Text;
    moodTag : ?Text;
    expiresAt : Common.Timestamp;
    viewedBy : [Principal];
    createdAt : Common.Timestamp;
  };

  public type StoryView = {
    id : Text;
    authorId : Principal;
    authorUsername : Text;
    authorDisplayName : Text;
    authorAvatarUrl : ?Text;
    mediaUrl : ?Text;
    caption : ?Text;
    moodTag : ?Text;
    expiresAt : Common.Timestamp;
    viewsCount : Nat;
    viewedByMe : Bool;
    createdAt : Common.Timestamp;
  };

  public type CreateStoryInput = {
    mediaUrl : ?Text;
    caption : ?Text;
    moodTag : ?Text;
  };

  // ── Like tracking key (internal) ──────────────────────────────────────────

  public type LikeKey = {
    targetId : Text;
    userId : Principal;
  };
};
