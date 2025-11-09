# SAB MARKET - Setup Guide

Complete setup instructions for the SAB MARKET e-commerce mobile application.

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Firebase Setup](#firebase-setup)
3. [Environment Variables](#environment-variables)
4. [Push Notifications (FCM)](#push-notifications-fcm)
5. [Phone OTP Authentication](#phone-otp-authentication)
6. [Over-the-Air (OTA) Updates](#over-the-air-ota-updates)
7. [Running the App](#running-the-app)
8. [Building for Production](#building-for-production)

---

## Prerequisites

- Node.js 18+ installed
- Bun package manager
- Expo CLI
- iOS Simulator (Mac only) or Android Emulator
- Physical devices for testing (recommended)

---

## Firebase Setup

### 1. Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project"
3. Enter project name: `sab-market` (or your preferred name)
4. Enable Google Analytics (optional)
5. Click "Create project"

### 2. Register Your Apps

#### iOS App
1. In Firebase Console, click the iOS icon
2. Enter iOS bundle ID: `com.sabmarket.app` (or your bundle ID from app.json)
3. Download `GoogleService-Info.plist`
4. **Note:** For Expo Go, this file is not directly used. Configuration is done via environment variables.

#### Android App
1. Click the Android icon
2. Enter Android package name: `com.sabmarket.app` (same as iOS)
3. Download `google-services.json`
4. **Note:** For Expo Go, this file is not directly used. Configuration is done via environment variables.

### 3. Enable Authentication Methods

1. In Firebase Console, go to **Authentication** → **Sign-in method**
2. Enable the following providers:

#### Email/Password
- Click "Email/Password"
- Enable both "Email/Password" and "Email link (passwordless sign-in)"
- Click "Save"

#### Google Sign-In
- Click "Google"
- Enable it
- Set support email
- Click "Save"

#### Apple Sign-In (iOS only)
- Click "Apple"
- Enable it
- Configure Apple Service ID (requires Apple Developer account)
- Click "Save"

#### Phone Authentication
- Click "Phone"
- Enable it
- Add your domain to authorized domains
- **Important:** Phone auth requires Firebase Auth with React Native Firebase package for full functionality
- Current implementation shows placeholder - requires additional setup

### 4. Configure Firestore Database

1. Go to **Firestore Database**
2. Click "Create database"
3. Choose "Start in test mode" (for development)
4. Select a location closest to your users
5. Click "Enable"

**Production Rules:** Update security rules before going live:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    match /products/{productId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    match /orders/{orderId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
    }
  }
}
```

---

## Environment Variables

Create a `.env` file in the project root with your Firebase configuration:

```env
# Firebase Configuration
EXPO_PUBLIC_FIREBASE_API_KEY=your_api_key_here
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
EXPO_PUBLIC_FIREBASE_APP_ID=your_app_id

# Optional: Google Sign-In (for native mobile)
EXPO_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com

# Optional: Apple Sign-In Service ID
EXPO_PUBLIC_APPLE_SERVICE_ID=com.sabmarket.signin
```

### Finding Firebase Configuration Values:

1. Go to Firebase Console → Project Settings (gear icon)
2. Scroll down to "Your apps"
3. Click the web app icon (`</>`)
4. Copy the configuration values to your `.env` file

---

## Push Notifications (FCM)

Firebase Cloud Messaging is already configured in the app. Follow these steps to enable it:

### 1. Setup Expo Push Notifications

1. Install EAS CLI: `npm install -g eas-cli`
2. Login to Expo: `eas login`
3. Configure project:
   ```bash
   eas build:configure
   ```

### 2. Enable FCM in Firebase

1. Go to Firebase Console → Project Settings → Cloud Messaging
2. Under "Cloud Messaging API (Legacy)", note your Server Key
3. Upload APNs certificates for iOS (requires Apple Developer account)

### 3. Configure in App

The notification service is already set up in `constants/notifications.ts`. The app will:
- Request notification permissions on first launch
- Register device for push notifications
- Handle incoming notifications
- Display notifications with proper styling

### 4. Send Test Notifications

Use the `schedulePushNotification()` function from `constants/notifications.ts`:

```typescript
import { schedulePushNotification } from '@/constants/notifications';

// Schedule a local notification
await schedulePushNotification(
  'New Order!',
  'Your order #12345 has been confirmed',
  { orderId: '12345' }
);
```

### 5. Server-Side Integration

To send notifications from your backend:

```javascript
// Using Expo Push Notifications API
const message = {
  to: 'ExponentPushToken[xxxxxx]',
  sound: 'default',
  title: 'Order Update',
  body: 'Your order has been shipped!',
  data: { orderId: '12345' },
};

await fetch('https://exp.host/--/api/v2/push/send', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(message),
});
```

---

## Phone OTP Authentication

### Current Status
Phone OTP authentication is prepared but requires additional native setup.

### Implementation Options:

#### Option 1: Use Email/Google/Apple (Recommended for Expo Go)
The app currently supports:
- Email/Password authentication ✅
- Google Sign-In ✅  
- Apple Sign-In (iOS) ✅

#### Option 2: Full Phone Auth Setup (Requires Custom Dev Client)

To implement full phone OTP:

1. **Install React Native Firebase:**
   ```bash
   expo install @react-native-firebase/app @react-native-firebase/auth
   ```

2. **Create Custom Development Build:**
   ```bash
   eas build --profile development --platform all
   ```

3. **Configure Native Files:**
   - iOS: Add `GoogleService-Info.plist` to project
   - Android: Add `google-services.json` to project

4. **Update Auth Context:**
   Replace the phone auth placeholder in `contexts/AuthContext.tsx` with:

   ```typescript
   import auth from '@react-native-firebase/auth';

   const sendPhoneVerification = async (phoneNumber: string) => {
     try {
       const confirmation = await auth().signInWithPhoneNumber(phoneNumber);
       setState(prev => ({ ...prev, phoneVerificationId: confirmation.verificationId }));
       return { success: true };
     } catch (error) {
       return { success: false, error: error.message };
     }
   };
   ```

5. **Test Phone Auth:**
   - Add test phone numbers in Firebase Console
   - Test on physical devices (SMS doesn't work in simulators)

---

## Over-the-Air (OTA) Updates

OTA updates allow you to push JavaScript/TypeScript changes without app store review.

### 1. Configure EAS Update

1. Create `eas.json` in project root:

```json
{
  "cli": {
    "version": ">= 5.0.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal",
      "channel": "preview"
    },
    "production": {
      "channel": "production"
    }
  },
  "submit": {
    "production": {}
  }
}
```

2. Update `app.json` to add updates configuration:

```json
{
  "expo": {
    "updates": {
      "enabled": true,
      "fallbackToCacheTimeout": 30000,
      "url": "https://u.expo.dev/[your-project-id]"
    },
    "runtimeVersion": {
      "policy": "appVersion"
    }
  }
}
```

### 2. Publish Updates

```bash
# Publish to preview channel
eas update --branch preview --message "Bug fixes"

# Publish to production channel
eas update --branch production --message "New features"
```

### 3. View Updates

```bash
# List all updates
eas update:list

# View specific update
eas update:view [update-id]

# Roll back to previous update
eas update:republish --group [group-id]
```

### 4. Update Strategy

**Best Practices:**
- Test updates on preview channel first
- Use semantic versioning for messages
- Schedule updates during low-traffic periods
- Keep update messages clear and concise
- Monitor crash reports after updates

**Update Behavior:**
- Updates download in background
- Applied on next app restart
- Critical updates can force restart
- Fallback to cached version if update fails

---

## Running the App

### Development Mode

```bash
# Start Expo development server
bun run start

# Run on iOS
bun run start:ios

# Run on Android
bun run start:android

# Run on Web
bun run start:web
```

### Testing Features

1. **Authentication:**
   - Try email sign-up/login
   - Test Google Sign-In
   - Test Apple Sign-In (iOS only)

2. **Shopping Flow:**
   - Browse products
   - Add items to cart
   - Complete checkout
   - Track order

3. **Notifications:**
   - Grant notification permissions
   - Test local notifications
   - Verify notification display

4. **Multi-language:**
   - Switch between English and Arabic
   - Verify RTL layout in Arabic
   - Test currency conversion (USD ↔ LBP)

---

## Building for Production

### 1. Update App Configuration

In `app.json`:
- Set correct `bundleIdentifier` and `package`
- Update `version` and `buildNumber`
- Configure app icon and splash screen
- Set up app store information

### 2. Build for iOS

```bash
# Create production build
eas build --platform ios --profile production

# Submit to App Store
eas submit --platform ios
```

**Requirements:**
- Apple Developer Account ($99/year)
- App Store Connect setup
- Privacy policy URL
- App screenshots
- App description

### 3. Build for Android

```bash
# Create production build
eas build --platform android --profile production

# Submit to Play Store
eas submit --platform android
```

**Requirements:**
- Google Play Developer Account ($25 one-time)
- Play Console setup
- Privacy policy URL
- App screenshots  
- Feature graphic

### 4. App Store Optimization

**Required Assets:**
- App icon (1024x1024 PNG)
- Splash screen
- Screenshots (various sizes)
- Privacy policy
- Terms of service

**Metadata:**
- App name and subtitle
- Description and keywords
- Category selection
- Age rating
- Support URL

---

## Troubleshooting

### Firebase Connection Issues
- Verify all environment variables are correct
- Check Firebase project is active
- Ensure authentication methods are enabled
- Review Firebase Console for errors

### Push Notifications Not Working
- Use physical device (simulators have limitations)
- Check notification permissions are granted
- Verify Expo project ID is configured
- Test with local notifications first

### Authentication Errors
- Check Firebase Authentication is enabled
- Verify API keys are correct
- Test with test accounts first
- Review error messages in console

### Build Failures
- Clear cache: `expo start -c`
- Delete `node_modules` and reinstall
- Check `eas.json` configuration
- Review build logs in EAS dashboard

---

## Support & Resources

- **Expo Documentation:** https://docs.expo.dev
- **Firebase Documentation:** https://firebase.google.com/docs
- **React Native:** https://reactnative.dev
- **Community:** Expo Discord, Stack Overflow

---

## Next Steps

1. ✅ Complete Firebase setup
2. ✅ Configure environment variables
3. ✅ Test authentication methods
4. ✅ Enable push notifications
5. ⏳ Set up OTA updates
6. ⏳ Configure app store listings
7. ⏳ Submit for review

---

**Version:** 1.0.0  
**Last Updated:** 2025

For technical support or questions, please contact the development team.
