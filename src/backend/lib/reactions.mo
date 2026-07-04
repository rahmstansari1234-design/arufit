import ReactionsTypes "../types/reactions";
import List "mo:core/List";
import Time "mo:core/Time";
import Map "mo:core/Map";

module {
  public func reactToPost(
    caller : Principal,
    postId : Text,
    emoji : Text,
    postReactions : List.List<ReactionsTypes.PostReaction>,
  ) : () {
    // Upsert: remove existing reaction by caller for this post, then add new one
    postReactions.retain(func(r) { not (r.postId == postId and r.userId == caller) });
    postReactions.add({
      postId;
      userId = caller;
      emoji;
      createdAt = Time.now();
    });
  };

  public func removePostReaction(
    caller : Principal,
    postId : Text,
    postReactions : List.List<ReactionsTypes.PostReaction>,
  ) : () {
    postReactions.retain(func(r) { not (r.postId == postId and r.userId == caller) });
  };

  public func getPostReactions(
    caller : Principal,
    postId : Text,
    postReactions : List.List<ReactionsTypes.PostReaction>,
  ) : [ReactionsTypes.PostReactionSummary] {
    // Aggregate by emoji: count unique users and detect caller's reaction
    let emojiCounts = Map.empty<Text, Nat>();
    let emojiByMe = Map.empty<Text, Bool>();
    for (r in postReactions.values()) {
      if (r.postId == postId) {
        let current = switch (emojiCounts.get(r.emoji)) { case null 0; case (?n) n };
        emojiCounts.add(r.emoji, current + 1);
        if (r.userId == caller) emojiByMe.add(r.emoji, true);
      };
    };
    // Build summaries sorted by count desc
    let summaries = List.empty<ReactionsTypes.PostReactionSummary>();
    for ((emoji, count) in emojiCounts.entries()) {
      let reactedByMe = switch (emojiByMe.get(emoji)) { case null false; case (?b) b };
      summaries.add({ emoji; count; reactedByMe });
    };
    let arr = summaries.toArray();
    arr.sort(func(a, b) {
      if (b.count > a.count) #greater
      else if (b.count < a.count) #less
      else #equal
    });
  };
};
