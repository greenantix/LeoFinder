# Firebase Setup Guide for LeoFinder

Your Firebase project `leofinder-cc420` is configured but needs a VAPID key for web push notifications.

## ✅ Already Configured

- ✅ **Project Created**: `leofinder-cc420`
- ✅ **Service Account**: Created and configured in backend
- ✅ **Web App Config**: Added to frontend and service worker
- ✅ **Admin SDK**: Backend can send notifications

## 🔑 Missing: VAPID Key Setup

To complete push notifications, you need to generate a VAPID key:

### 1. Get VAPID Key from Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com/project/leofinder-cc420)
2. Click on **Project Settings** (gear icon)
3. Go to **Cloud Messaging** tab
4. Scroll down to **Web configuration**
5. Click **Generate key pair** (if no key exists)
6. Copy the **Key pair** value

### 2. Add VAPID Key to Frontend

Update the VAPID key in `src/hooks/usePushNotifications.ts`:

```typescript
const token = await getToken(messaging, {
  vapidKey: 'YOUR_ACTUAL_VAPID_KEY_HERE' // Replace with the key from step 1
});
```

### 3. Test Push Notifications

1. Start the backend: `cd server && npm run dev`
2. Start the frontend: `npm run dev`
3. Click "Enable LEO Alerts" in the app
4. Use the "Send Test" button in Developer Tools
5. You should receive a push notification

## 🔧 Alternative: Generate VAPID Key Programmatically

If you prefer to generate the key programmatically:

```bash
# Install web-push globally
npm install -g web-push

# Generate VAPID keys
web-push generate-vapid-keys
```

This will output:
```
Public Key: [VAPID_PUBLIC_KEY]
Private Key: [VAPID_PRIVATE_KEY]
```

Use the **Public Key** as your VAPID key in the frontend.

## 🚀 Production Deployment Environment Variables

Once you have the VAPID key, here are all the environment variables needed:

### Backend (.env or hosting platform)
```env
# Database
DATABASE_URL=postgresql://user:pass@host:5432/leofinder

# APIs
ANTHROPIC_API_KEY=sk-ant-your-key-here
FORECLOSURE_USER=perschek@gmail.com
FORECLOSURE_PASS=LeeBald!@34

# Firebase (already configured)
FIREBASE_PROJECT_ID=leofinder-cc420
FIREBASE_PRIVATE_KEY_ID=c23699059a47f813a220f2d5c42d88eac020dd60
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n[...private key...]"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-fbsvc@leofinder-cc420.iam.gserviceaccount.com
FIREBASE_CLIENT_ID=109230585704050842600

# CORS
CORS_ORIGIN=https://your-frontend-domain.com
```

### Frontend (.env or hosting platform)
```env
VITE_API_BASE_URL=https://your-backend-domain.com/api
```

## 🧪 Testing Checklist

After adding the VAPID key:

- [ ] Backend starts without Firebase errors
- [ ] Frontend connects to Firebase successfully
- [ ] "Enable LEO Alerts" button works
- [ ] Test notification button sends notifications
- [ ] Background notifications work when app is closed
- [ ] Notification clicks open the app correctly

## 🔍 Troubleshooting

### Common Issues

1. **"Failed to register service worker"**
   - Check that `firebase-messaging-sw.js` is in the `public` folder
   - Ensure HTTPS (or localhost for development)

2. **"No registration token available"**
   - Add the VAPID key to `usePushNotifications.ts`
   - Check browser console for detailed errors

3. **"Firebase Admin initialization failed"**
   - Verify all environment variables are set correctly
   - Check that private key includes `\n` line breaks

4. **Backend can't send notifications**
   - Ensure service account has Cloud Messaging permissions
   - Check Firebase project settings

### Debug Steps

1. **Check Firebase Console**: Look for any errors or warnings
2. **Browser Console**: Check for JavaScript errors
3. **Network Tab**: Verify API calls are working
4. **Backend Logs**: Check for Firebase initialization errors

## 🎯 Next Steps

Once VAPID key is configured:

1. ✅ **Complete Firebase Setup** - Add VAPID key
2. 🚀 **Deploy to Production** - Use recommended hosting platforms
3. 🧪 **End-to-End Testing** - Verify all features work live
4. 📊 **Monitor Performance** - Set up analytics and monitoring

Your LeoFinder application will then have fully functional real-time push notifications powered by Firebase Cloud Messaging!