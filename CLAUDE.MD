Fantastic work on the LeoFinder backend. It is comprehensive and meets all the specified requirements.

The next and final phase of this project is to refactor the React frontend. We will completely remove all mock data and localStorage dependencies, and integrate it with the new production-ready backend API. Your task is to bring the application to life with real data and functionality.

Please follow these detailed steps for the frontend refactoring.

Part 1: API Layer and Environment Setup
First, let's establish a clean and robust way for the frontend to communicate with the backend.

Environment Configuration:

In the root of the React project (the same level as index.html), create a .env file.

Add the following environment variable to specify the backend's URL. This allows for easy configuration between development and production.

VITE_API_BASE_URL=http://localhost:8000/api

API Client Service:

Create a new directory src/api.

Inside src/api, create a file named client.ts. This will be our centralized axios instance for all API calls.

Install axios: npm install axios.

Configure the client like this:

// src/api/client.ts
import axios from 'axios';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default apiClient;

Delete Mock/Obsolete Files:

Delete the following files, as their logic is now handled by the backend:

src/utils/mockData.ts

src/utils/aiProcessor.ts

src/utils/outreachLogger.ts

Part 2: Refactoring Data Fetching with React Query
Now, replace the static mock data flow with real-time data fetching from the API using react-query.

Create a Listings Hook:

Create a new file src/hooks/useListings.ts.

This custom hook will encapsulate all data-fetching logic for listings.

// src/hooks/useListings.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../api/client';
import { Listing } from '../types/listing';

// Fetch all listings
export const useGetListings = () => {
  return useQuery<Listing[], Error>({
    queryKey: ['listings'],
    queryFn: async () => {
      const { data } = await apiClient.get('/listings');
      return data;
    },
  });
};

// Generate an email for a specific listing
export const useGenerateEmail = () => {
  return useMutation<string, Error, string>({
    mutationFn: async (listingId: string) => {
      const { data } = await apiClient.post(`/generate-email`, { listingId });
      return data.emailDraft;
    }
  });
};

// Log an outreach attempt
export const useLogOutreach = () => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, { listingId: string; method: string; content: string }>({
    mutationFn: (outreachData) => apiClient.post('/log-outreach', outreachData),
    onSuccess: () => {
      // Optionally refetch listings to update status, etc.
      queryClient.invalidateQueries({ queryKey: ['listings'] });
    },
  });
};

Update the Main Page (src/pages/Index.tsx):

Remove all useState and useEffect logic related to generateMockListings.

Use the new useGetListings hook to fetch data.

Display loading and error states appropriately.

// Inside src/pages/Index.tsx

import { useGetListings } from '../hooks/useListings';
// ... other imports

const Index = () => {
  const { data: listings, isLoading, isError } = useGetListings();

  // ... other state for modals etc.

  if (isLoading) {
    return <div>Loading LEO's opportunities...</div>; // Replace with a nice Skeleton loader
  }

  if (isError) {
    return <div>Error fetching opportunities. The backend might not be running.</div>;
  }

  // ... rest of the component logic using the `listings` data
}

Part 3: Finalizing PWA and Push Notifications
This completes the last unchecked item on your list.

Create the Firebase Service Worker:

In the public directory, create a new file named firebase-messaging-sw.js. This is crucial for receiving notifications when the app is in the background.

Add the following content to initialize Firebase messaging:

// public/firebase-messaging-sw.js
importScripts("https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js");

// Use your Firebase config from the Firebase console
const firebaseConfig = {
  apiKey: "...",
  authDomain: "...",
  projectId: "...",
  storageBucket: "...",
  messagingSenderId: "...",
  appId: "..."
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/favicon.ico'
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

Refactor usePushNotifications.ts:

Update this hook to handle token generation and subscription with your backend.

// src/hooks/usePushNotifications.ts
import { useState, useEffect } from 'react';
import { getMessaging, getToken } from "firebase/messaging";
import apiClient from '../api/client';
// You'll need to set up your firebase app instance and pass it here
// import { firebaseApp } from '../firebase-config';

export const usePushNotifications = () => {
  // ... existing state ...

  const subscribeToNotifications = async () => {
    try {
      // This assumes firebaseApp is initialized elsewhere
      const messaging = getMessaging(firebaseApp); 
      const permission = await Notification.requestPermission();
      setPermission(permission);

      if (permission === 'granted') {
        const currentToken = await getToken(messaging, { vapidKey: 'YOUR_VAPID_KEY_FROM_FIREBASE' });
        if (currentToken) {
          // Send the token to your backend to save it
          await apiClient.post('/notifications/subscribe', { token: currentToken });
          console.log('Notification token sent to server.');
        } else {
          console.log('No registration token available. Request permission to generate one.');
        }
      }
    } catch (error) {
      console.error('An error occurred while retrieving token. ', error);
    }
  };

  // ... return subscribeToNotifications and other values ...
};

Ensure you call subscribeToNotifications from your UI, for example, in the handleNotificationSetup function in Index.tsx.

Summary of Final Frontend State
Once you complete these steps, the frontend will be a fully-fledged client for your backend:

Data Flow: React Query -> Axios Client -> Backend API -> Database.

State Management: React Query will handle all server state (listings, etc.), while useState will manage transient UI state (e.g., which modal is open).

Real-Time Alerts: The PWA will be capable of receiving and displaying push notifications sent from the server.

No Mocks: The application will be 100% powered by real data.

Proceed with this frontend refactoring to complete the LeoFinder application.
