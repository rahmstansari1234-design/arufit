import Common "../types/common";
import CallsTypes "../types/calls";
import List "mo:core/List";
import Map "mo:core/Map";
import ProfileTypes "../types/profile";
import Calls "../lib/calls";

mixin (
  callRecords : List.List<CallsTypes.CallRecord>,
  profiles : Map.Map<Principal, ProfileTypes.UserProfile>,
  callIdCounter : { var value : Nat },
) {
  public shared ({ caller }) func startCall(recipientId : Principal) : async CallsTypes.CallView {
    Calls.startCall(caller, recipientId, callRecords, profiles, callIdCounter);
  };

  public shared ({ caller }) func endCall(callId : Text) : async CallsTypes.CallView {
    Calls.endCall(caller, callId, callRecords, profiles);
  };

  public shared ({ caller }) func updateCallStatus(callId : Text, status : CallsTypes.CallStatus) : async CallsTypes.CallView {
    Calls.updateCallStatus(caller, callId, status, callRecords, profiles);
  };

  public shared query ({ caller }) func getCallHistory(cursor : ?Text) : async Common.Page<CallsTypes.CallView> {
    Calls.getCallHistory(caller, cursor, callRecords, profiles);
  };
};
