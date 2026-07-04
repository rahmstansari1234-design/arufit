import List "mo:core/List";
import Map "mo:core/Map";
import Set "mo:core/Set";
import ProfileTypes "types/profile";
import SocialTypes "types/social";
import MessageTypes "types/message";
import NotifTypes "types/notification";
import ProfileApi "mixins/profile-api";
import FollowsApi "mixins/follows-api";
import PostsApi "mixins/posts-api";
import CommentsApi "mixins/comments-api";
import StoriesApi "mixins/stories-api";
import MessagesApi "mixins/messages-api";
import NotificationsApi "mixins/notifications-api";
import Migration "migration";
import GroupTypes "types/group";
import ReactionsTypes "types/reactions";
import CallsTypes "types/calls";
import GroupApi "mixins/group-api";
import PostReactionsApi "mixins/post-reactions-api";
import CallsApi "mixins/calls-api";

(with migration = Migration.run)
actor {
  // ── Profile state ─────────────────────────────────────────────────────────
  let profiles = Map.empty<Principal, ProfileTypes.UserProfile>();

  // ── Social graph state ────────────────────────────────────────────────────
  let follows = List.empty<SocialTypes.Follow>();

  // ── Posts + likes state ───────────────────────────────────────────────────
  let posts = List.empty<SocialTypes.Post>();
  let postLikes = Map.empty<Text, Set.Set<Principal>>();
  let postIdCounter = { var value : Nat = 0 };

  // ── Comments + likes state ────────────────────────────────────────────────
  let comments = List.empty<SocialTypes.Comment>();
  let commentLikes = Map.empty<Text, Set.Set<Principal>>();
  let commentIdCounter = { var value : Nat = 0 };

  // ── Stories state ─────────────────────────────────────────────────────────
  let stories = List.empty<SocialTypes.Story>();
  let storyIdCounter = { var value : Nat = 0 };

  // ── Messages + chat settings state ───────────────────────────────────────
  let messages = List.empty<MessageTypes.Message>();
  let chatSettings = Map.empty<Text, MessageTypes.ChatSettings>();
  let messageIdCounter = { var value : Nat = 0 };

  // ── Notifications state ───────────────────────────────────────────────────
  let notifications = List.empty<NotifTypes.Notification>();
  let notifIdCounter = { var value : Nat = 0 };
  // -- Group chats state
  let groups = Map.empty<Text, GroupTypes.GroupChat>();
  let groupMessages = List.empty<GroupTypes.GroupMessage>();
  let groupIdCounter = { var value : Nat = 0 };

  // -- Post reactions state
  let postReactions = List.empty<ReactionsTypes.PostReaction>();

  // -- Call records state
  let callRecords = List.empty<CallsTypes.CallRecord>();
  let callIdCounter = { var value : Nat = 0 };

  // ── Mixin composition ─────────────────────────────────────────────────────
  include ProfileApi(profiles, follows);
  include FollowsApi(follows, profiles, notifications, notifIdCounter);
  include PostsApi(posts, postLikes, profiles, follows, notifications, notifIdCounter, postIdCounter, postReactions);
  include CommentsApi(comments, commentLikes, posts, profiles, notifications, notifIdCounter, commentIdCounter);
  include StoriesApi(stories, profiles, follows, storyIdCounter);
  include MessagesApi(messages, chatSettings, profiles, messageIdCounter);
  include NotificationsApi(notifications, profiles);
  include GroupApi(groups, groupMessages, profiles, groupIdCounter);
  include PostReactionsApi(postReactions);
  include CallsApi(callRecords, profiles, callIdCounter);
};
