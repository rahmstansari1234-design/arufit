import Debug "mo:core/Debug";
import List "mo:core/List";
import Map "mo:core/Map";
import Common "../types/common";
import SocialTypes "../types/social";
import ProfileTypes "../types/profile";
import Nat "mo:core/Nat";
import Array "mo:core/Array";
import Set "mo:core/Set";
import Principal "mo:core/Principal";

module {
  public func createStory(
    stories : List.List<SocialTypes.Story>,
    profiles : Map.Map<Principal, ProfileTypes.UserProfile>,
    idCounter : { var value : Nat },
    caller : Principal,
    input : SocialTypes.CreateStoryInput,
    now : Common.Timestamp,
  ) : SocialTypes.StoryView {
    idCounter.value += 1;
    let id = idCounter.value.toText();
    let expiresAt = now + 86_400_000_000_000; // 24 hours in nanoseconds
    let story : SocialTypes.Story = {
      id;
      authorId = caller;
      mediaUrl = input.mediaUrl;
      caption = input.caption;
      moodTag = input.moodTag;
      expiresAt;
      viewedBy = [];
      createdAt = now;
    };
    stories.add(story);
    let (authorUsername, authorDisplayName, authorAvatarUrl) = switch (profiles.get(caller)) {
      case null { ("", "", null) };
      case (?p) { (p.username, p.displayName, p.avatarUrl) };
    };
    { story with authorUsername; authorDisplayName; authorAvatarUrl; viewsCount = 0; viewedByMe = false };
  };

  public func getActiveStories(
    stories : List.List<SocialTypes.Story>,
    profiles : Map.Map<Principal, ProfileTypes.UserProfile>,
    follows : List.List<SocialTypes.Follow>,
    caller : Principal,
    now : Common.Timestamp,
  ) : [SocialTypes.StoryView] {
    let following = Set.empty<Principal>();
    for (f in follows.values()) {
      if (f.followerId == caller) following.add(f.followeeId);
    };
    following.add(caller);
    let result = List.empty<SocialTypes.StoryView>();
    for (s in stories.values()) {
      if (s.expiresAt > now and following.contains(s.authorId)) {
        let (authorUsername, authorDisplayName, authorAvatarUrl) = switch (profiles.get(s.authorId)) {
          case null { ("", "", null) };
          case (?p) { (p.username, p.displayName, p.avatarUrl) };
        };
        let viewedByMe = s.viewedBy.contains(caller);
        result.add({ s with authorUsername; authorDisplayName; authorAvatarUrl; viewsCount = s.viewedBy.size(); viewedByMe });
      };
    };
    result.toArray();
  };

  public func viewStory(
    stories : List.List<SocialTypes.Story>,
    caller : Principal,
    id : Text,
  ) : () {
    stories.mapInPlace(func(s) {
      if (s.id == id and not s.viewedBy.contains(caller)) {
        { s with viewedBy = s.viewedBy.concat([caller]) };
      } else s;
    });
  };

  public func getStoryViewers(
    stories : List.List<SocialTypes.Story>,
    profiles : Map.Map<Principal, ProfileTypes.UserProfile>,
    id : Text,
    caller : Principal,
  ) : [ProfileTypes.UserProfileView] {
    switch (stories.find(func(s) { s.id == id and s.authorId == caller })) {
      case null [];
      case (?story) {
        let result = List.empty<ProfileTypes.UserProfileView>();
        for (viewerId in story.viewedBy.vals()) {
          switch (profiles.get(viewerId)) {
            case null {};
            case (?p) { result.add({ p with isFollowing = false }) };
          };
        };
        result.toArray();
      };
    };
  };
};
