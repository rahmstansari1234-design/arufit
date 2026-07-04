import Common "common";

module {
  public type MessageStatus = { #sending; #sent; #delivered; #read };

  public type DisappearingMode = { #off; #h24; #d7 };

  public type Message = {
    id : Text;
    fromId : Principal;
    toId : Principal;
    content : Text;
    mediaUrl : ?Text;
    status : MessageStatus;
    emojiReaction : ?Text;
    replyToId : ?Text;
    disappearsAt : ?Common.Timestamp;
    createdAt : Common.Timestamp;
  };

  public type MessageView = {
    id : Text;
    fromId : Principal;
    toId : Principal;
    content : Text;
    mediaUrl : ?Text;
    status : MessageStatus;
    emojiReaction : ?Text;
    replyToId : ?Text;
    disappearsAt : ?Common.Timestamp;
    createdAt : Common.Timestamp;
  };

  public type Conversation = {
    participantId : Principal;
    lastMessage : ?Text;
    lastMessageAt : Common.Timestamp;
    unreadCount : Nat;
  };

  public type ChatSettings = {
    wallpaper : ?Text;
    bubbleColorSent : ?Text;
    bubbleColorReceived : ?Text;
    chatName : ?Text;
    isMuted : Bool;
    muteUntil : ?Common.Timestamp;
    disappearingMode : DisappearingMode;
    isArchived : Bool;
  };

  public type SendMessageInput = {
    content : Text;
    mediaUrl : ?Text;
    replyToId : ?Text;
  };
};
