# Google OAuth 400 Error - Official Fix Guide 🔐

## 📋 Problem Description

When attempting to sign in with Google, you receive:
```
Error 400: invalid_request
Custom URI scheme is not enabled for your Android client
```

## 🔍 Root Cause (According to Official Google Documentation)

From [Google Support Documentation](https://support.google.com/accounts/answer/12917337#400invalid):

> **"Error 400 invalid_request" means the app sent an invalid request. The app uses an authorization method that Google doesn't allow.**

> **Google has safe ways for you to sign in and share your Google Account data with third-party apps and services. To help protect your account, Google blocks apps that could put your account at risk.**

### Why Custom URI Schemes Are Blocked

Google has blocked **Custom URI Schemes** (like `sabstore://` or `exp+sab-store://`) for security reasons:

1. **App Impersonation Risk**: Malicious apps can impersonate your app
2. **Security Vulnerability**: Custom schemes don't provide the same security level as HTTPS
3. **OAuth 2.0 Best Practices**: Google enforces more secure authentication methods

---

## ✅ Available Solutions

### Solution 1: Use Expo Auth Proxy (Recommended for Development) 🎯

This is **the best solution for Expo Go environment**:

#### Steps:

1. **Add Redirect URI in Google Cloud Console**:
   - Open [Google Cloud Console](https://console.cloud.google.com/)
   - Go to **APIs & Services** → **Credentials**
   - Open your **Web OAuth Client** (NOT Android Client!)
   - Under **Authorized redirect URIs**, add:
   ```
   https://auth.expo.io/@alsultandeveloper/sab-store
   ```
   - Save changes
   - Wait **2-3 minutes** for changes to propagate

2. **Verify Correct Code** (already implemented):
   ```typescript
   // ✅ Current code is correct using expo-auth-session
   import * as Google from 'expo-auth-session/providers/google';
   
   const [googleRequest, googleResponse, googlePromptAsync] = 
     Google.useAuthRequest(googleConfig);
   ```

3. **Test the App**:
   ```bash
   npx expo start
   ```

#### How It Works
- `expo-auth-session` uses **Expo Auth Proxy** as an intermediary
- Proxy receives callback from Google via HTTPS
- Then safely redirects to your app
- **No need for Custom URI Schemes**

#### Advantages:
- ✅ Works with Expo Go directly
- ✅ Secure and approved by Google
- ✅ No native build required
- ✅ Fast for development

---

### Solution 2: Build Standalone App (For Production) 📱

If you want to use Google Sign-In Native SDK:

#### Steps:

1. **Build App Using EAS Build**:
   ```bash
   # Install EAS CLI
   npm install -g eas-cli
   
   # Login
   eas login
   
   # Build
   eas build --platform android --profile preview
   ```

2. **Install Native Module**:
   ```bash
   npx expo install @react-native-google-signin/google-signin
   ```

3. **Update app.json**:
   ```json
   {
     "expo": {
       "plugins": [
         [
           "@react-native-google-signin/google-signin",
           {
             "iosUrlScheme": "com.googleusercontent.apps.YOUR-IOS-CLIENT-ID"
           }
         ]
       ]
     }
   }
   ```

4. **Use GoogleSignin SDK**:
   ```typescript
   import { GoogleSignin } from '@react-native-google-signin/google-signin';
   
   GoogleSignin.configure({
     webClientId: GOOGLE_WEB_CLIENT_ID,
     offlineAccess: true,
   });
   
   const { idToken } = await GoogleSignin.signIn();
   ```

#### Advantages:
- ✅ Better user experience (Native UI)
- ✅ Faster performance
- ✅ No external browser needed

#### Disadvantages:
- ❌ Doesn't work with Expo Go
- ❌ Requires full build (time-consuming)
- ❌ More complex for development

---

## 🔧 Correct Google Cloud Console Settings

### What You Need to Configure:

#### 1. Web OAuth Client (Important! 🔴)
```
Client Type: Web application
Name: sab-store-web

Authorized JavaScript origins:
- https://auth.expo.io

Authorized redirect URIs:
- https://auth.expo.io/@alsultandeveloper/sab-store
- https://auth.expo.io
```

#### 2. Android OAuth Client (Optional for development)
```
Client Type: Android
Package name: app.rork.lebanonmultivendorecommerceplatform

SHA-1: 4D:83:51:93:8E:11:96:54:8A:86:47:5B:DA:2F:E4:AC:8E:29:2D:9C
SHA-256: F7:07:34:0B:72:75:4B:A0:FD:B7:91:DC:23:82:12:59:40:9F:26:42:2D:29:4C:D1:6B:4D:96:CE:FF:45:33:D5
```

#### 3. iOS OAuth Client (For future)
```
Client Type: iOS
Bundle ID: app.rork.lebanonmultivendorecommerceplatform
```

---

## 🚫 Common Mistakes

### ❌ Mistake 1: Adding Redirect URI in Android Client
```
Custom URI Scheme: sabstore://
❌ Wrong! Google doesn't allow Custom URI Schemes
```

### ✅ Correct: Add HTTPS Redirect in Web Client
```
Authorized redirect URIs:
✅ https://auth.expo.io/@alsultandeveloper/sab-store
```

---

### ❌ Mistake 2: Using @react-native-google-signin in Expo Go
```typescript
import { GoogleSignin } from '@react-native-google-signin/google-signin';
❌ Doesn't work! Requires native binary
```

### ✅ Correct: Use expo-auth-session
```typescript
import * as Google from 'expo-auth-session/providers/google';
✅ Works with Expo Go
```

---

## 📝 Configuration Checklist

- [ ] Deleted `@react-native-google-signin/google-signin`
- [ ] Code uses `expo-auth-session`
- [ ] Added `https://auth.expo.io/@alsultandeveloper/sab-store` in **Web OAuth Client**
- [ ] Saved changes in Google Cloud Console
- [ ] Waited 2-3 minutes for changes to propagate
- [ ] Restarted app: `npx expo start --clear`
- [ ] Tested Google Sign-In

---

## 🎯 Current Status

### ✅ What Has Been Fixed:
1. Removed `@react-native-google-signin/google-signin` (incompatible with Expo Go)
2. Using `expo-auth-session` for authentication
3. Cleaned code and removed all errors
4. Added proper handling for Google OAuth response

### ⏳ What You Need to Do:
1. **Open [Google Cloud Console](https://console.cloud.google.com/)**
2. **Go to Credentials → Web OAuth Client**
3. **Add Redirect URI**:
   ```
   https://auth.expo.io/@alsultandeveloper/sab-store
   ```
4. **Save and wait 2-3 minutes**
5. **Test sign-in**

---

## 🔗 Useful Links

- [Google Support - Error 400 invalid_request](https://support.google.com/accounts/answer/12917337#400invalid)
- [Expo Auth Session Documentation](https://docs.expo.dev/guides/authentication/#google)
- [Google OAuth 2.0 for Mobile & Desktop Apps](https://developers.google.com/identity/protocols/oauth2/native-app)
- [Google Cloud Console](https://console.cloud.google.com/)

---

## 💡 Additional Notes

### Why Is Expo Auth Proxy Safe?
- Uses HTTPS instead of Custom URI Schemes
- Google trusts `auth.expo.io` domain
- Prevents app impersonation attacks
- Complies with OAuth 2.0 best practices

### When Do You Need Standalone Build?
- When deploying to Play Store/App Store
- When you need Native user experience
- When you want best possible performance

### Can You Use Both Solutions?
Yes! You can:
- Use `expo-auth-session` for development (Expo Go)
- Use `@react-native-google-signin` for production (Standalone Build)

---

## 📞 Support

If you encounter any issues:
1. Verify redirect URI is correct in Google Cloud Console
2. Wait 2-3 minutes after saving changes
3. Clear app cache: `npx expo start --clear`
4. Check console logs for detailed errors

---

**Updated:** October 31, 2025
**Status:** ✅ Code Ready - Awaiting Google Cloud Console Configuration
