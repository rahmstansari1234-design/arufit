import Debug "mo:core/Debug";
import List "mo:core/List";
import Map "mo:core/Map";
import Common "../types/common";
import NotifTypes "../types/notification";
import ProfileTypes "../types/profile";

module {
  public func getNotifications(
    notifications : List.List<NotifTypes.Notification>,
    profiles : Map.Map<Principal, ProfileTypes.UserProfile>,
    caller : Principal,
    cursor : ?Text,
  ) : Common.Page<NotifTypes.NotificationView> {
    let filtered = List.empty<NotifTypes.NotificationView>();
    for (n in notifications.values()) {
      if (n.recipientId == caller) {
        let (actorUsername, actorAvatarUrl) = switch (profiles.get(n.actorId)) {
          case null { ("", null) };
          case (?p) { (p.username, p.avatarUrl) };
        };
        filtered.add({ n with actorUsername; actorAvatarUrl });
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

  public func markNotificationRead(
    notifications : List.List<NotifTypes.Notification>,
    caller : Principal,
    id : Text,
  ) : () {
    notifications.mapInPlace(func(n) {
      if (n.id == id and n.recipientId == caller) { { n with isRead = true } } else n;
    });
  };

  public func markAllNotificationsRead(
    notifications : List.List<NotifTypes.Notification>,
    caller : Principal,
  ) : () {
    notifications.mapInPlace(func(n) {
      if (n.recipientId == caller) { { n with isRead = true } } else n;
    });
  };

  public func getUnreadCount(
    notifications : List.List<NotifTypes.Notification>,
    caller : Principal,
  ) : Nat {
    var count = 0;
    for (n in notifications.values()) {
      if (n.recipientId == caller and not n.isRead) count += 1;
    };
    count;
  };

  public func createNotification(
    notifications : List.List<NotifTypes.Notification>,
    idCounter : { var value : Nat },
    recipientId : Principal,
    actorId : Principal,
    notifType : NotifTypes.NotificationType,
    referenceId : ?Text,
    now : Common.Timestamp,
  ) : () {
    if (recipientId == actorId) return;
    idCounter.value += 1;
    notifications.add({
      id = Nat.toText(idCounter.value);
      recipientId;
      actorId;
      notifType;
      referenceId;
      isRead = false;
      createdAt = now;
    });
  };
};
