import Map "mo:core/Map";
import List "mo:core/List";
import Set "mo:core/Set";
import Time "mo:core/Time";
import Common "../types/common";
import SocialTypes "../types/social";
import ProfileTypes "../types/profile";
import NotifTypes "../types/notification";
import ReactionsTypes "../types/reactions";
import PostsLib "../lib/posts";

mixin (
  posts : List.List<SocialTypes.Post>,
  postLikes : Map.Map<Text, Set.Set<Principal>>,
  profiles : Map.Map<Principal, ProfileTypes.UserProfile>,
  follows : List.List<SocialTypes.Follow>,
  notifications : List.List<NotifTypes.Notification>,
  notifIdCounter : { var value : Nat },
  postIdCounter : { var value : Nat },
  postReactions : List.List<ReactionsTypes.PostReaction>,
) {
  /// Create a new post
  public shared ({ caller }) func createPost(
    input : SocialTypes.CreatePostInput
  ) : async SocialTypes.PostView {
    PostsLib.createPost(posts, postLikes, profiles, postReactions, postIdCounter, caller, input, Time.now());
  };

  /// Get a single post by ID
  public shared query ({ caller }) func getPost(
    id : Text
  ) : async ?SocialTypes.PostView {
    PostsLib.getPost(posts, postLikes, profiles, postReactions, id, caller);
  };

  /// Get the home feed (posts from followed users + own)
  public shared query ({ caller }) func getHomeFeed(
    cursor : ?Text
  ) : async Common.Page<SocialTypes.PostView> {
    PostsLib.getHomeFeed(posts, postLikes, profiles, postReactions, follows, caller, cursor);
  };

  /// Get posts by a specific user
  public shared query ({ caller }) func getUserPosts(
    userId : Principal,
    cursor : ?Text,
  ) : async Common.Page<SocialTypes.PostView> {
    PostsLib.getUserPosts(posts, postLikes, profiles, postReactions, userId, caller, cursor);
  };

  /// Get trending posts (sorted by likes)
  public shared query ({ caller }) func getTrendingPosts(
    cursor : ?Text
  ) : async Common.Page<SocialTypes.PostView> {
    PostsLib.getTrendingPosts(posts, postLikes, profiles, postReactions, caller, cursor);
  };

  /// Like a post
  public shared ({ caller }) func likePost(
    id : Text
  ) : async () {
    PostsLib.likePost(posts, postLikes, notifications, notifIdCounter, caller, id, Time.now());
  };

  /// Remove a like from a post
  public shared ({ caller }) func unlikePost(
    id : Text
  ) : async () {
    PostsLib.unlikePost(posts, postLikes, caller, id);
  };

  /// Delete own post
  public shared ({ caller }) func deletePost(
    id : Text
  ) : async () {
    PostsLib.deletePost(posts, postLikes, profiles, caller, id);
  };
};
