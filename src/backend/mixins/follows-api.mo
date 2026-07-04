import Map "mo:core/Map";
import List "mo:core/List";
import Time "mo:core/Time";
import Common "../types/common";
import SocialTypes "../types/social";
import ProfileTypes "../types/profile";
import NotifTypes "../types/notification";
import FollowsLib "../lib/follows";
import NotifsLib "../lib/notifications";

mixin (
  follows : List.List<SocialTypes.Follow>,
  profiles : Map.Map<Principal, ProfileTypes.UserProfile>,
  notifications : List.List<NotifTypes.Notification>,
  notifIdCounter : { var value : Nat },
) {
  /// Follow another user
  public shared ({ caller }) func follow(
    userId : Principal
  ) : async () {
    let now = Time.now();
    FollowsLib.follow(follows, profiles, caller, userId, now);
    NotifsLib.createNotification(notifications, notifIdCounter, userId, caller, #follow, null, now);
  };

  /// Unfollow a user
  public shared ({ caller }) func unfollow(
    userId : Principal
  ) : async () {
    FollowsLib.unfollow(follows, profiles, caller, userId);
  };

  /// Get followers of a user (returns principals)
  public shared query ({ caller }) func getFollowers(
    userId : Principal
  ) : async [Principal] {
    FollowsLib.getFollowers(follows, userId);
  };

  /// Get users that a principal follows (returns principals)
  public shared query ({ caller }) func getFollowing(
    userId : Principal
  ) : async [Principal] {
    FollowsLib.getFollowing(follows, userId);
  };

  /// Check if caller follows a user
  public shared query ({ caller }) func isFollowing(
    userId : Principal
  ) : async Bool {
    FollowsLib.isFollowing(follows, caller, userId);
  };
};
