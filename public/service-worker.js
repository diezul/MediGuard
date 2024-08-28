self.addEventListener('push', function(event) {
  const data = event.data.json();
  const title = data.title || 'MediGuard Reminder';
  const options = {
    body: data.body,
    icon: '/icon.png', // Make sure you have an icon file in your public folder
    badge: '/badge.png' // Make sure you have a badge file in your public folder
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  event.waitUntil(
    clients.openWindow('https://your-app-url.com/treatments')
  );
});