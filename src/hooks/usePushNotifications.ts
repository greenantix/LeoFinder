
import { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import { useSubscribeNotifications, useTestNotification } from './useListings';

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

// Initialize Firebase (only if not already initialized)
let firebaseApp;
try {
  firebaseApp = initializeApp(firebaseConfig);
} catch (error) {
  console.log('Firebase already initialized or config error:', error);
}

export const usePushNotifications = () => {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isSupported, setIsSupported] = useState(false);
  const [fcmToken, setFcmToken] = useState<string | null>(null);
  
  // API mutations
  const subscribeNotificationsMutation = useSubscribeNotifications();
  const testNotificationMutation = useTestNotification();

  useEffect(() => {
    setIsSupported('Notification' in window && 'serviceWorker' in navigator);
    if (isSupported) {
      setPermission(Notification.permission);
      
      // Register service worker for Firebase messaging
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/firebase-messaging-sw.js')
          .then((registration) => {
            console.log('Service Worker registered:', registration);
          })
          .catch((error) => {
            console.error('Service Worker registration failed:', error);
          });
      }
    }
  }, [isSupported]);

  const requestPermission = async () => {
    if (!isSupported || !firebaseApp) {
      console.log('Push notifications not supported or Firebase not configured');
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      setPermission(permission);

      if (permission === 'granted') {
        // Get FCM token and subscribe to backend
        const messaging = getMessaging(firebaseApp);
        const token = await getToken(messaging, {
          vapidKey: 'BJaXshTugr4LM-2ilLaX_sHukqL5JSbgDWNjU7uiMDtJudHruEA45owUyuK4bRpNgxsgIcLgXFSHU-etOPtvHQI'
        });

        if (token) {
          setFcmToken(token);
          console.log('FCM Token:', token);

          // Subscribe to notifications via backend
          try {
            await subscribeNotificationsMutation.mutateAsync({
              token,
              topic: 'high_score_listings'
            });
            console.log('Successfully subscribed to notifications');
          } catch (error) {
            console.error('Failed to subscribe to backend notifications:', error);
          }

          // Listen for foreground messages
          onMessage(messaging, (payload) => {
            console.log('Foreground message received:', payload);
            
            // Show notification manually when app is in foreground
            if (payload.notification) {
              new Notification(payload.notification.title || 'LEO Alert', {
                body: payload.notification.body,
                icon: '/icon-192x192.png',
                image: payload.notification.image,
                data: payload.data,
                tag: 'leo-foreground-notification'
              });
            }
          });
        }
      }

      return permission === 'granted';
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  };

  const sendNotification = (title: string, options?: NotificationOptions) => {
    if (permission === 'granted' && isSupported) {
      new Notification(title, {
        icon: '/icon-192x192.png',
        badge: '/badge-72x72.png',
        ...options
      });
    }
  };

  const sendNewListingNotification = (address: string, matchScore: number) => {
    sendNotification(
      `🏠 LEO Found a Match! (${matchScore}%)`,
      {
        body: `Check out this property: ${address}`,
        tag: 'new-listing',
        requireInteraction: true,
        actions: [
          { action: 'view', title: 'View Property' },
          { action: 'dismiss', title: 'Dismiss' }
        ]
      }
    );
  };

  const sendTestNotification = async (listingId?: string) => {
    try {
      await testNotificationMutation.mutateAsync({ listingId });
      console.log('Test notification sent via backend');
    } catch (error) {
      console.error('Failed to send test notification:', error);
      // Fallback to local notification
      sendNotification(
        '🧪 LEO Test Alert',
        {
          body: 'This is a test notification from LEO',
          tag: 'test-notification'
        }
      );
    }
  };

  return {
    permission,
    isSupported,
    fcmToken,
    requestPermission,
    sendNotification,
    sendNewListingNotification,
    sendTestNotification
  };
};
