import List "mo:core/List";
import Map "mo:core/Map";
import Set "mo:core/Set";
import Common "../types/common";
import SocialTypes "../types/social";
import ProfileTypes "../types/profile";
import ReactionsTypes "../types/reactions";
import Reactions "../lib/reactions";
import Nat "mo:core/Nat";
import Int "mo:core/Int";
import Array "mo:core/Array";
import NotifTypes "../types/notification";

module {
  public func createPost(
    posts : List.List<SocialTypes.Post>,
    postLikes : Map.Map<Text, Set.Set<Principal>>,
    profiles : Map.Map<Principal, ProfileTypes.UserProfile>,
    postReactions : List.List<ReactionsTypes.PostReaction>,
    idCounter : { var value : Nat },
    caller : Principal,
    input : SocialTypes.CreatePostInput,
    now : Common.Timestamp,
  ) : SocialTypes.PostView {
    idCounter.value += 1;
    let id = idCounter.value.toText();
    let post : SocialTypes.Post = {
      id;
      authorId = caller;
      mediaUrl = input.mediaUrl;
      caption = input.caption;
      moodTag = input.moodTag;
      visibility = input.visibility;
      likesCount = 0;
      commentsCount = 0;
      createdAt = now;
    };
    posts.add(post);
    // Update postsCount on profile
    switch (profiles.get(caller)) {
      case null {};
      case (?p) { profiles.add(caller, { p with postsCount = p.postsCount + 1 }) };
    };
    toView(post, postLikes, postReactions, profiles, caller);
  };

  public func getPost(
    posts : List.List<SocialTypes.Post>,
    postLikes : Map.Map<Text, Set.Set<Principal>>,
    profiles : Map.Map<Principal, ProfileTypes.UserProfile>,
    postReactions : List.List<ReactionsTypes.PostReaction>,
    id : Text,
    caller : Principal,
  ) : ?SocialTypes.PostView {
    switch (posts.find(func(p) { p.id == id })) {
      case null null;
      case (?post) ?toView(post, postLikes, postReactions, profiles, caller);
    };
  };

  public func getHomeFeed(
    posts : List.List<SocialTypes.Post>,
    postLikes : Map.Map<Text, Set.Set<Principal>>,
    profiles : Map.Map<Principal, ProfileTypes.UserProfile>,
    postReactions : List.List<ReactionsTypes.PostReaction>,
    follows : List.List<SocialTypes.Follow>,
    caller : Principal,
    cursor : ?Text,
  ) : Common.Page<SocialTypes.PostView> {
    let following = Set.empty<Principal>();
    for (f in follows.values()) {
      if (f.followerId == caller) following.add(f.followeeId);
    };
    following.add(caller);
    let filtered = List.empty<SocialTypes.PostView>();
    for (post in posts.values()) {
      if (following.contains(post.authorId)) {
        filtered.add(toView(post, postLikes, postReactions, profiles, caller));
      };
    };
    let arr = filtered.toArray();
    let startIdx = switch (cursor) {
      case null 0;
      case (?c) {
        var idx = 0;
        var found = false;
        for (i in Nat.range(0, arr.size())) {
          if (arr[i].id == c) { idx := i + 1; found := true };
        };
        idx;
      };
    };
    let pageSize = 20;
    let end = Nat.min(startIdx + pageSize, arr.size());
    let items = arr.sliceToArray(startIdx, end);
    let nextCursor = if (end < arr.size()) ?arr[end - 1].id else null;
    { items; nextCursor; hasMore = end < arr.size() };
  };

  public func getUserPosts(
    posts : List.List<SocialTypes.Post>,
    postLikes : Map.Map<Text, Set.Set<Principal>>,
    profiles : Map.Map<Principal, ProfileTypes.UserProfile>,
    postReactions : List.List<ReactionsTypes.PostReaction>,
    userId : Principal,
    caller : Principal,
    cursor : ?Text,
  ) : Common.Page<SocialTypes.PostView> {
    let filtered = List.empty<SocialTypes.PostView>();
    for (post in posts.values()) {
      if (post.authorId == userId) {
        filtered.add(toView(post, postLikes, postReactions, profiles, caller));
      };
    };
    let arr = filtered.toArray();
    let startIdx = switch (cursor) {
      case null 0;
      case (?c) {
        var idx = 0;
        for (i in Nat.range(0, arr.size())) {
          if (arr[i].id == c) { idx := i + 1 };
        };
        idx;
      };
    };
    let pageSize = 20;
    let end = Nat.min(startIdx + pageSize, arr.size());
    let items = arr.sliceToArray(startIdx, end);
    let nextCursor = if (end < arr.size()) ?arr[end - 1].id else null;
    { items; nextCursor; hasMore = end < arr.size() };
  };

  public func getTrendingPosts(
    posts : List.List<SocialTypes.Post>,
    postLikes : Map.Map<Text, Set.Set<Principal>>,
    profiles : Map.Map<Principal, ProfileTypes.UserProfile>,
    postReactions : List.List<ReactionsTypes.PostReaction>,
    caller : Principal,
    cursor : ?Text,
  ) : Common.Page<SocialTypes.PostView> {
    let arr = posts.toArray();
    // Sort by likesCount descending (simple bubble sort for moderate sizes)
    let sorted = arr.sort(func(a, b) { Int.compare(b.likesCount, a.likesCount) });
    let views = sorted.map(func(p) { toView(p, postLikes, postReactions, profiles, caller) });
    let startIdx = switch (cursor) {
      case null 0;
      case (?c) {
        var idx = 0;
        for (i in Nat.range(0, views.size())) {
          if (views[i].id == c) { idx := i + 1 };
        };
        idx;
      };
    };
    let pageSize = 20;
    let end = Nat.min(startIdx + pageSize, views.size());
    let items = views.sliceToArray(startIdx, end);
    let nextCursor = if (end < views.size()) ?views[end - 1].id else null;
    { items; nextCursor; hasMore = end < views.size() };
  };

  public func likePost(
    posts : List.List<SocialTypes.Post>,
    postLikes : Map.Map<Text, Set.Set<Principal>>,
    notifications : List.List<NotifTypes.Notification>,
    notifIdCounter : { var value : Nat },
    caller : Principal,
    id : Text,
    now : Common.Timestamp,
  ) : () {
    let likers = switch (postLikes.get(id)) {
      case (?s) s;
      case null {
        let s = Set.empty<Principal>();
        postLikes.add(id, s);
        s;
      };
    };
    if (likers.contains(caller)) return;
    likers.add(caller);
    // Update likesCount on post
    posts.mapInPlace(func(p) {
      if (p.id == id) { { p with likesCount = p.likesCount + 1 } } else p;
    });
    // Create notification for post author
    switch (posts.find(func(p) { p.id == id })) {
      case null {};
      case (?post) {
        if (post.authorId != caller) {
          notifIdCounter.value += 1;
          let notifId = notifIdCounter.value.toText();
          notifications.add({
            id = notifId;
            recipientId = post.authorId;
            actorId = caller;
            notifType = #like;
            referenceId = ?id;
            isRead = false;
            createdAt = now;
          });
        };
      };
    };
  };

  public func unlikePost(
    posts : List.List<SocialTypes.Post>,
    postLikes : Map.Map<Text, Set.Set<Principal>>,
    caller : Principal,
    id : Text,
  ) : () {
    switch (postLikes.get(id)) {
      case null {};
      case (?likers) {
        if (not likers.contains(caller)) return;
        likers.remove(caller);
        posts.mapInPlace(func(p) {
          if (p.id == id) { { p with likesCount = if (p.likesCount > 0) p.likesCount - 1 else 0 } } else p;
        });
      };
    };
  };

  public func deletePost(
    posts : List.List<SocialTypes.Post>,
    postLikes : Map.Map<Text, Set.Set<Principal>>,
    profiles : Map.Map<Principal, ProfileTypes.UserProfile>,
    caller : Principal,
    id : Text,
  ) : () {
    let sizeBefore = posts.size();
    posts.retain(func(p) { not (p.id == id and p.authorId == caller) });
    if (posts.size() < sizeBefore) {
      postLikes.remove(id);
      switch (profiles.get(caller)) {
        case null {};
        case (?p) {
          profiles.add(caller, { p with postsCount = if (p.postsCount > 0) p.postsCount - 1 else 0 });
        };
      };
    };
  };

  public func toView(
    post : SocialTypes.Post,
    postLikes : Map.Map<Text, Set.Set<Principal>>,
    postReactions : List.List<ReactionsTypes.PostReaction>,
    profiles : Map.Map<Principal, ProfileTypes.UserProfile>,
    caller : Principal,
  ) : SocialTypes.PostView {
    let (authorUsername, authorDisplayName, authorAvatarUrl) = switch (profiles.get(post.authorId)) {
      case null { ("", "", null) };
      case (?p) { (p.username, p.displayName, p.avatarUrl) };
    };
    let likedByMe = switch (postLikes.get(post.id)) {
      case null false;
      case (?likers) likers.contains(caller);
    };
    let reactions = Reactions.getPostReactions(caller, post.id, postReactions);
    { post with authorUsername; authorDisplayName; authorAvatarUrl; likedByMe; reactions };
  };
};
