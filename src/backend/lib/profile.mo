import Debug "mo:core/Debug";
import Map "mo:core/Map";
import List "mo:core/List";
import Common "../types/common";
import ProfileTypes "../types/profile";
import Nat "mo:core/Nat";

module {
  public func upsertProfile(
    profiles : Map.Map<Principal, ProfileTypes.UserProfile>,
    caller : Principal,
    input : ProfileTypes.UpsertProfileInput,
    now : Common.Timestamp,
  ) : ProfileTypes.UserProfileView {
    let existing = profiles.get(caller);
    let (followersCount, followingCount, postsCount) = switch (existing) {
      case (?p) { (p.followersCount, p.followingCount, p.postsCount) };
      case null { (0, 0, 0) };
    };
    let profile : ProfileTypes.UserProfile = {
      id = caller;
      username = input.username;
      displayName = input.displayName;
      bio = input.bio;
      avatarUrl = input.avatarUrl;
      coverUrl = input.coverUrl;
      followersCount;
      followingCount;
      postsCount;
      createdAt = switch (existing) { case (?p) p.createdAt; case null now };
      isVerified = switch (existing) { case (?p) p.isVerified; case null false };
    };
    profiles.add(caller, profile);
    { profile with isFollowing = false };
  };

  public func getProfile(
    profiles : Map.Map<Principal, ProfileTypes.UserProfile>,
    follows : List.List<{ followerId : Principal; followeeId : Principal; createdAt : Common.Timestamp }>,
    userId : Principal,
    caller : Principal,
  ) : ?ProfileTypes.UserProfileView {
    switch (profiles.get(userId)) {
      case null null;
      case (?p) {
        let following = follows.find(func(f) { f.followerId == caller and f.followeeId == userId }) != null;
        ?{ p with isFollowing = following };
      };
    };
  };

  public func searchUsers(
    profiles : Map.Map<Principal, ProfileTypes.UserProfile>,
    searchTerm : Text,
    caller : Principal,
    follows : List.List<{ followerId : Principal; followeeId : Principal; createdAt : Common.Timestamp }>,
  ) : [ProfileTypes.UserProfileView] {
    let lower = searchTerm.toLower();
    let results = List.empty<ProfileTypes.UserProfileView>();
    for ((_, p) in profiles.entries()) {
      if (p.username.toLower().startsWith(#text lower) or p.displayName.toLower().startsWith(#text lower)) {
        let following = follows.find(func(f) { f.followerId == caller and f.followeeId == p.id }) != null;
        results.add({ p with isFollowing = following });
      };
    };
    results.toArray();
  };

  public func getSuggestedUsers(
    profiles : Map.Map<Principal, ProfileTypes.UserProfile>,
    follows : List.List<{ followerId : Principal; followeeId : Principal; createdAt : Common.Timestamp }>,
    caller : Principal,
  ) : [ProfileTypes.UserProfileView] {
    let results = List.empty<ProfileTypes.UserProfileView>();
    for ((_, p) in profiles.entries()) {
      if (p.id != caller) {
        let already = follows.find(func(f) { f.followerId == caller and f.followeeId == p.id }) != null;
        if (not already) {
          results.add({ p with isFollowing = false });
        };
      };
    };
    results.toArray();
  };

  public func listFollowers(
    profiles : Map.Map<Principal, ProfileTypes.UserProfile>,
    follows : List.List<{ followerId : Principal; followeeId : Principal; createdAt : Common.Timestamp }>,
    userId : Principal,
    caller : Principal,
  ) : [ProfileTypes.UserProfileView] {
    let results = List.empty<ProfileTypes.UserProfileView>();
    for (f in follows.values()) {
      if (f.followeeId == userId) {
        switch (profiles.get(f.followerId)) {
          case null {};
          case (?p) {
            let callerFollows = follows.find(func(f2) { f2.followerId == caller and f2.followeeId == p.id }) != null;
            results.add({ p with isFollowing = callerFollows });
          };
        };
      };
    };
    results.toArray();
  };

  public func listFollowing(
    profiles : Map.Map<Principal, ProfileTypes.UserProfile>,
    follows : List.List<{ followerId : Principal; followeeId : Principal; createdAt : Common.Timestamp }>,
    userId : Principal,
    caller : Principal,
  ) : [ProfileTypes.UserProfileView] {
    let results = List.empty<ProfileTypes.UserProfileView>();
    for (f in follows.values()) {
      if (f.followerId == userId) {
        switch (profiles.get(f.followeeId)) {
          case null {};
          case (?p) {
            let callerFollows = follows.find(func(f2) { f2.followerId == caller and f2.followeeId == p.id }) != null;
            results.add({ p with isFollowing = callerFollows });
          };
        };
      };
    };
    results.toArray();
  };

  public func toView(
    profile : ProfileTypes.UserProfile,
    followersCount : Nat,
    followingCount : Nat,
    isFollowing : Bool,
  ) : ProfileTypes.UserProfileView {
    { profile with followersCount; followingCount; isFollowing };
  };
};
