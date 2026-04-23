// Service Worker Version: 1.0.4
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

self.addEventListener('push', function(event) {
  if (event.data) {
    try {
      const data = event.data.json();
      const options = {
        body: data.body,
        icon: data.icon || '/icon.svg',
        badge: '/favicon-192.png',
        vibrate: [100, 50, 100],
        requireInteraction: true,
        data: {
          url: data.url || '/'
        },
        actions: [
          { action: 'open', title: 'Open Hub' }
        ]
      };

      event.waitUntil(
        self.registration.showNotification(data.title, options)
      );
    } catch (e) {
      event.waitUntil(
        self.registration.showNotification('Hub Notification', {
          body: event.data.text(),
          icon: '/icon.svg'
        })
      );
    }
  }
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then(windowClients => {
      for (var i = 0; i < windowClients.length; i++) {
        var client = windowClients[i];
        if (client.url === event.notification.data.url && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(event.notification.data.url);
      }
    })
  );
});
