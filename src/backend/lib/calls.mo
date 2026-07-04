import Common "../types/common";
import CallsTypes "../types/calls";
import ProfileTypes "../types/profile";
import List "mo:core/List";
import Map "mo:core/Map";
import Time "mo:core/Time";
import Nat "mo:core/Nat";
import Runtime "mo:core/Runtime";

module {
  // ── Helpers ───────────────────────────────────────────────────────────────

  func profileInfo(
    profiles : Map.Map<Principal, ProfileTypes.UserProfile>,
    id : Principal,
  ) : (Text, ?Text, Text) {
    switch (profiles.get(id)) {
      case null { ("", null, "") };
      case (?p) { (p.displayName, p.avatarUrl, p.username) };
    };
  };

  func toCallView(
    record : CallsTypes.CallRecord,
    profiles : Map.Map<Principal, ProfileTypes.UserProfile>,
  ) : CallsTypes.CallView {
    let (callerDisplay, callerAvatar, callerUser) = profileInfo(profiles, record.callerId);
    let (recipientDisplay, recipientAvatar, recipientUser) = profileInfo(profiles, record.recipientId);
    {
      record with
      callerDisplayName = callerDisplay;
      callerAvatarUrl = callerAvatar;
      callerUsername = callerUser;
      recipientDisplayName = recipientDisplay;
      recipientAvatarUrl = recipientAvatar;
      recipientUsername = recipientUser;
    };
  };

  // ── Public functions ──────────────────────────────────────────────────────

  public func startCall(
    caller : Principal,
    recipientId : Principal,
    callRecords : List.List<CallsTypes.CallRecord>,
    profiles : Map.Map<Principal, ProfileTypes.UserProfile>,
    idCounter : { var value : Nat },
  ) : CallsTypes.CallView {
    idCounter.value += 1;
    let record : CallsTypes.CallRecord = {
      callId = idCounter.value.toText();
      callerId = caller;
      recipientId;
      groupId = null;
      status = #ringing;
      startedAt = Time.now();
      endedAt = null;
    };
    callRecords.add(record);
    toCallView(record, profiles);
  };

  public func endCall(
    caller : Principal,
    callId : Text,
    callRecords : List.List<CallsTypes.CallRecord>,
    profiles : Map.Map<Principal, ProfileTypes.UserProfile>,
  ) : CallsTypes.CallView {
    var updated : ?CallsTypes.CallRecord = null;
    callRecords.mapInPlace(func(r) {
      if (r.callId == callId and (r.callerId == caller or r.recipientId == caller)) {
        let u = { r with status = #ended; endedAt = ?Time.now() };
        updated := ?u;
        u;
      } else r;
    });
    switch (updated) {
      case null Runtime.trap("Call not found");
      case (?r) toCallView(r, profiles);
    };
  };

  public func updateCallStatus(
    caller : Principal,
    callId : Text,
    status : CallsTypes.CallStatus,
    callRecords : List.List<CallsTypes.CallRecord>,
    profiles : Map.Map<Principal, ProfileTypes.UserProfile>,
  ) : CallsTypes.CallView {
    var updated : ?CallsTypes.CallRecord = null;
    callRecords.mapInPlace(func(r) {
      if (r.callId == callId and (r.callerId == caller or r.recipientId == caller)) {
        let u = { r with status };
        updated := ?u;
        u;
      } else r;
    });
    switch (updated) {
      case null Runtime.trap("Call not found");
      case (?r) toCallView(r, profiles);
    };
  };

  public func getCallHistory(
    caller : Principal,
    cursor : ?Text,
    callRecords : List.List<CallsTypes.CallRecord>,
    profiles : Map.Map<Principal, ProfileTypes.UserProfile>,
  ) : Common.Page<CallsTypes.CallView> {
    let filtered = List.empty<CallsTypes.CallView>();
    for (r in callRecords.values()) {
      if (r.callerId == caller or r.recipientId == caller) {
        filtered.add(toCallView(r, profiles));
      };
    };
    let arr = filtered.toArray();
    let startIdx = switch (cursor) {
      case null 0;
      case (?c) {
        var idx = 0;
        for (i in Nat.range(0, arr.size())) {
          if (arr[i].callId == c) { idx := i + 1 };
        };
        idx;
      };
    };
    let pageSize = 20;
    let end = Nat.min(startIdx + pageSize, arr.size());
    let items = arr.sliceToArray(startIdx, end);
    let nextCursor = if (end < arr.size()) ?arr[end - 1].callId else null;
    { items; nextCursor; hasMore = end < arr.size() };
  };
};
