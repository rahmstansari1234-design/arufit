import Map "mo:core/Map";
import List "mo:core/List";
import Time "mo:core/Time";
import Common "../types/common";
import MessageTypes "../types/message";
import ProfileTypes "../types/profile";
import MessagesLib "../lib/messages";

mixin (
  messages : List.List<MessageTypes.Message>,
  chatSettings : Map.Map<Text, MessageTypes.ChatSettings>,
  profiles : Map.Map<Principal, ProfileTypes.UserProfile>,
  messageIdCounter : { var value : Nat },
) {
  /// Send a direct message to another user
  public shared ({ caller }) func sendMessage(
    toId : Principal,
    content : Text,
    mediaUrl : ?Text,
    replyToId : ?Text,
  ) : async MessageTypes.MessageView {
    let input : MessageTypes.SendMessageInput = { content; mediaUrl; replyToId };
    MessagesLib.sendMessage(messages, chatSettings, messageIdCounter, caller, toId, input, Time.now());
  };

  /// Get paginated messages between caller and another user
  public shared query ({ caller }) func getMessages(
    userId : Principal,
    cursor : ?Text,
  ) : async Common.Page<MessageTypes.MessageView> {
    MessagesLib.getMessages(messages, caller, userId, cursor);
  };

  /// Get all conversations for the caller
  public shared query ({ caller }) func getConversations() : async [MessageTypes.Conversation] {
    MessagesLib.getConversations(messages, profiles, caller);
  };

  /// Mark all messages from a user as read
  public shared ({ caller }) func markAsRead(
    userId : Principal
  ) : async () {
    MessagesLib.markAsRead(messages, caller, userId);
  };

  /// React to a message with an emoji
  public shared ({ caller }) func reactToMessage(
    messageId : Text,
    emoji : Text,
  ) : async () {
    MessagesLib.reactToMessage(messages, caller, messageId, emoji);
  };

  /// Update per-conversation chat settings
  public shared ({ caller }) func updateChatSettings(
    userId : Principal,
    settings : MessageTypes.ChatSettings,
  ) : async () {
    MessagesLib.updateChatSettings(chatSettings, caller, userId, settings);
  };

  /// Get per-conversation chat settings
  public shared query ({ caller }) func getChatSettings(
    userId : Principal
  ) : async MessageTypes.ChatSettings {
    MessagesLib.getChatSettings(chatSettings, caller, userId);
  };
};
