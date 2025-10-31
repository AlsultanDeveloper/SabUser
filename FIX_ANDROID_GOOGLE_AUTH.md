# ✅ حل مشكلة Google Sign-In على Android

## 🔴 المشكلة الحالية

عند محاولة تسجيل الدخول عبر Google على **Android** (في Expo Go)، تظهر رسالة:

```
Access blocked: Sab Store's request is invalid
Error 400: invalid_request
```

### 🔍 السبب:
- Expo Go يستخدم **Custom URI Scheme**: `app.rork.lebanonmultivendorecommerceplatform:/oauthredirect`
- Google **أوقفت** Custom URI Schemes لأسباب أمنية
- يجب استخدام **App Links** (Deep Links) بدلاً منها
- **Expo Go لا يدعم App Links** - يحتاج تطبيق standalone

---

## ✅ الحل: بناء تطبيق Standalone

### الخطوة 1: تثبيت EAS CLI

```powershell
npm install -g eas-cli
```

### الخطوة 2: تسجيل الدخول

```powershell
eas login
```

استخدم حساب Expo:
- Username: `alsultandeveloper`

### الخطوة 3: إعداد EAS Build

```powershell
eas build:configure
```

### الخطوة 4: بناء تطبيق Android Development

```powershell
# بناء APK للتطوير (Development Build)
eas build --profile development --platform android

# أو بناء APK للإنتاج (Production)
eas build --profile production --platform android
```

**مدة البناء**: 10-15 دقيقة

### الخطوة 5: تحميل التطبيق وتثبيته

بعد اكتمال البناء:
1. سيظهر رابط التحميل في Terminal
2. افتح الرابط على جهاز Android
3. حمّل الـ APK
4. ثبّته على الجهاز

### الخطوة 6: تشغيل التطبيق

```powershell
# ابدأ Metro bundler
npx expo start --dev-client
```

ثم:
1. افتح التطبيق المثبت (ليس Expo Go)
2. سيتصل تلقائياً بـ Metro
3. جرب Google Sign-In

---

## 🌐 إضافة App Links إلى Google Cloud Console

### 1. افتح Google Cloud Console
https://console.cloud.google.com/apis/credentials

### 2. اختر Android OAuth Client
اختر Client ID:
```
263235150197-71q01c46r4923tdgsei29oohkfthkk9i
```

### 3. تأكد من SHA Fingerprints

يجب أن تكون موجودة:
```
SHA-1: 4D:83:51:93:8E:11:96:54:8A:86:47:5B:DA:2F:E4:AC:8E:29:2D:9C
SHA-256: F7:07:34:0B:72:75:4B:A0:FD:B7:91:DC:23:82:12:59:40:9F:26:42:2D:29:4C:D1:6B:4D:96:CE:FF:45:33:D5
```

### 4. لا تضف Custom URI Schemes! ❌

**لا تضف هذا**:
```
❌ app.rork.lebanonmultivendorecommerceplatform:/oauthredirect
```

---

## 📱 لماذا لا يعمل في Expo Go؟

| الميزة | Expo Go | Standalone Build |
|--------|---------|------------------|
| Custom URI Schemes | ✅ يعمل | ✅ يعمل |
| App Links (Deep Links) | ❌ لا يعمل | ✅ يعمل |
| Google Sign-In (جديد) | ❌ لا يعمل | ✅ يعمل |
| Apple Sign-In | ❌ لا يعمل | ✅ يعمل |
| Push Notifications | محدود | ✅ كامل |
| Native Modules مخصصة | ❌ لا يعمل | ✅ يعمل |

**الخلاصة**: Google أوقفت Custom URI Schemes، وExpo Go يستخدمها، لذلك يجب بناء تطبيق standalone.

---

## 🔄 الخيار البديل: استخدام Native SDK (متقدم)

إذا أردت استخدام `@react-native-google-signin/google-signin`:

### 1. تثبيت المكتبة

```powershell
npx expo install @react-native-google-signin/google-signin
```

### 2. إضافة Plugin إلى app.json

```json
{
  "expo": {
    "plugins": [
      "@react-native-google-signin/google-signin"
    ]
  }
}
```

### 3. إعادة البناء

```powershell
npx expo prebuild --clean
eas build --profile development --platform android
```

### 4. تعديل AuthContext.tsx

```typescript
import { GoogleSignin } from '@react-native-google-signin/google-signin';

// في useEffect
GoogleSignin.configure({
  webClientId: GOOGLE_WEB_CLIENT_ID,
  offlineAccess: true,
});

// دالة تسجيل الدخول
const signInWithGoogle = async () => {
  await GoogleSignin.hasPlayServices();
  const userInfo = await GoogleSignin.signIn();
  const googleCredential = auth.GoogleAuthProvider.credential(userInfo.idToken);
  return signInWithCredential(auth, googleCredential);
};
```

**⚠️ ملاحظة**: هذا الخيار يحتاج standalone build أيضاً!

---

## ✅ الحل الأسرع (للتطوير فقط)

**للاختبار السريع**:

1. استخدم **الويب** (localhost:8085) - **يعمل بالفعل! ✅**
2. استخدم **iOS Simulator** - قد يعمل مع expo-auth-session
3. ابني APK development (مرة واحدة) واستخدمه للتطوير

**لا تحتاج إعادة البناء** في كل مرة - Metro سيحدّث الكود تلقائياً!

---

## 📋 خطوات الإنتاج النهائية

### قبل النشر على Google Play:

1. ✅ بناء APK/AAB production
   ```powershell
   eas build --profile production --platform android
   ```

2. ✅ الحصول على SHA-1/SHA-256 للـ production keystore
   ```powershell
   eas credentials
   ```

3. ✅ إضافة Fingerprints إلى Google Cloud Console

4. ✅ اختبار Google Sign-In على production build

5. ✅ رفع التطبيق إلى Google Play Console

---

## 🆘 المشاكل الشائعة

### المشكلة 1: "Error 400: invalid_request"
**الحل**: تأكد من استخدام standalone build (ليس Expo Go)

### المشكلة 2: "SHA fingerprint mismatch"
**الحل**: 
```powershell
# احصل على SHA من EAS
eas credentials

# أضفها إلى Google Cloud Console
```

### المشكلة 3: "App Links not working"
**الحل**: تأكد من إضافة `intentFilters` في app.json

### المشكلة 4: "Build failed"
**الحل**: 
```powershell
# نظّف وأعد البناء
npx expo prebuild --clean
eas build --clear-cache --profile development --platform android
```

---

## 📞 الدعم

إذا واجهت مشاكل:

1. راجع Expo Documentation: https://docs.expo.dev/
2. راجع EAS Build docs: https://docs.expo.dev/build/introduction/
3. Google OAuth docs: https://developers.google.com/identity/protocols/oauth2/native-app

---

## ✅ الخلاصة

| الحالة | الحل |
|--------|------|
| الويب | ✅ يعمل الآن (expo-auth-session) |
| Android (Expo Go) | ❌ لا يعمل - يحتاج standalone build |
| Android (Standalone) | ✅ سيعمل بعد البناء |
| iOS (Expo Go) | ⚠️ قد يعمل - جرّب |
| iOS (Standalone) | ✅ سيعمل بعد البناء |

**الخطوة التالية**: ابنِ development build مرة واحدة وستحل جميع المشاكل!
