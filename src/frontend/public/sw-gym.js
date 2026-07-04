// sw-gym.js — DhabaFit Gym Notification Service Worker
// Handles push messages from the main thread and shows gym reminder notifications.

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

// Listen for messages from the main thread to show scheduled notifications
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SHOW_GYM_NOTIFICATION") {
    const { title, body } = event.data;
    event.waitUntil(
      self.registration.showNotification(title || "DhabaFit — Gym Time! 🏋️", {
        body: body || "Gym time! 🕖 7:30 ho gaya — DhabaFit yaad dila raha hai, gym mat bhulo bhai!",
        icon: "/favicon.svg",
        badge: "/favicon.svg",
        tag: "gym-reminder",
        renotify: false,
        requireInteraction: false,
        vibrate: [200, 100, 200],
        data: { url: "/gym" },
        actions: [
          { action: "open", title: "Gym kholo 💪" },
          { action: "dismiss", title: "Baad mein" },
        ],
      })
    );
  }
});

// Handle notification click — open the gym page
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  if (event.action === "dismiss") return;

  event.waitUntil(
    self.clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        // If app is already open, focus it and navigate
        for (const client of clientList) {
          if ("focus" in client) {
            client.focus();
            if ("navigate" in client) {
              client.navigate("/gym");
            }
            return;
          }
        }
        // Otherwise open a new window
        if (self.clients.openWindow) {
          return self.clients.openWindow("/gym");
        }
      })
  );
});
