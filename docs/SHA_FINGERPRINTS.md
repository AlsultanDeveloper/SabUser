# 🔑 معلومات SHA Fingerprints للمشروع

## ✅ SHA-1 و SHA-256 Fingerprints

تم الحصول عليها من `gradlew signingReport` بتاريخ: 2025-11-08

### للتطبيق الرئيسي (App):
```
SHA-1: 5E:8F:16:06:2E:A3:CD:2C:4A:0D:54:78:76:BA:A6:F3:8C:AB:F6:25
SHA-256: FA:C6:17:45:DC:09:03:78:6F:B9:ED:E6:2A:96:2B:39:9F:73:48:F0:BB:6F:89:9B:83:32:66:75:91:03:3B:9C
Keystore: C:\Users\adamd\Project\SabUser\android\app\debug.keystore
```

### للمكتبات (Default Android Debug Keystore):
```
SHA-1: 4D:83:51:93:8E:11:96:54:8A:86:47:5B:DA:2F:E4:AC:8E:29:2D:9C
SHA-256: F7:07:34:0B:72:75:4B:A0:FD:B7:91:DC:23:82:12:59:40:9F:26:42:2D:29:4C:D1:6B:4D:96:CE:FF:45:33:D5
Keystore: C:\Users\adamd\.android\debug.keystore
```

---

## 📝 الخطوات المطلوبة لحل مشكلة Google Sign-In

### الخطوة 1: افتح Google Cloud Console
👉 https://console.cloud.google.com/

### الخطوة 2: اختر المشروع
اختر: **sab-store-9b947**

### الخطوة 3: انتقل إلى Credentials
**APIs & Services** → **Credentials**

### الخطوة 4: أضف SHA Fingerprints

#### طريقة 1: تحديث OAuth Client الموجود

1. ابحث عن **OAuth 2.0 Client ID** من نوع **Android**
2. إذا لم يكن موجوداً، اضغط **+ CREATE CREDENTIALS** → **OAuth client ID** → **Android**
3. في إعدادات OAuth Client:

**Package name:**
```
com.alsultandeveloper.sabstore
```

**SHA-1 certificate fingerprints (أضف الاثنين):**
```
5E:8F:16:06:2E:A3:CD:2C:4A:0D:54:78:76:BA:A6:F3:8C:AB:F6:25
4D:83:51:93:8E:11:96:54:8A:86:47:5B:DA:2F:E4:AC:8E:29:2D:9C
```

**SHA-256 certificate fingerprints (أضف الاثنين):**
```
FA:C6:17:45:DC:09:03:78:6F:B9:ED:E6:2A:96:2B:39:9F:73:48:F0:BB:6F:89:9B:83:32:66:75:91:03:3B:9C
F7:07:34:0B:72:75:4B:A0:FD:B7:91:DC:23:82:12:59:40:9F:26:42:2D:29:4C:D1:6B:4D:96:CE:FF:45:33:D5
```

4. اضغط **Save** أو **Create**

### الخطوة 5: انتظر 5-10 دقائق

التحديثات في Google Cloud Console تحتاج وقتاً للتفعيل.

### الخطوة 6: اختبر التطبيق

```powershell
npx expo start --clear
```

ثم اضغط **a** لفتح Android.

---

## ⚠️ ملاحظات مهمة

### لماذا نحتاج لإضافة SHA fingerprints الاثنين؟

1. **App Keystore** (`5E:8F:16...`):
   - يُستخدم للتطبيق نفسه
   - موجود في مجلد المشروع

2. **Default Android Debug Keystore** (`4D:83:51...`):
   - يُستخدم من قبل Expo و بعض المكتبات
   - موجود في `.android` في home directory

### تحديث package.json في Google Cloud Console

تأكد أن **Package name** في Google Cloud Console يطابق:
```
com.alsultandeveloper.sabstore
```

يمكنك التحقق منه في `app.json`:
```json
"android": {
  "package": "com.alsultandeveloper.sabstore"
}
```

### OAuth 2.0 Client IDs المطلوبة

يجب أن يكون لديك:
1. ✅ **Android** Client ID (مع SHA fingerprints)
2. ✅ **iOS** Client ID (موجود بالفعل)
3. ✅ **Web** Client ID (موجود بالفعل)

---

## 🔄 إذا لم يعمل بعد إضافة SHA Fingerprints

### 1. تحقق من OAuth Consent Screen
انتقل إلى **OAuth consent screen** وتأكد أن:
- Status: **Published** أو **Testing**
- إذا كان **Testing**، أضف email المستخدم في **Test users**

### 2. مسح Cache
```powershell
npx expo start --clear
```

### 3. تحقق من Logs
في Metro bundler، ابحث عن:
```
🔐 Starting Google Sign-In with expo-auth-session...
📱 Platform: android
📍 Google Request Details:
  Redirect URI: ...
```

### 4. تحقق من Google Services JSON
الملف `google-services.json` يجب أن يحتوي على:
```json
"oauth_client": [
  {
    "client_id": "...",
    "client_type": 1,
    "android_info": {
      "package_name": "com.alsultandeveloper.sabstore",
      "certificate_hash": "5e8f16062ea3cd2c4a0d547876baa6f38cabf625"
    }
  }
]
```

---

## 🎯 خلاصة سريعة

**المطلوب:**
1. أضف SHA-1 و SHA-256 (الاثنين) إلى Android OAuth Client في Google Cloud Console
2. Package name: `com.alsultandeveloper.sabstore`
3. انتظر 5-10 دقائق
4. جرب التطبيق

**SHA Fingerprints للنسخ:**
```
SHA-1 #1: 5E:8F:16:06:2E:A3:CD:2C:4A:0D:54:78:76:BA:A6:F3:8C:AB:F6:25
SHA-1 #2: 4D:83:51:93:8E:11:96:54:8A:86:47:5B:DA:2F:E4:AC:8E:29:2D:9C

SHA-256 #1: FA:C6:17:45:DC:09:03:78:6F:B9:ED:E6:2A:96:2B:39:9F:73:48:F0:BB:6F:89:9B:83:32:66:75:91:03:3B:9C
SHA-256 #2: F7:07:34:0B:72:75:4B:A0:FD:B7:91:DC:23:82:12:59:40:9F:26:42:2D:29:4C:D1:6B:4D:96:CE:FF:45:33:D5
```

هذا يجب أن يحل المشكلة 100%! 🚀
