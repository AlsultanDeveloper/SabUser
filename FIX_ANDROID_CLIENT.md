# 🔧 حل نهائي - Custom URI Scheme Issue
## Android Client Configuration Fix

**المشكلة:**
```
Error 400: invalid_request
Custom URI scheme is not enabled for your Android client.
```

---

## ✅ الحل الصحيح:

### في Google Cloud Console:

1. **اذهب إلى Android OAuth Client** (ليس Web Client!)
   - Client ID: `263235150197-71q01c46r4923tdgsei29oohkfthkk9i`

2. **في الإعدادات:**
   - Package name: `app.rork.lebanonmultivendorecommerceplatform`
   - SHA-1: (يجب إضافته)
   - SHA-256: (يجب إضافته)

3. **تحت "Additional settings":**
   - ✅ Enable "Deep Linking"
   - ✅ Add redirect URI scheme

---

## 🔍 المشكلة الحقيقية:

Google يحتاج أن يكون الـ Android Client ID **مسجل بشكل صحيح** مع:
1. ✅ Package name صحيح
2. ✅ SHA-1 certificate fingerprint
3. ✅ SHA-256 certificate fingerprint

---

## 📋 كيفية الحصول على SHA keys:

```powershell
# في مجلد المشروع
cd android
.\gradlew signingReport
```

أو:

```powershell
keytool -list -v -keystore "%USERPROFILE%\.android\debug.keystore" -alias androiddebugkey -storepass android -keypass android
```

---

## 🎯 الخطوات بالترتيب:

1. احصل على SHA-1 & SHA-256
2. افتح Android Client في Google Cloud
3. أضف SHA keys
4. احفظ
5. انتظر 5-10 دقائق
6. جرّب مرة أخرى

---

**دعني أشغّل الأمر للحصول على SHA keys!** 🚀
