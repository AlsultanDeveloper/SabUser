# 🔧 الحل الكامل لمشكلة Google Sign In

## المشكلة
```
Error 400: invalid_request
Custom URI scheme is not enabled for your Android client
```

## السبب الجذري
Google OAuth يحتاج:
1. ✅ SHA-1 / SHA-256 fingerprints (موجودة بالفعل)
2. ❌ **Redirect URIs مفقودة في Web OAuth Client**

## الحل النهائي

### 1. افتح Google Cloud Console
https://console.cloud.google.com/apis/credentials?project=sab-store-9b947

### 2. اختر **Web OAuth Client** (وليس Android!)
- Client ID: `263235150197-7ur5kp8iath4f503m1f7juq5nha1nvqj`
- Name: `Web client (auto created by Google Service)`

### 3. أضف هذه الـ Authorized redirect URIs:

```
https://auth.expo.io/@alsultandeveloper/sab-store
sabstore://
exp+sab-store://
```

**لماذا Web Client وليس Android؟**
- expo-auth-session يستخدم **Web Client ID** لتنفيذ OAuth flow
- Android Client ID يُستخدم فقط للتحقق من SHA fingerprints
- Redirect URIs يجب أن تكون في **Web Client**

### 4. احفظ التغييرات
- اضغط **Save**
- انتظر 2-3 دقائق

### 5. اختبر Google Sign In
```bash
# أعد تشغيل الخادم
npx expo start --clear
```

## معلومات تقنية

### URI Schemes المسجلة
```
sabstore://          # Production scheme
exp+sab-store://    # Development (Expo Go) scheme
```

### Client IDs
```typescript
Android: 263235150197-71q01c46r4923tdgsei29oohkfthkk9i
iOS:     263235150197-uearggvrhr7u97uh9likv6hsbs73muqu
Web:     263235150197-7ur5kp8iath4f503m1f7juq5nha1nvqj
```

### SHA Fingerprints (بالفعل مضافة ✓)
```
SHA-1:   4D:83:51:93:8E:11:96:54:8A:86:47:5B:DA:2F:E4:AC:8E:29:2D:9C
SHA-256: F7:07:34:0B:72:75:4B:A0:FD:B7:91:DC:23:82:12:59:40:9F:26:42:2D:29:4C:D1:6B:4D:96:CE:FF:45:33:D5
```

## التدفق الصحيح

```
1. User presses "Sign in with Google"
   ↓
2. expo-auth-session opens browser with Web Client ID
   ↓
3. User authenticates with Google
   ↓
4. Google redirects to: https://auth.expo.io/@alsultandeveloper/sab-store
   ↓
5. Expo Auth Proxy redirects to: exp+sab-store:// (or sabstore://)
   ↓
6. App receives idToken
   ↓
7. Firebase signInWithCredential
   ↓
8. ✅ Success!
```

## إذا استمرت المشكلة

### Option A: استخدم Expo Redirect URI فقط
في `AuthContext.tsx`:
```typescript
redirectUri: AuthSession.makeRedirectUri(),
// بدون { scheme: 'sabstore' }
```

### Option B: تحقق من Package Name
```json
"android": {
  "package": "app.rork.lebanonmultivendorecommerceplatform"
}
```

يجب أن يطابق في Google Cloud Console!

### Option C: Debug Logs
```typescript
console.log('Redirect URI:', AuthSession.makeRedirectUri());
// يجب أن يظهر: https://auth.expo.io/@alsultandeveloper/sab-store
// أو: exp+sab-store://
```

## ملخص سريع

| ✅ صحيح | ❌ خطأ |
|---------|--------|
| إضافة Redirect URIs في **Web Client** | إضافتها في Android Client فقط |
| SHA fingerprints في **Android Client** | عدم إضافة SHA |
| استخدام `exp+sab-store://` للتطوير | استخدام `sabstore://` فقط |
| الانتظار 2-3 دقائق بعد التغيير | الاختبار فوراً |

---

**Created:** October 31, 2025  
**Status:** 🔄 Waiting for Google Cloud Console configuration
