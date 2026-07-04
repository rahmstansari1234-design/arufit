import Map "mo:core/Map";
import List "mo:core/List";
import Time "mo:core/Time";
import Common "../types/common";
import SocialTypes "../types/social";
import ProfileTypes "../types/profile";
import StoriesLib "../lib/stories";

mixin (
  stories : List.List<SocialTypes.Story>,
  profiles : Map.Map<Principal, ProfileTypes.UserProfile>,
  follows : List.List<SocialTypes.Follow>,
  storyIdCounter : { var value : Nat },
) {
  /// Create a new story (24-hour expiry by default)
  public shared ({ caller }) func createStory(
    input : SocialTypes.CreateStoryInput
  ) : async SocialTypes.StoryView {
    StoriesLib.createStory(stories, profiles, storyIdCounter, caller, input, Time.now());
  };

  /// Get active (non-expired) stories from followed users + own
  public shared query ({ caller }) func getActiveStories() : async [SocialTypes.StoryView] {
    StoriesLib.getActiveStories(stories, profiles, follows, caller, Time.now());
  };

  /// Mark a story as viewed by caller
  public shared ({ caller }) func viewStory(
    id : Text
  ) : async () {
    StoriesLib.viewStory(stories, caller, id);
  };

  /// Get list of viewers for own story
  public shared query ({ caller }) func getStoryViewers(
    id : Text
  ) : async [ProfileTypes.UserProfileView] {
    StoriesLib.getStoryViewers(stories, profiles, id, caller);
  };
};
