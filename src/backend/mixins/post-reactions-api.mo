import ReactionsTypes "../types/reactions";
import List "mo:core/List";
import Reactions "../lib/reactions";

mixin (
  postReactions : List.List<ReactionsTypes.PostReaction>,
) {
  public shared ({ caller }) func reactToPost(postId : Text, emoji : Text) : async () {
    Reactions.reactToPost(caller, postId, emoji, postReactions);
  };

  public shared ({ caller }) func removePostReaction(postId : Text) : async () {
    Reactions.removePostReaction(caller, postId, postReactions);
  };

  public shared query ({ caller }) func getPostReactions(postId : Text) : async [ReactionsTypes.PostReactionSummary] {
    Reactions.getPostReactions(caller, postId, postReactions);
  };
};
