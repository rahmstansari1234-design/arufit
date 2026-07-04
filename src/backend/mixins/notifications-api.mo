import Map "mo:core/Map";
import List "mo:core/List";
import Common "../types/common";
import NotifTypes "../types/notification";
import ProfileTypes "../types/profile";
import NotifsLib "../lib/notifications";

mixin (
  notifications : List.List<NotifTypes.Notification>,
  profiles : Map.Map<Principal, ProfileTypes.UserProfile>,
) {
  /// Get paginated notifications for the caller
  public shared query ({ caller }) func getNotifications(
    cursor : ?Text
  ) : async Common.Page<NotifTypes.NotificationView> {
    NotifsLib.getNotifications(notifications, profiles, caller, cursor);
  };

  /// Mark a single notification as read
  public shared ({ caller }) func markNotificationRead(
    id : Text
  ) : async () {
    NotifsLib.markNotificationRead(notifications, caller, id);
  };

  /// Mark all notifications as read
  public shared ({ caller }) func markAllNotificationsRead() : async () {
    NotifsLib.markAllNotificationsRead(notifications, caller);
  };

  /// Get count of unread notifications
  public shared query ({ caller }) func getUnreadCount() : async Nat {
    NotifsLib.getUnreadCount(notifications, caller);
  };
};
