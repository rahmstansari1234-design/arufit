import Common "common";

module {
  // ── Call State ────────────────────────────────────────────────────────────

  public type CallStatus = {
    #ringing;
    #active;
    #ended;
    #declined;
    #missed;
  };

  public type CallRecord = {
    callId : Text;
    callerId : Principal;
    recipientId : Principal;
    groupId : ?Text;
    status : CallStatus;
    startedAt : Common.Timestamp;
    endedAt : ?Common.Timestamp;
  };

  public type CallView = {
    callId : Text;
    callerId : Principal;
    recipientId : Principal;
    groupId : ?Text;
    status : CallStatus;
    startedAt : Common.Timestamp;
    endedAt : ?Common.Timestamp;
    callerDisplayName : Text;
    callerAvatarUrl : ?Text;
    callerUsername : Text;
    recipientDisplayName : Text;
    recipientAvatarUrl : ?Text;
    recipientUsername : Text;
  };
};
