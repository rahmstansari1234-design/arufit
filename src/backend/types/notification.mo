import Common "common";

module {
  public type NotificationType = {
    #like;
    #comment;
    #follow;
    #message;
    #storyReply;
    #groupInvite;
    #postReaction;
    #incomingCall;
    #missedCall;
  };

  public type Notification = {
    id : Text;
    recipientId : Principal;
    actorId : Principal;
    notifType : NotificationType;
    referenceId : ?Text;
    isRead : Bool;
    createdAt : Common.Timestamp;
  };

  public type NotificationView = {
    id : Text;
    recipientId : Principal;
    actorId : Principal;
    actorUsername : Text;
    actorAvatarUrl : ?Text;
    notifType : NotificationType;
    referenceId : ?Text;
    isRead : Bool;
    createdAt : Common.Timestamp;
  };
};
