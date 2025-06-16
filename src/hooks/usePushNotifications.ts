
import { useState, useEffect } from 'react';

export const usePushNotifications = () => {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    setIsSupported('Notification' in window && 'serviceWorker' in navigator);
    if (isSupported) {
      setPermission(Notification.permission);
    }
  }, [isSupported]);

  const requestPermission = async () => {
    if (!isSupported) {
      console.log('Push notifications not supported');
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      setPermission(permission);
      return permission === 'granted';
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  };

  const sendNotification = (title: string, options?: NotificationOptions) => {
    if (permission === 'granted' && isSupported) {
      new Notification(title, {
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        ...options
      });
    }
  };

  const sendNewListingNotification = (address: string, matchScore: number) => {
    sendNotification(
      `🏠 New Match Found! (${matchScore}%)`,
      {
        body: `Check out this property: ${address}`,
        tag: 'new-listing',
        requireInteraction: true
      }
    );
  };

  return {
    permission,
    isSupported,
    requestPermission,
    sendNotification,
    sendNewListingNotification
  };
};
