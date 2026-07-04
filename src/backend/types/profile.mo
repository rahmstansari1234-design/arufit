import Common "common";

module {
  /// Mutable internal profile stored in canister state
  public type UserProfile = {
    id : Principal;
    username : Text;
    displayName : Text;
    bio : Text;
    avatarUrl : ?Text;
    coverUrl : ?Text;
    followersCount : Nat;
    followingCount : Nat;
    postsCount : Nat;
    createdAt : Common.Timestamp;
    isVerified : Bool;
  };

  /// Immutable public view of a profile
  public type UserProfileView = {
    id : Principal;
    username : Text;
    displayName : Text;
    bio : Text;
    avatarUrl : ?Text;
    coverUrl : ?Text;
    followersCount : Nat;
    followingCount : Nat;
    postsCount : Nat;
    createdAt : Common.Timestamp;
    isVerified : Bool;
    isFollowing : Bool;
  };

  /// Input for creating or updating a profile
  public type UpsertProfileInput = {
    username : Text;
    displayName : Text;
    bio : Text;
    avatarUrl : ?Text;
    coverUrl : ?Text;
  };
};
