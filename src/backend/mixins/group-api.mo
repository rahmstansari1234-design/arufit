import Common "../types/common";
import GroupTypes "../types/group";
import Map "mo:core/Map";
import List "mo:core/List";
import ProfileTypes "../types/profile";
import Group "../lib/group";

mixin (
  groups : Map.Map<Text, GroupTypes.GroupChat>,
  groupMessages : List.List<GroupTypes.GroupMessage>,
  profiles : Map.Map<Principal, ProfileTypes.UserProfile>,
  groupIdCounter : { var value : Nat },
) {
  public shared ({ caller }) func createGroup(input : GroupTypes.CreateGroupInput) : async GroupTypes.GroupChatView {
    Group.createGroup(caller, input, groups, groupMessages, profiles, groupIdCounter);
  };

  public shared query ({ caller }) func getGroupChats() : async [GroupTypes.GroupChatView] {
    Group.getGroupChats(caller, groups, groupMessages, profiles);
  };

  public shared ({ caller }) func sendGroupMessage(
    groupId : Text,
    content : Text,
    mediaUrl : ?Text,
    replyToId : ?Text,
  ) : async GroupTypes.GroupMessageView {
    Group.sendGroupMessage(caller, groupId, content, mediaUrl, replyToId, groups, groupMessages, profiles, groupIdCounter);
  };

  public shared query ({ caller }) func getGroupMessages(
    groupId : Text,
    cursor : ?Text,
  ) : async Common.Page<GroupTypes.GroupMessageView> {
    Group.getGroupMessages(caller, groupId, cursor, groups, groupMessages, profiles);
  };

  public shared ({ caller }) func addGroupMember(groupId : Text, userId : Principal) : async () {
    Group.addGroupMember(caller, groupId, userId, groups, groupMessages, groupIdCounter);
  };

  public shared ({ caller }) func removeGroupMember(groupId : Text, userId : Principal) : async () {
    Group.removeGroupMember(caller, groupId, userId, groups, groupMessages, groupIdCounter);
  };

  public shared ({ caller }) func promoteGroupAdmin(groupId : Text, userId : Principal) : async () {
    Group.promoteGroupAdmin(caller, groupId, userId, groups);
  };

  public shared ({ caller }) func demoteGroupAdmin(groupId : Text, userId : Principal) : async () {
    Group.demoteGroupAdmin(caller, groupId, userId, groups);
  };

  public shared ({ caller }) func updateGroupInfo(
    groupId : Text,
    name : ?Text,
    avatarUrl : ?Text,
  ) : async GroupTypes.GroupChatView {
    Group.updateGroupInfo(caller, groupId, name, avatarUrl, groups, profiles, groupMessages);
  };

  public shared ({ caller }) func leaveGroup(groupId : Text) : async () {
    Group.leaveGroup(caller, groupId, groups, groupMessages, groupIdCounter);
  };

  public shared ({ caller }) func deleteGroup(groupId : Text) : async () {
    Group.deleteGroup(caller, groupId, groups, groupMessages);
  };
};
