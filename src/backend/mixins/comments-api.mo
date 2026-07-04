import Map "mo:core/Map";
import List "mo:core/List";
import Set "mo:core/Set";
import Time "mo:core/Time";
import Common "../types/common";
import SocialTypes "../types/social";
import ProfileTypes "../types/profile";
import NotifTypes "../types/notification";
import CommentsLib "../lib/comments";

mixin (
  comments : List.List<SocialTypes.Comment>,
  commentLikes : Map.Map<Text, Set.Set<Principal>>,
  posts : List.List<SocialTypes.Post>,
  profiles : Map.Map<Principal, ProfileTypes.UserProfile>,
  notifications : List.List<NotifTypes.Notification>,
  notifIdCounter : { var value : Nat },
  commentIdCounter : { var value : Nat },
) {
  /// Add a comment to a post (optionally as a reply)
  public shared ({ caller }) func addComment(
    postId : Text,
    content : Text,
    parentId : ?Text,
  ) : async SocialTypes.CommentView {
    CommentsLib.addComment(comments, commentLikes, posts, notifications, notifIdCounter, commentIdCounter, caller, postId, content, parentId, Time.now());
  };

  /// Get all comments for a post
  public shared query ({ caller }) func getComments(
    postId : Text
  ) : async [SocialTypes.CommentView] {
    CommentsLib.getComments(comments, commentLikes, profiles, postId, caller);
  };

  /// Like a comment
  public shared ({ caller }) func likeComment(
    id : Text
  ) : async () {
    CommentsLib.likeComment(comments, commentLikes, caller, id);
  };

  /// Delete own comment
  public shared ({ caller }) func deleteComment(
    id : Text
  ) : async () {
    CommentsLib.deleteComment(comments, commentLikes, posts, caller, id);
  };
};
