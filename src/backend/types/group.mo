import Common "common";
import ProfileTypes "profile";
import MessageTypes "message";

module {
  // ── Group Chat ────────────────────────────────────────────────────────────

  public type GroupChat = {
    groupId : Text;
    name : Text;
    avatarUrl : ?Text;
    members : [Principal];
    adminIds : [Principal];
    createdAt : Common.Timestamp;
    createdBy : Principal;
  };

  public type GroupChatView = {
    groupId : Text;
    name : Text;
    avatarUrl : ?Text;
    members : [Principal];
    adminIds : [Principal];
    createdAt : Common.Timestamp;
    createdBy : Principal;
    lastMessage : ?Text;
    unreadCount : Nat;
    lastMessageAt : ?Common.Timestamp;
    memberProfiles : [ProfileTypes.UserProfileView];
  };

  public type CreateGroupInput = {
    name : Text;
    avatarUrl : ?Text;
    memberIds : [Principal];
  };

  // ── Group Message ─────────────────────────────────────────────────────────

  public type GroupMessage = {
    id : Text;
    groupId : Text;
    fromId : Principal;
    content : Text;
    mediaUrl : ?Text;
    replyToId : ?Text;
    status : MessageTypes.MessageStatus;
    createdAt : Common.Timestamp;
    reactions : [(Text, [Principal])];
  };

  public type GroupMessageView = {
    id : Text;
    groupId : Text;
    fromId : Principal;
    content : Text;
    mediaUrl : ?Text;
    replyToId : ?Text;
    status : MessageTypes.MessageStatus;
    createdAt : Common.Timestamp;
    reactions : [(Text, [Principal])];
    senderDisplayName : Text;
    senderAvatarUrl : ?Text;
    senderUsername : Text;
  };
};
