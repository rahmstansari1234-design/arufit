import Debug "mo:core/Debug";
import List "mo:core/List";
import Map "mo:core/Map";
import Common "../types/common";
import SocialTypes "../types/social";
import ProfileTypes "../types/profile";

module {
  public func follow(
    follows : List.List<SocialTypes.Follow>,
    profiles : Map.Map<Principal, ProfileTypes.UserProfile>,
    caller : Principal,
    userId : Principal,
    now : Common.Timestamp,
  ) : () {
    if (caller == userId) return;
    let already = follows.find(func(f) { f.followerId == caller and f.followeeId == userId }) != null;
    if (already) return;
    follows.add({ followerId = caller; followeeId = userId; createdAt = now });
    // Update follower/following counts
    switch (profiles.get(userId)) {
      case null {};
      case (?p) { profiles.add(userId, { p with followersCount = p.followersCount + 1 }) };
    };
    switch (profiles.get(caller)) {
      case null {};
      case (?p) { profiles.add(caller, { p with followingCount = p.followingCount + 1 }) };
    };
  };

  public func unfollow(
    follows : List.List<SocialTypes.Follow>,
    profiles : Map.Map<Principal, ProfileTypes.UserProfile>,
    caller : Principal,
    userId : Principal,
  ) : () {
    let sizeBefore = follows.size();
    follows.retain(func(f) { not (f.followerId == caller and f.followeeId == userId) });
    if (follows.size() < sizeBefore) {
      switch (profiles.get(userId)) {
        case null {};
        case (?p) {
          profiles.add(userId, { p with followersCount = if (p.followersCount > 0) p.followersCount - 1 else 0 });
        };
      };
      switch (profiles.get(caller)) {
        case null {};
        case (?p) {
          profiles.add(caller, { p with followingCount = if (p.followingCount > 0) p.followingCount - 1 else 0 });
        };
      };
    };
  };

  public func isFollowing(
    follows : List.List<SocialTypes.Follow>,
    caller : Principal,
    userId : Principal,
  ) : Bool {
    follows.find(func(f) { f.followerId == caller and f.followeeId == userId }) != null;
  };

  public func getFollowers(
    follows : List.List<SocialTypes.Follow>,
    userId : Principal,
  ) : [Principal] {
    let result = List.empty<Principal>();
    for (f in follows.values()) {
      if (f.followeeId == userId) result.add(f.followerId);
    };
    result.toArray();
  };

  public func getFollowing(
    follows : List.List<SocialTypes.Follow>,
    userId : Principal,
  ) : [Principal] {
    let result = List.empty<Principal>();
    for (f in follows.values()) {
      if (f.followerId == userId) result.add(f.followeeId);
    };
    result.toArray();
  };
};
