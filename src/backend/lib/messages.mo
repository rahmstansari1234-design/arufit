import Debug "mo:core/Debug";
import List "mo:core/List";
import Map "mo:core/Map";
import Common "../types/common";
import MessageTypes "../types/message";
import ProfileTypes "../types/profile";
import Nat "mo:core/Nat";
import Array "mo:core/Array";

module {
  public func sendMessage(
    messages : List.List<MessageTypes.Message>,
    chatSettings : Map.Map<Text, MessageTypes.ChatSettings>,
    idCounter : { var value : Nat },
    caller : Principal,
    toId : Principal,
    input : MessageTypes.SendMessageInput,
    now : Common.Timestamp,
  ) : MessageTypes.MessageView {
    idCounter.value += 1;
    let id = idCounter.value.toText();
    let msg : MessageTypes.Message = {
      id;
      fromId = caller;
      toId;
      content = input.content;
      mediaUrl = input.mediaUrl;
      status = #sent;
      emojiReaction = null;
      replyToId = input.replyToId;
      disappearsAt = null;
      createdAt = now;
    };
    messages.add(msg);
    msg; // MessageView has same shape as Message
  };

  public func getMessages(
    messages : List.List<MessageTypes.Message>,
    caller : Principal,
    userId : Principal,
    cursor : ?Text,
  ) : Common.Page<MessageTypes.MessageView> {
    let filtered = List.empty<MessageTypes.MessageView>();
    for (m in messages.values()) {
      if ((m.fromId == caller and m.toId == userId) or (m.fromId == userId and m.toId == caller)) {
        filtered.add(m);
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

  public func getConversations(
    messages : List.List<MessageTypes.Message>,
    profiles : Map.Map<Principal, ProfileTypes.UserProfile>,
    caller : Principal,
  ) : [MessageTypes.Conversation] {
    let seen = Map.empty<Principal, MessageTypes.Message>();
    for (m in messages.values()) {
      let other = if (m.fromId == caller) m.toId else if (m.toId == caller) m.fromId else m.fromId;
      if (m.fromId == caller or m.toId == caller) {
        switch (seen.get(other)) {
          case null { seen.add(other, m) };
          case (?prev) {
            if (m.createdAt > prev.createdAt) seen.add(other, m);
          };
        };
      };
    };
    let result = List.empty<MessageTypes.Conversation>();
    for ((participantId, lastMsg) in seen.entries()) {
      let unread = messages.toArray().size() - messages.filter(func(m) { m.fromId == participantId and m.toId == caller and m.status == #read }).toArray().size();
      ignore unread; // simplified
      result.add({
        participantId;
        lastMessage = ?lastMsg.content;
        lastMessageAt = lastMsg.createdAt;
        unreadCount = 0;
      });
    };
    result.toArray();
  };

  public func markAsRead(
    messages : List.List<MessageTypes.Message>,
    caller : Principal,
    userId : Principal,
  ) : () {
    messages.mapInPlace(func(m) {
      if (m.fromId == userId and m.toId == caller and m.status != #read) {
        { m with status = #read };
      } else m;
    });
  };

  public func reactToMessage(
    messages : List.List<MessageTypes.Message>,
    caller : Principal,
    messageId : Text,
    emoji : Text,
  ) : () {
    messages.mapInPlace(func(m) {
      if (m.id == messageId and (m.fromId == caller or m.toId == caller)) {
        { m with emojiReaction = ?emoji };
      } else m;
    });
  };

  public func updateChatSettings(
    chatSettings : Map.Map<Text, MessageTypes.ChatSettings>,
    caller : Principal,
    userId : Principal,
    settings : MessageTypes.ChatSettings,
  ) : () {
    let key = chatKey(caller, userId);
    chatSettings.add(key, settings);
  };

  public func getChatSettings(
    chatSettings : Map.Map<Text, MessageTypes.ChatSettings>,
    caller : Principal,
    userId : Principal,
  ) : MessageTypes.ChatSettings {
    let key = chatKey(caller, userId);
    switch (chatSettings.get(key)) {
      case (?s) s;
      case null {
        {
          wallpaper = null;
          bubbleColorSent = null;
          bubbleColorReceived = null;
          chatName = null;
          isMuted = false;
          muteUntil = null;
          disappearingMode = #off;
          isArchived = false;
        };
      };
    };
  };

  public func chatKey(a : Principal, b : Principal) : Text {
    let at = a.toText();
    let bt = b.toText();
    if (at < bt) { at # ":" # bt } else { bt # ":" # at };
  };
};
