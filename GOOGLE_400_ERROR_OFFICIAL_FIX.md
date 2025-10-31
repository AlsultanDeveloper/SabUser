# Google OAuth Error 400: invalid_request - الحل الرسمي 🔐

## 📋 وصف المشكلة

عند محاولة تسجيل الدخول بحساب Google، يظهر الخطأ التالي:
```
Error 400: invalid_request
Custom URI scheme is not enabled for your Android client
```

## 🔍 السبب الجذري (حسب توثيق Google الرسمي)

وفقاً لـ [Google Support Documentation](https://support.google.com/accounts/answer/12917337#400invalid):

> **"Error 400 invalid_request" means the app sent an invalid request. The app uses an authorization method that Google doesn't allow.**

> **Google has safe ways for you to sign in and share your Google Account data with third-party apps and services. To help protect your account, Google blocks apps that could put your account at risk.**

### لماذا تم حظر Custom URI Schemes؟

Google قامت بمنع استخدام **Custom URI Schemes** (مثل `sabstore://` أو `exp+sab-store://`) لأسباب أمنية:

1. **App Impersonation Risk**: يمكن لتطبيقات ضارة انتحال هوية تطبيقك
2. **Security Vulnerability**: Custom schemes لا توفر نفس مستوى الأمان مثل HTTPS
3. **OAuth 2.0 Best Practices**: Google تفرض استخدام طرق مصادقة أكثر أماناً

## ✅ الحلول المتاحة

### الحل 1: استخدام Expo Auth Proxy (موصى به للتطوير) 🎯

هذا هو **الحل الأفضل لبيئة Expo Go**:

#### الخطوات:

1. **إضافة Redirect URI في Google Cloud Console**:
   - افتح [Google Cloud Console](https://console.cloud.google.com/)
   - اذهب إلى **APIs & Services** → **Credentials**
   - افتح **Web OAuth Client** (وليس Android Client!)
   - في قسم **Authorized redirect URIs**، أضف:
   ```
   https://auth.expo.io/@alsultandeveloper/sab-store
   ```
   - احفظ التغييرات
   - انتظر **2-3 دقائق** لنشر التغييرات

2. **التأكد من الكود الصحيح** (تم تطبيقه مسبقاً):
   ```typescript
   // ✅ الكود الحالي صحيح ويستخدم expo-auth-session
   import * as Google from 'expo-auth-session/providers/google';
   
   const [googleRequest, googleResponse, googlePromptAsync] = 
     Google.useAuthRequest(googleConfig);
   ```

3. **اختبار التطبيق**:
   ```bash
   npx expo start
   ```

#### كيف يعمل؟
- `expo-auth-session` يستخدم **Expo Auth Proxy** كوسيط
- Proxy يستقبل callback من Google عبر HTTPS
- ثم يعيد التوجيه إلى تطبيقك بشكل آمن
- **لا حاجة لـ Custom URI Schemes**

#### المزايا:
- ✅ يعمل مع Expo Go مباشرة
- ✅ آمن ومعتمد من Google
- ✅ لا يحتاج إلى native build
- ✅ سريع للتطوير

---

### الحل 2: بناء Standalone App (للإنتاج) 📱

إذا كنت تريد استخدام Google Sign-In Native SDK:

#### الخطوات:

1. **بناء التطبيق باستخدام EAS Build**:
   ```bash
   # تثبيت EAS CLI
   npm install -g eas-cli
   
   # تسجيل الدخول
   eas login
   
   # بناء التطبيق
   eas build --platform android --profile preview
   ```

2. **تثبيت Native Module**:
   ```bash
   npx expo install @react-native-google-signin/google-signin
   ```

3. **تحديث app.json**:
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

4. **استخدام GoogleSignin SDK**:
   ```typescript
   import { GoogleSignin } from '@react-native-google-signin/google-signin';
   
   GoogleSignin.configure({
     webClientId: GOOGLE_WEB_CLIENT_ID,
     offlineAccess: true,
   });
   
   const { idToken } = await GoogleSignin.signIn();
   ```

#### المزايا:
- ✅ تجربة مستخدم أفضل (Native UI)
- ✅ أداء أسرع
- ✅ لا يحتاج إلى متصفح خارجي

#### العيوب:
- ❌ لا يعمل مع Expo Go
- ❌ يحتاج إلى build كامل (يستغرق وقتاً)
- ❌ معقد أكثر للتطوير

---

### الحل 3: استخدام Web Client ID فقط (بديل مؤقت)

إذا كنت تريد حلاً سريعاً:

1. في `AuthContext.tsx`، استخدم فقط **Web Client ID**:
   ```typescript
   const googleConfig = useMemo(() => ({
     // استخدم Web Client ID للجميع
     androidClientId: GOOGLE_WEB_CLIENT_ID,
     iosClientId: GOOGLE_WEB_CLIENT_ID,
     webClientId: GOOGLE_WEB_CLIENT_ID,
   }), [GOOGLE_WEB_CLIENT_ID]);
   ```

2. أضف redirect URI في **Web OAuth Client**:
   ```
   https://auth.expo.io/@alsultandeveloper/sab-store
   ```

---

## 🔧 إعدادات Google Cloud Console الصحيحة

### ما تحتاج إلى تكوينه:

#### 1. Web OAuth Client (مهم! 🔴)
```
Client Type: Web application
Name: sab-store-web

Authorized JavaScript origins:
- https://auth.expo.io

Authorized redirect URIs:
- https://auth.expo.io/@alsultandeveloper/sab-store
- https://auth.expo.io
```

#### 2. Android OAuth Client (اختياري للتطوير)
```
Client Type: Android
Package name: app.rork.lebanonmultivendorecommerceplatform

SHA-1: 4D:83:51:93:8E:11:96:54:8A:86:47:5B:DA:2F:E4:AC:8E:29:2D:9C
SHA-256: F7:07:34:0B:72:75:4B:A0:FD:B7:91:DC:23:82:12:59:40:9F:26:42:2D:29:4C:D1:6B:4D:96:CE:FF:45:33:D5
```

#### 3. iOS OAuth Client (للمستقبل)
```
Client Type: iOS
Bundle ID: app.rork.lebanonmultivendorecommerceplatform
```

---

## 🚫 الأخطاء الشائعة

### ❌ خطأ 1: إضافة Redirect URI في Android Client
```
Custom URI Scheme: sabstore://
❌ هذا خطأ! Google لا تسمح بـ Custom URI Schemes
```

### ✅ الصحيح: إضافة HTTPS Redirect في Web Client
```
Authorized redirect URIs:
✅ https://auth.expo.io/@alsultandeveloper/sab-store
```

---

### ❌ خطأ 2: استخدام @react-native-google-signin في Expo Go
```typescript
import { GoogleSignin } from '@react-native-google-signin/google-signin';
❌ لا يعمل! يحتاج إلى native binary
```

### ✅ الصحيح: استخدام expo-auth-session
```typescript
import * as Google from 'expo-auth-session/providers/google';
✅ يعمل مع Expo Go
```

---

## 📝 Checklist للتأكد من الإعدادات

- [ ] تم حذف `@react-native-google-signin/google-signin`
- [ ] الكود يستخدم `expo-auth-session`
- [ ] تم إضافة `https://auth.expo.io/@alsultandeveloper/sab-store` في **Web OAuth Client**
- [ ] تم حفظ التغييرات في Google Cloud Console
- [ ] انتظار 2-3 دقائق لنشر التغييرات
- [ ] إعادة تشغيل التطبيق: `npx expo start --clear`
- [ ] اختبار Google Sign-In

---

## 🎯 الحالة الحالية

### ✅ ما تم إصلاحه:
1. إزالة `@react-native-google-signin/google-signin` (غير متوافق مع Expo Go)
2. استخدام `expo-auth-session` للمصادقة
3. تنظيف الكود وإزالة جميع الأخطاء
4. إضافة معالجة صحيحة لـ Google OAuth response

### ⏳ ما يجب عليك فعله:
1. **افتح [Google Cloud Console](https://console.cloud.google.com/)**
2. **اذهب إلى Credentials → Web OAuth Client**
3. **أضف Redirect URI**:
   ```
   https://auth.expo.io/@alsultandeveloper/sab-store
   ```
4. **احفظ وانتظر 2-3 دقائق**
5. **اختبر تسجيل الدخول**

---

## 🔗 روابط مفيدة

- [Google Support - Error 400 invalid_request](https://support.google.com/accounts/answer/12917337#400invalid)
- [Expo Auth Session Documentation](https://docs.expo.dev/guides/authentication/#google)
- [Google OAuth 2.0 for Mobile & Desktop Apps](https://developers.google.com/identity/protocols/oauth2/native-app)
- [Google Cloud Console](https://console.cloud.google.com/)

---

## 💡 ملاحظات إضافية

### لماذا Expo Auth Proxy آمن؟
- يستخدم HTTPS بدلاً من Custom URI Schemes
- Google تثق في نطاق `auth.expo.io`
- يمنع app impersonation attacks
- يتوافق مع OAuth 2.0 best practices

### متى تحتاج إلى Standalone Build؟
- عندما تريد نشر التطبيق في Play Store/App Store
- عندما تحتاج إلى تجربة مستخدم Native
- عندما تريد أفضل أداء ممكن

### هل يمكن استخدام الحلين معاً؟
نعم! يمكنك:
- استخدام `expo-auth-session` للتطوير (Expo Go)
- استخدام `@react-native-google-signin` للإنتاج (Standalone Build)

---

## 📞 الدعم

إذا واجهت أي مشاكل:
1. تحقق من أن redirect URI صحيح في Google Cloud Console
2. انتظر 2-3 دقائق بعد حفظ التغييرات
3. نظف cache التطبيق: `npx expo start --clear`
4. تحقق من console logs للأخطاء التفصيلية

---

**تم التحديث:** 31 أكتوبر 2025
**الحالة:** ✅ الكود جاهز - في انتظار تكوين Google Cloud Console
