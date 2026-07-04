import Common "common";

module {
  // ── Post Reactions ────────────────────────────────────────────────────────

  public type PostReaction = {
    postId : Text;
    userId : Principal;
    emoji : Text;
    createdAt : Common.Timestamp;
  };

  public type PostReactionSummary = {
    emoji : Text;
    count : Nat;
    reactedByMe : Bool;
  };
};
