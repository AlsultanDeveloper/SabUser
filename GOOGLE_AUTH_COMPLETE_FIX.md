# 🔧 الحل النهائي لمشكلة Google Sign In

## المشكلة
```
Error 400: invalid_request
Custom URI scheme is not enabled for your Android client
```

## السبب الجذري
وفقاً لـ **وثائق Google الرسمية**:

> **"لم يعُد مسموحًا باستخدام أنظمة معرّفات الموارد المنتظمة المخصّصة (Custom URI Schemes) بسبب خطر انتحال هوية التطبيق."**

Source: https://developers.google.com/identity/protocols/oauth2/native-app#authorization-errors-invalid-request

Google أوقفت استخدام `sabstore://` و `exp+sab-store://` للأمان!

## الحل النهائي ✅

استخدام **@react-native-google-signin/google-signin** بدلاً من **expo-auth-session**

### 1. تثبيت المكتبة
```bash
npm install @react-native-google-signin/google-signin
```

### 2. تكوين app.json
```json
{
  "plugins": [
    ["@react-native-google-signin/google-signin", {
      "iosUrlScheme": "com.googleusercontent.apps.263235150197-uearggvrhr7u97uh9likv6hsbs73muqu"
    }]
  ]
}
```

### 3. إعادة بناء المشروع
```bash
npx expo prebuild --clean
npx expo run:android
```

### 4. تحديث AuthContext
```typescript
import { GoogleSignin } from '@react-native-google-signin/google-signin';

// Configure on mount
GoogleSignin.configure({
  webClientId: GOOGLE_WEB_CLIENT_ID,
  offlineAccess: true,
  forceCodeForRefreshToken: true,
});

// Sign in
const response = await GoogleSignin.signIn();
const { idToken } = await GoogleSignin.getTokens();
const credential = GoogleAuthProvider.credential(idToken, null);
await signInWithCredential(auth, credential);
```

## لماذا هذا الحل؟

### ❌ expo-auth-session (القديم)
- يستخدم Custom URI Schemes (`sabstore://`)
- Google أوقفت دعمها للأمان
- يحتاج redirect URIs معقدة
- Error 400: invalid_request

### ✅ @react-native-google-signin/google-signin (الجديد)
- يستخدم Google Play Services مباشرة
- لا يحتاج Custom URI Schemes
- أكثر أماناً وموثوقية
- Native implementation
- Google توصي به رسمياً

## معلومات تقنية

### Client IDs المستخدمة
```typescript
Android: 263235150197-71q01c46r4923tdgsei29oohkfthkk9i
iOS:     263235150197-uearggvrhr7u97uh9likv6hsbs73muqu
Web:     263235150197-7ur5kp8iath4f503m1f7juq5nha1nvqj
```

### SHA Fingerprints (موجودة بالفعل ✓)
```
SHA-1:   4D:83:51:93:8E:11:96:54:8A:86:47:5B:DA:2F:E4:AC:8E:29:2D:9C
SHA-256: F7:07:34:0B:72:75:4B:A0:FD:B7:91:DC:23:82:12:59:40:9F:26:42:2D:29:4C:D1:6B:4D:96:CE:FF:45:33:D5
```

### Package Name
```
app.rork.lebanonmultivendorecommerceplatform
```

## التدفق الجديد

```
1. User presses "Sign in with Google"
   ↓
2. GoogleSignin.signIn() يفتح Google Play Services
   ↓
3. User يصادق باستخدام حساب Google الموجود في الجهاز
   ↓
4. GoogleSignin.getTokens() يحصل على idToken
   ↓
5. Firebase signInWithCredential(credential)
   ↓
6. ✅ Success! No redirect URIs needed!
```

## الأخطاء الشائعة وحلولها

### Error Code 7 - NETWORK_ERROR
```
Network error. Please check your connection and try again.
```

### Error Code 12501 - SIGN_IN_CANCELLED
```
User cancelled sign-in
```

### Error Code 10 - DEVELOPER_ERROR
```
Configuration error. Check:
- SHA-1/SHA-256 في Google Cloud Console
- Package name صحيح
- google-services.json موجود في android/app/
```

## الفرق الرئيسي

| expo-auth-session | @react-native-google-signin |
|------------------|----------------------------|
| يفتح متصفح | Native dialog |
| Custom URI Schemes | Google Play Services |
| Redirect URIs معقدة | لا يحتاج Redirects |
| Error 400 | ✅ يعمل |

## ما تم تغييره

### تم إزالة:
- `expo-auth-session/providers/google`
- `expo-auth-session` (AuthSession)
- `googlePromptAsync()`
- Custom redirect URIs
- `googleRequest` state

### تم إضافة:
- `@react-native-google-signin/google-signin`
- `GoogleSignin.configure()`
- `GoogleSignin.signIn()`
- `GoogleSignin.getTokens()`
- Native Google Sign-In flow

---

**Created:** October 31, 2025  
**Status:** ✅ Fixed - Using native Google Sign-In SDK  
**Reference:** [Google OAuth 2.0 للتطبيقات الأصلية](https://developers.google.com/identity/protocols/oauth2/native-app)
