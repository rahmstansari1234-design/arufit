import Map "mo:core/Map";
import List "mo:core/List";
import Time "mo:core/Time";
import Common "../types/common";
import ProfileTypes "../types/profile";
import SocialTypes "../types/social";
import ProfileLib "../lib/profile";

mixin (
  profiles : Map.Map<Principal, ProfileTypes.UserProfile>,
  follows : List.List<SocialTypes.Follow>,
) {
  /// Create or update the caller's profile
  public shared ({ caller }) func upsertProfile(
    input : ProfileTypes.UpsertProfileInput
  ) : async ProfileTypes.UserProfileView {
    ProfileLib.upsertProfile(profiles, caller, input, Time.now());
  };

  /// Get a user's public profile by principal
  public shared query ({ caller }) func getProfile(
    userId : Principal
  ) : async ?ProfileTypes.UserProfileView {
    ProfileLib.getProfile(profiles, follows, userId, caller);
  };

  /// Get the caller's own profile
  public shared query ({ caller }) func getMyProfile() : async ?ProfileTypes.UserProfileView {
    ProfileLib.getProfile(profiles, follows, caller, caller);
  };

  /// Search users by username or display name
  public shared query ({ caller }) func searchUsers(
    searchTerm : Text
  ) : async [ProfileTypes.UserProfileView] {
    ProfileLib.searchUsers(profiles, searchTerm, caller, follows);
  };

  /// Get suggested users to follow (not yet followed)
  public shared query ({ caller }) func getSuggestedUsers() : async [ProfileTypes.UserProfileView] {
    ProfileLib.getSuggestedUsers(profiles, follows, caller);
  };

  /// List followers of a user
  public shared query ({ caller }) func listFollowers(
    userId : Principal
  ) : async [ProfileTypes.UserProfileView] {
    ProfileLib.listFollowers(profiles, follows, userId, caller);
  };

  /// List users that a given user follows
  public shared query ({ caller }) func listFollowing(
    userId : Principal
  ) : async [ProfileTypes.UserProfileView] {
    ProfileLib.listFollowing(profiles, follows, userId, caller);
  };
};
