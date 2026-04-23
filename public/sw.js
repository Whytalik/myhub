self.addEventListener('push', function(event) {
  console.log('[Service Worker] Push Received.');
  
  if (event.data) {
    try {
      const data = event.data.json();
      console.log('[Service Worker] Push Data:', data);
      
      const options = {
        body: data.body,
        icon: data.icon || '/icon.svg',
        badge: '/favicon-192.png',
        vibrate: [100, 50, 100],
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
      console.error('[Service Worker] Error parsing push data:', e);
      // Fallback notification if JSON parsing fails
      event.waitUntil(
        self.registration.showNotification('Hub Notification', {
          body: event.data.text(),
          icon: '/icon.svg'
        })
      );
    }
  } else {
    console.warn('[Service Worker] Push event but no data.');
  }
});

self.addEventListener('notificationclick', function(event) {
  console.log('[Service Worker] Notification click Received.');
  event.notification.close();

  event.waitUntil(
    clients.matchAll({ type: 'window' }).then(windowClients => {
      // Check if there is already a window open and focus it
      for (var i = 0; i < windowClients.length; i++) {
        var client = windowClients[i];
        if (client.url === event.notification.data.url && 'focus' in client) {
          return client.focus();
        }
      }
      // If no window is open, open a new one
      if (clients.openWindow) {
        return clients.openWindow(event.notification.data.url);
      }
    })
  );
});
