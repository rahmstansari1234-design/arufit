import Debug "mo:core/Debug";
import List "mo:core/List";
import Map "mo:core/Map";
import Set "mo:core/Set";
import Common "../types/common";
import SocialTypes "../types/social";
import ProfileTypes "../types/profile";
import Nat "mo:core/Nat";
import NotifTypes "../types/notification";

module {
  public func addComment(
    comments : List.List<SocialTypes.Comment>,
    commentLikes : Map.Map<Text, Set.Set<Principal>>,
    posts : List.List<SocialTypes.Post>,
    notifications : List.List<NotifTypes.Notification>,
    notifIdCounter : { var value : Nat },
    idCounter : { var value : Nat },
    caller : Principal,
    postId : Text,
    content : Text,
    parentId : ?Text,
    now : Common.Timestamp,
  ) : SocialTypes.CommentView {
    idCounter.value += 1;
    let id = idCounter.value.toText();
    let comment : SocialTypes.Comment = {
      id; postId; authorId = caller; content; parentId; likesCount = 0; createdAt = now;
    };
    comments.add(comment);
    // Update commentsCount on post
    posts.mapInPlace(func(p) {
      if (p.id == postId) { { p with commentsCount = p.commentsCount + 1 } } else p;
    });
    // Notify post author
    switch (posts.find(func(p) { p.id == postId })) {
      case null {};
      case (?post) {
        if (post.authorId != caller) {
          notifIdCounter.value += 1;
          notifications.add({
            id = notifIdCounter.value.toText();
            recipientId = post.authorId;
            actorId = caller;
            notifType = #comment;
            referenceId = ?postId;
            isRead = false;
            createdAt = now;
          });
        };
      };
    };
    // Build view — profiles not available here, use empty strings
    { comment with authorUsername = ""; authorDisplayName = ""; authorAvatarUrl = null; likedByMe = false };
  };

  public func getComments(
    comments : List.List<SocialTypes.Comment>,
    commentLikes : Map.Map<Text, Set.Set<Principal>>,
    profiles : Map.Map<Principal, ProfileTypes.UserProfile>,
    postId : Text,
    caller : Principal,
  ) : [SocialTypes.CommentView] {
    let result = List.empty<SocialTypes.CommentView>();
    for (c in comments.values()) {
      if (c.postId == postId) {
        let (authorUsername, authorDisplayName, authorAvatarUrl) = switch (profiles.get(c.authorId)) {
          case null { ("", "", null) };
          case (?p) { (p.username, p.displayName, p.avatarUrl) };
        };
        let likedByMe = switch (commentLikes.get(c.id)) {
          case null false;
          case (?likers) likers.contains(caller);
        };
        result.add({ c with authorUsername; authorDisplayName; authorAvatarUrl; likedByMe });
      };
    };
    result.toArray();
  };

  public func likeComment(
    comments : List.List<SocialTypes.Comment>,
    commentLikes : Map.Map<Text, Set.Set<Principal>>,
    caller : Principal,
    id : Text,
  ) : () {
    let likers = switch (commentLikes.get(id)) {
      case (?s) s;
      case null {
        let s = Set.empty<Principal>();
        commentLikes.add(id, s);
        s;
      };
    };
    if (likers.contains(caller)) return;
    likers.add(caller);
    comments.mapInPlace(func(c) {
      if (c.id == id) { { c with likesCount = c.likesCount + 1 } } else c;
    });
  };

  public func deleteComment(
    comments : List.List<SocialTypes.Comment>,
    commentLikes : Map.Map<Text, Set.Set<Principal>>,
    posts : List.List<SocialTypes.Post>,
    caller : Principal,
    id : Text,
  ) : () {
    let sizeBefore = comments.size();
    let postIdRef = { var v : Text = "" };
    comments.retain(func(c) {
      if (c.id == id and c.authorId == caller) {
        postIdRef.v := c.postId;
        false;
      } else true;
    });
    if (comments.size() < sizeBefore) {
      commentLikes.remove(id);
      let pid = postIdRef.v;
      posts.mapInPlace(func(p) {
        if (p.id == pid) { { p with commentsCount = if (p.commentsCount > 0) p.commentsCount - 1 else 0 } } else p;
      });
    };
  };
};
