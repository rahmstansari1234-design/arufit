import Common "../types/common";
import GroupTypes "../types/group";
import ProfileTypes "../types/profile";
import MessageTypes "../types/message";
import List "mo:core/List";
import Map "mo:core/Map";
import Time "mo:core/Time";
import Array "mo:core/Array";
import Nat "mo:core/Nat";
import Runtime "mo:core/Runtime";

module {
  // ── Helpers ───────────────────────────────────────────────────────────────

  func requireMember(group : GroupTypes.GroupChat, caller : Principal) {
    let members = List.fromArray(group.members);
    if (members.find(func(m) { m == caller }) == null) {
      Runtime.trap("Not a group member");
    };
  };

  func requireAdmin(group : GroupTypes.GroupChat, caller : Principal) {
    let admins = List.fromArray(group.adminIds);
    if (admins.find(func(a) { a == caller }) == null) {
      Runtime.trap("Not a group admin");
    };
  };

  func profileOf(
    profiles : Map.Map<Principal, ProfileTypes.UserProfile>,
    id : Principal,
  ) : (Text, Text, ?Text) {
    switch (profiles.get(id)) {
      case null { ("", "", null) };
      case (?p) { (p.username, p.displayName, p.avatarUrl) };
    };
  };

  func memberProfiles(
    members : [Principal],
    profiles : Map.Map<Principal, ProfileTypes.UserProfile>,
    follows : [Principal], // unused placeholder for future use
  ) : [ProfileTypes.UserProfileView] {
    ignore follows;
    let views = List.empty<ProfileTypes.UserProfileView>();
    for (m in members.vals()) {
      switch (profiles.get(m)) {
        case null {};
        case (?p) {
          views.add({
            id = p.id;
            username = p.username;
            displayName = p.displayName;
            bio = p.bio;
            avatarUrl = p.avatarUrl;
            coverUrl = p.coverUrl;
            followersCount = p.followersCount;
            followingCount = p.followingCount;
            postsCount = p.postsCount;
            createdAt = p.createdAt;
            isVerified = p.isVerified;
            isFollowing = false;
          });
        };
      };
    };
    views.toArray();
  };

  func toGroupChatView(
    group : GroupTypes.GroupChat,
    groupMessages : List.List<GroupTypes.GroupMessage>,
    profiles : Map.Map<Principal, ProfileTypes.UserProfile>,
  ) : GroupTypes.GroupChatView {
    // Find last message for this group
    var lastMsg : ?Text = null;
    var lastMsgAt : ?Common.Timestamp = null;
    var unread : Nat = 0;
    for (msg in groupMessages.values()) {
      if (msg.groupId == group.groupId) {
        lastMsg := ?msg.content;
        lastMsgAt := ?msg.createdAt;
        unread += 1;
      };
    };
    {
      group with
      lastMessage = lastMsg;
      unreadCount = unread;
      lastMessageAt = lastMsgAt;
      memberProfiles = memberProfiles(group.members, profiles, []);
    };
  };

  func toGroupMessageView(
    msg : GroupTypes.GroupMessage,
    profiles : Map.Map<Principal, ProfileTypes.UserProfile>,
  ) : GroupTypes.GroupMessageView {
    let (username, displayName, avatarUrl) = profileOf(profiles, msg.fromId);
    {
      msg with
      senderDisplayName = displayName;
      senderAvatarUrl = avatarUrl;
      senderUsername = username;
    };
  };

  func pushSystemMessage(
    groupId : Text,
    content : Text,
    groupMessages : List.List<GroupTypes.GroupMessage>,
    idCounter : { var value : Nat },
    systemPrincipal : Principal,
  ) {
    idCounter.value += 1;
    groupMessages.add({
      id = idCounter.value.toText();
      groupId;
      fromId = systemPrincipal;
      content;
      mediaUrl = null;
      replyToId = null;
      status = #sent;
      createdAt = Time.now();
      reactions = [];
    });
  };

  // ── Public functions ──────────────────────────────────────────────────────

  public func createGroup(
    caller : Principal,
    input : GroupTypes.CreateGroupInput,
    groups : Map.Map<Text, GroupTypes.GroupChat>,
    groupMessages : List.List<GroupTypes.GroupMessage>,
    profiles : Map.Map<Principal, ProfileTypes.UserProfile>,
    idCounter : { var value : Nat },
  ) : GroupTypes.GroupChatView {
    idCounter.value += 1;
    let groupId = idCounter.value.toText();
    // Caller is always a member and admin; add extra memberIds
    let allMembers = List.empty<Principal>();
    allMembers.add(caller);
    for (m in input.memberIds.vals()) {
      if (m != caller) allMembers.add(m);
    };
    let group : GroupTypes.GroupChat = {
      groupId;
      name = input.name;
      avatarUrl = input.avatarUrl;
      members = allMembers.toArray();
      adminIds = [caller];
      createdAt = Time.now();
      createdBy = caller;
    };
    groups.add(groupId, group);
    toGroupChatView(group, groupMessages, profiles);
  };

  public func getGroupChats(
    caller : Principal,
    groups : Map.Map<Text, GroupTypes.GroupChat>,
    groupMessages : List.List<GroupTypes.GroupMessage>,
    profiles : Map.Map<Principal, ProfileTypes.UserProfile>,
  ) : [GroupTypes.GroupChatView] {
    let result = List.empty<GroupTypes.GroupChatView>();
    for ((_id, group) in groups.entries()) {
      let members = List.fromArray(group.members);
      if (members.find(func(m) { m == caller }) != null) {
        result.add(toGroupChatView(group, groupMessages, profiles));
      };
    };
    result.toArray();
  };

  public func sendGroupMessage(
    caller : Principal,
    groupId : Text,
    content : Text,
    mediaUrl : ?Text,
    replyToId : ?Text,
    groups : Map.Map<Text, GroupTypes.GroupChat>,
    groupMessages : List.List<GroupTypes.GroupMessage>,
    profiles : Map.Map<Principal, ProfileTypes.UserProfile>,
    idCounter : { var value : Nat },
  ) : GroupTypes.GroupMessageView {
    let group = switch (groups.get(groupId)) {
      case null Runtime.trap("Group not found");
      case (?g) g;
    };
    requireMember(group, caller);
    idCounter.value += 1;
    let msg : GroupTypes.GroupMessage = {
      id = idCounter.value.toText();
      groupId;
      fromId = caller;
      content;
      mediaUrl;
      replyToId;
      status = #sent;
      createdAt = Time.now();
      reactions = [];
    };
    groupMessages.add(msg);
    toGroupMessageView(msg, profiles);
  };

  public func getGroupMessages(
    caller : Principal,
    groupId : Text,
    cursor : ?Text,
    groups : Map.Map<Text, GroupTypes.GroupChat>,
    groupMessages : List.List<GroupTypes.GroupMessage>,
    profiles : Map.Map<Principal, ProfileTypes.UserProfile>,
  ) : Common.Page<GroupTypes.GroupMessageView> {
    let group = switch (groups.get(groupId)) {
      case null Runtime.trap("Group not found");
      case (?g) g;
    };
    requireMember(group, caller);
    let filtered = List.empty<GroupTypes.GroupMessageView>();
    for (msg in groupMessages.values()) {
      if (msg.groupId == groupId) {
        filtered.add(toGroupMessageView(msg, profiles));
      };
    };
    let arr = filtered.toArray();
    let startIdx = switch (cursor) {
      case null 0;
      case (?c) {
        var idx = 0;
        for (i in Nat.range(0, arr.size())) {
          if (arr[i].id == c) { idx := i + 1 };
        };
        idx;
      };
    };
    let pageSize = 30;
    let end = Nat.min(startIdx + pageSize, arr.size());
    let items = arr.sliceToArray(startIdx, end);
    let nextCursor = if (end < arr.size()) ?arr[end - 1].id else null;
    { items; nextCursor; hasMore = end < arr.size() };
  };

  public func addGroupMember(
    caller : Principal,
    groupId : Text,
    userId : Principal,
    groups : Map.Map<Text, GroupTypes.GroupChat>,
    groupMessages : List.List<GroupTypes.GroupMessage>,
    idCounter : { var value : Nat },
  ) : () {
    let group = switch (groups.get(groupId)) {
      case null Runtime.trap("Group not found");
      case (?g) g;
    };
    requireAdmin(group, caller);
    // Avoid duplicates
    let members = List.fromArray(group.members);
    if (members.find(func(m) { m == userId }) != null) return;
    let newMembers = List.fromArray(group.members);
    newMembers.add(userId);
    groups.add(groupId, { group with members = newMembers.toArray() });
    pushSystemMessage(groupId, "User joined", groupMessages, idCounter, userId);
  };

  public func removeGroupMember(
    caller : Principal,
    groupId : Text,
    userId : Principal,
    groups : Map.Map<Text, GroupTypes.GroupChat>,
    groupMessages : List.List<GroupTypes.GroupMessage>,
    idCounter : { var value : Nat },
  ) : () {
    let group = switch (groups.get(groupId)) {
      case null Runtime.trap("Group not found");
      case (?g) g;
    };
    requireAdmin(group, caller);
    let newMembers = group.members.filter(func(m) { m != userId });
    groups.add(groupId, { group with members = newMembers });
    pushSystemMessage(groupId, "User was removed", groupMessages, idCounter, userId);
  };

  public func promoteGroupAdmin(
    caller : Principal,
    groupId : Text,
    userId : Principal,
    groups : Map.Map<Text, GroupTypes.GroupChat>,
  ) : () {
    let group = switch (groups.get(groupId)) {
      case null Runtime.trap("Group not found");
      case (?g) g;
    };
    requireAdmin(group, caller);
    let admins = List.fromArray(group.adminIds);
    if (admins.find(func(a) { a == userId }) != null) return;
    admins.add(userId);
    groups.add(groupId, { group with adminIds = admins.toArray() });
  };

  public func demoteGroupAdmin(
    caller : Principal,
    groupId : Text,
    userId : Principal,
    groups : Map.Map<Text, GroupTypes.GroupChat>,
  ) : () {
    let group = switch (groups.get(groupId)) {
      case null Runtime.trap("Group not found");
      case (?g) g;
    };
    requireAdmin(group, caller);
    if (group.adminIds.size() <= 1) Runtime.trap("Cannot demote last admin");
    let newAdmins = group.adminIds.filter(func(a) { a != userId });
    groups.add(groupId, { group with adminIds = newAdmins });
  };

  public func updateGroupInfo(
    caller : Principal,
    groupId : Text,
    name : ?Text,
    avatarUrl : ?Text,
    groups : Map.Map<Text, GroupTypes.GroupChat>,
    profiles : Map.Map<Principal, ProfileTypes.UserProfile>,
    groupMessages : List.List<GroupTypes.GroupMessage>,
  ) : GroupTypes.GroupChatView {
    let group = switch (groups.get(groupId)) {
      case null Runtime.trap("Group not found");
      case (?g) g;
    };
    requireAdmin(group, caller);
    let newName = switch (name) { case null group.name; case (?n) n };
    let newAvatar = switch (avatarUrl) { case null group.avatarUrl; case (?u) ?u };
    let updated = { group with name = newName; avatarUrl = newAvatar };
    groups.add(groupId, updated);
    toGroupChatView(updated, groupMessages, profiles);
  };

  public func leaveGroup(
    caller : Principal,
    groupId : Text,
    groups : Map.Map<Text, GroupTypes.GroupChat>,
    groupMessages : List.List<GroupTypes.GroupMessage>,
    idCounter : { var value : Nat },
  ) : () {
    let group = switch (groups.get(groupId)) {
      case null Runtime.trap("Group not found");
      case (?g) g;
    };
    requireMember(group, caller);
    let newMembers = group.members.filter(func(m) { m != caller });
    // If caller was last admin, try to promote next member or delete group
    let newAdmins = group.adminIds.filter(func(a) { a != caller });
    if (newAdmins.size() == 0 and newMembers.size() > 0) {
      // Promote first remaining member
      let newAdmin = newMembers[0];
      groups.add(groupId, { group with members = newMembers; adminIds = [newAdmin] });
    } else if (newMembers.size() == 0) {
      groups.remove(groupId);
      return;
    } else {
      groups.add(groupId, { group with members = newMembers; adminIds = newAdmins });
    };
    pushSystemMessage(groupId, "User left", groupMessages, idCounter, caller);
  };

  public func deleteGroup(
    caller : Principal,
    groupId : Text,
    groups : Map.Map<Text, GroupTypes.GroupChat>,
    groupMessages : List.List<GroupTypes.GroupMessage>,
  ) : () {
    let group = switch (groups.get(groupId)) {
      case null Runtime.trap("Group not found");
      case (?g) g;
    };
    if (group.createdBy != caller) Runtime.trap("Only group creator can delete the group");
    groups.remove(groupId);
    groupMessages.retain(func(msg) { msg.groupId != groupId });
  };
};
