// Import Firebase scripts
importScripts("https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js");

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBssnS6P9UpShTnU2K2pTiudN854ZrQgX8",
  authDomain: "leofinder-cc420.firebaseapp.com",
  projectId: "leofinder-cc420",
  storageBucket: "leofinder-cc420.firebasestorage.app",
  messagingSenderId: "1070808789589",
  appId: "1:1070808789589:web:ba821c7a04241aea8fdadc",
  measurementId: "G-H5ES7S13YY"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Initialize Firebase Cloud Messaging and get a reference to the service
const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message:', payload);
  
  const notificationTitle = payload.notification?.title || 'LEO Found Something!';
  const notificationOptions = {
    body: payload.notification?.body || 'New opportunity detected',
    icon: '/icon-192x192.png',
    badge: '/badge-72x72.png',
    image: payload.notification?.image,
    data: payload.data,
    actions: [
      {
        action: 'view',
        title: 'View Property',
        icon: '/icon-192x192.png'
      },
      {
        action: 'dismiss',
        title: 'Dismiss',
        icon: '/icon-192x192.png'
      }
    ],
    tag: payload.data?.listingId || 'leo-notification',
    requireInteraction: true,
    vibrate: [200, 100, 200]
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('[firebase-messaging-sw.js] Notification click received.');

  event.notification.close();

  if (event.action === 'view') {
    // Open the app and navigate to the specific listing
    const listingId = event.notification.data?.listingId;
    const url = listingId ? `/?listing=${listingId}` : '/';
    
    event.waitUntil(
      clients.matchAll({ type: 'window' }).then((clientList) => {
        for (const client of clientList) {
          if (client.url === url && 'focus' in client) {
            return client.focus();
          }
        }
        if (clients.openWindow) {
          return clients.openWindow(url);
        }
      })
    );
  } else if (event.action === 'dismiss') {
    // Just close the notification (already handled above)
    console.log('Notification dismissed');
  } else {
    // Default action - open the app
    event.waitUntil(
      clients.matchAll({ type: 'window' }).then((clientList) => {
        for (const client of clientList) {
          if ('focus' in client) {
            return client.focus();
          }
        }
        if (clients.openWindow) {
          return clients.openWindow('/');
        }
      })
    );
  }
});

// Handle push events (fallback for when the app is closed)
self.addEventListener('push', (event) => {
  if (event.data) {
    console.log('[firebase-messaging-sw.js] Push event received:', event.data.text());
    
    try {
      const payload = event.data.json();
      const notificationTitle = payload.notification?.title || 'LEO Alert';
      const notificationOptions = {
        body: payload.notification?.body || 'New opportunity found!',
        icon: '/icon-192x192.png',
        badge: '/badge-72x72.png',
        data: payload.data || {},
        tag: 'leo-push-notification'
      };

      event.waitUntil(
        self.registration.showNotification(notificationTitle, notificationOptions)
      );
    } catch (error) {
      console.error('[firebase-messaging-sw.js] Error parsing push data:', error);
    }
  } else {
    console.log('[firebase-messaging-sw.js] Push event received but no data');
  }
});