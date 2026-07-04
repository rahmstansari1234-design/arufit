// Migration: Arufit (v14 base) → Arufit (v15 with groups/reactions/calls)
// OldActor matches the previously deployed Arufit actor's stable fields exactly.
// The 6 new fields (groups, groupMessages, groupIdCounter, postReactions,
// callRecords, callIdCounter) are initialized as empty on upgrade.
import Map "mo:core/Map";
import List "mo:core/List";
import Set "mo:core/Set";

module {
  // ── Old Arufit inline types ─────────────────────────────────────────────────
  // (copied from .old/src/backend/types/ — do NOT import from .old/)

  type Timestamp = Int;

  // Previously deployed UserProfile (types/profile.mo) — no var fields
  type OldUserProfile = {
    id : Principal;
    username : Text;
    displayName : Text;
    bio : Text;
    avatarUrl : ?Text;
    coverUrl : ?Text;
    followersCount : Nat;
    followingCount : Nat;
    postsCount : Nat;
    createdAt : Timestamp;
    isVerified : Bool;
  };

  // Previously deployed Follow (types/social.mo)
  type OldFollow = { followerId : Principal; followeeId : Principal; createdAt : Timestamp };

  // Previously deployed Post (types/social.mo)
  type OldPost = {
    id : Text;
    authorId : Principal;
    mediaUrl : ?Text;
    caption : Text;
    moodTag : ?Text;
    visibility : { #everyone; #followers };
    likesCount : Nat;
    commentsCount : Nat;
    createdAt : Timestamp;
  };

  // Previously deployed Comment (types/social.mo)
  type OldComment = {
    id : Text;
    postId : Text;
    authorId : Principal;
    content : Text;
    parentId : ?Text;
    likesCount : Nat;
    createdAt : Timestamp;
  };

  // Previously deployed Story (types/social.mo)
  type OldStory = {
    id : Text;
    authorId : Principal;
    mediaUrl : ?Text;
    caption : ?Text;
    moodTag : ?Text;
    expiresAt : Timestamp;
    viewedBy : [Principal];
    createdAt : Timestamp;
  };

  // Previously deployed MessageStatus and DisappearingMode (types/message.mo)
  type OldMessageStatus = { #sending; #sent; #delivered; #read };
  type OldDisappearingMode = { #off; #h24; #d7 };

  // Previously deployed Message (types/message.mo)
  type OldMessage = {
    id : Text;
    fromId : Principal;
    toId : Principal;
    content : Text;
    mediaUrl : ?Text;
    status : OldMessageStatus;
    emojiReaction : ?Text;
    replyToId : ?Text;
    disappearsAt : ?Timestamp;
    createdAt : Timestamp;
  };

  // Previously deployed ChatSettings (types/message.mo)
  type OldChatSettings = {
    wallpaper : ?Text;
    bubbleColorSent : ?Text;
    bubbleColorReceived : ?Text;
    chatName : ?Text;
    isMuted : Bool;
    muteUntil : ?Timestamp;
    disappearingMode : OldDisappearingMode;
    isArchived : Bool;
  };

  // Previously deployed NotificationType (types/notification.mo)
  // NOTE: old version only had 5 variants — no groupInvite/postReaction/call variants
  type OldNotificationType = { #like; #comment; #follow; #message; #storyReply };

  // Previously deployed Notification (types/notification.mo)
  type OldNotification = {
    id : Text;
    recipientId : Principal;
    actorId : Principal;
    notifType : OldNotificationType;
    referenceId : ?Text;
    isRead : Bool;
    createdAt : Timestamp;
  };

  // ── Old actor stable shape — matches .old/src/backend/main.mo exactly ──────
  type OldActor = {
    profiles : Map.Map<Principal, OldUserProfile>;
    follows : List.List<OldFollow>;
    posts : List.List<OldPost>;
    postLikes : Map.Map<Text, Set.Set<Principal>>;
    postIdCounter : { var value : Nat };
    comments : List.List<OldComment>;
    commentLikes : Map.Map<Text, Set.Set<Principal>>;
    commentIdCounter : { var value : Nat };
    stories : List.List<OldStory>;
    storyIdCounter : { var value : Nat };
    messages : List.List<OldMessage>;
    chatSettings : Map.Map<Text, OldChatSettings>;
    messageIdCounter : { var value : Nat };
    notifications : List.List<OldNotification>;
    notifIdCounter : { var value : Nat };
  };

  // ── New Arufit actor stable shape ──────────────────────────────────────────
  // New types exactly match the canonical definitions in types/*.mo
  // UserProfile (types/profile.mo) — immutable record, no var fields
  type NewUserProfile = {
    id : Principal;
    username : Text;
    displayName : Text;
    bio : Text;
    avatarUrl : ?Text;
    coverUrl : ?Text;
    followersCount : Nat;
    followingCount : Nat;
    postsCount : Nat;
    createdAt : Timestamp;
    isVerified : Bool;
  };

  // Follow (types/social.mo)
  type NewFollow = { followerId : Principal; followeeId : Principal; createdAt : Timestamp };

  // Post (types/social.mo) — immutable record, no var fields
  type NewPost = {
    id : Text;
    authorId : Principal;
    mediaUrl : ?Text;
    caption : Text;
    moodTag : ?Text;
    visibility : { #everyone; #followers };
    likesCount : Nat;
    commentsCount : Nat;
    createdAt : Timestamp;
  };

  // Comment (types/social.mo) — immutable record, no var fields
  type NewComment = {
    id : Text;
    postId : Text;
    authorId : Principal;
    content : Text;
    parentId : ?Text;
    likesCount : Nat;
    createdAt : Timestamp;
  };

  // Story (types/social.mo) — immutable record, no var fields
  type NewStory = {
    id : Text;
    authorId : Principal;
    mediaUrl : ?Text;
    caption : ?Text;
    moodTag : ?Text;
    expiresAt : Timestamp;
    viewedBy : [Principal];
    createdAt : Timestamp;
  };

  // MessageStatus and DisappearingMode (types/message.mo)
  type MessageStatus = { #sending; #sent; #delivered; #read };
  type DisappearingMode = { #off; #h24; #d7 };

  // Message (types/message.mo) — immutable record, no var fields
  type NewMessage = {
    id : Text;
    fromId : Principal;
    toId : Principal;
    content : Text;
    mediaUrl : ?Text;
    status : MessageStatus;
    emojiReaction : ?Text;
    replyToId : ?Text;
    disappearsAt : ?Timestamp;
    createdAt : Timestamp;
  };

  // ChatSettings (types/message.mo) — immutable record, no var fields
  type NewChatSettings = {
    wallpaper : ?Text;
    bubbleColorSent : ?Text;
    bubbleColorReceived : ?Text;
    chatName : ?Text;
    isMuted : Bool;
    muteUntil : ?Timestamp;
    disappearingMode : DisappearingMode;
    isArchived : Bool;
  };

  // NotificationType (types/notification.mo)
  type NotificationType = { #like; #comment; #follow; #message; #storyReply; #groupInvite; #postReaction; #incomingCall; #missedCall };

  // Notification (types/notification.mo) — immutable record, no var fields
  type NewNotification = {
    id : Text;
    recipientId : Principal;
    actorId : Principal;
    notifType : NotificationType;
    referenceId : ?Text;
    isRead : Bool;
    createdAt : Timestamp;
  };

  // GroupRole and GroupChat (types/group.mo)
  type GroupMsgStatus = { #sending; #sent; #delivered; #read };
  type GroupChat = {
    groupId : Text;
    name : Text;
    avatarUrl : ?Text;
    members : [Principal];
    adminIds : [Principal];
    createdAt : Timestamp;
    createdBy : Principal;
  };

  // GroupMessage (types/group.mo)
  type GroupMessage = {
    id : Text;
    groupId : Text;
    fromId : Principal;
    content : Text;
    mediaUrl : ?Text;
    replyToId : ?Text;
    status : GroupMsgStatus;
    createdAt : Timestamp;
    reactions : [(Text, [Principal])];
  };

  // PostReaction (types/reactions.mo)
  type PostReaction = {
    postId : Text;
    userId : Principal;
    emoji : Text;
    createdAt : Timestamp;
  };

  // CallStatus and CallRecord (types/calls.mo)
  type CallStatus = { #ringing; #active; #ended; #declined; #missed };
  type CallRecord = {
    callId : Text;
    callerId : Principal;
    recipientId : Principal;
    groupId : ?Text;
    status : CallStatus;
    startedAt : Timestamp;
    endedAt : ?Timestamp;
  };

  type NewActor = {
    profiles : Map.Map<Principal, NewUserProfile>;
    follows : List.List<NewFollow>;
    posts : List.List<NewPost>;
    postLikes : Map.Map<Text, Set.Set<Principal>>;
    postIdCounter : { var value : Nat };
    comments : List.List<NewComment>;
    commentLikes : Map.Map<Text, Set.Set<Principal>>;
    commentIdCounter : { var value : Nat };
    stories : List.List<NewStory>;
    storyIdCounter : { var value : Nat };
    messages : List.List<NewMessage>;
    chatSettings : Map.Map<Text, NewChatSettings>;
    messageIdCounter : { var value : Nat };
    notifications : List.List<NewNotification>;
    notifIdCounter : { var value : Nat };
    groups : Map.Map<Text, GroupChat>;
    groupMessages : List.List<GroupMessage>;
    groupIdCounter : { var value : Nat };
    postReactions : List.List<PostReaction>;
    callRecords : List.List<CallRecord>;
    callIdCounter : { var value : Nat };
  };

  // ── Migration function ─────────────────────────────────────────────────────
  // Passes through all existing Arufit data. The 6 new fields are initialized
  // as empty. Notification types are widened via cast (OldNotificationType is
  // a subtype of NewNotificationType — new variants are additive).
  public func run(old : OldActor) : NewActor {
    // Cast old notifications: OldNotificationType ⊆ NewNotificationType
    let newNotifs = old.notifications.map<OldNotification, NewNotification>(
      func(n) {
        {
          id = n.id;
          recipientId = n.recipientId;
          actorId = n.actorId;
          notifType = (n.notifType : OldNotificationType) : NotificationType;
          referenceId = n.referenceId;
          isRead = n.isRead;
          createdAt = n.createdAt;
        };
      }
    );
    // Cast old messages: OldMessageStatus ⊆ NewMessageStatus,
    // OldDisappearingMode ⊆ NewDisappearingMode
    let newMessages = old.messages.map<OldMessage, NewMessage>(
      func(m) {
        {
          id = m.id;
          fromId = m.fromId;
          toId = m.toId;
          content = m.content;
          mediaUrl = m.mediaUrl;
          status = (m.status : OldMessageStatus) : MessageStatus;
          emojiReaction = m.emojiReaction;
          replyToId = m.replyToId;
          disappearsAt = m.disappearsAt;
          createdAt = m.createdAt;
        };
      }
    );
    // Cast old chat settings: OldDisappearingMode ⊆ DisappearingMode
    let newChatSettings = old.chatSettings.map<Text, OldChatSettings, NewChatSettings>(
      func(_k, s) {
        {
          wallpaper = s.wallpaper;
          bubbleColorSent = s.bubbleColorSent;
          bubbleColorReceived = s.bubbleColorReceived;
          chatName = s.chatName;
          isMuted = s.isMuted;
          muteUntil = s.muteUntil;
          disappearingMode = (s.disappearingMode : OldDisappearingMode) : DisappearingMode;
          isArchived = s.isArchived;
        };
      }
    );
    {
      // Pass through existing Arufit fields
      profiles = old.profiles;
      follows = old.follows;
      posts = old.posts;
      postLikes = old.postLikes;
      postIdCounter = old.postIdCounter;
      comments = old.comments;
      commentLikes = old.commentLikes;
      commentIdCounter = old.commentIdCounter;
      stories = old.stories;
      storyIdCounter = old.storyIdCounter;
      messages = newMessages;
      chatSettings = newChatSettings;
      messageIdCounter = old.messageIdCounter;
      notifications = newNotifs;
      notifIdCounter = old.notifIdCounter;
      // Initialize 6 new fields as empty
      groups = Map.empty<Text, GroupChat>();
      groupMessages = List.empty<GroupMessage>();
      groupIdCounter = { var value = 0 };
      postReactions = List.empty<PostReaction>();
      callRecords = List.empty<CallRecord>();
      callIdCounter = { var value = 0 };
    };
  };
};
