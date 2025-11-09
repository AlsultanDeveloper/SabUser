# 🔑 كيفية الحصول على SHA-1 و SHA-256

## للـ Debug Build:

### Windows (PowerShell):
```powershell
cd android
.\gradlew signingReport
```

أو:
```powershell
keytool -list -v -keystore "%USERPROFILE%\.android\debug.keystore" -alias androiddebugkey -storepass android -keypass android
```

## للـ Release Build:

```powershell
keytool -list -v -keystore ./android/app/debug.keystore -alias androiddebugkey
```

---

## 📋 الخطوات في Google Cloud:

### 1. افتح Google Cloud Console:
https://console.cloud.google.com/apis/credentials?project=sab-store-9b947

### 2. اختر Android OAuth Client:
- Client ID: `263235150197-71q01c46r4923tdgsei29oohkfthkk9i`

### 3. تأكد من:
✅ **Package name:** `app.rork.lebanonmultivendorecommerceplatform`
✅ **SHA-1:** (من الأمر أعلاه)
✅ **SHA-256:** (من الأمر أعلاه)

### 4. في Authorized redirect URIs، أضف:
```
sabstore://
com.googleusercontent.apps.263235150197-71q01c46r4923tdgsei29oohkfthkk9i:/oauth2redirect
```

---

## 🔍 للتحقق من المشكلة:

شغّل التطبيق وانظر إلى Console logs:
```
🔐 Google Auth Configuration:
  Platform: android
  Android Client ID: ✓ Loaded
  Web Client ID: ✓ Loaded
  Redirect URI: sabstore://
```

---

## ⚠️ ملاحظات مهمة:

1. **بعد التعديل في Google Cloud Console**، انتظر 5-10 دقائق
2. **أعد تشغيل التطبيق** بعد التعديلات
3. **تأكد من إضافة SHA-1 و SHA-256** للـ Debug و Release
4. **Package name** يجب أن يكون متطابق 100%

---

## 🚀 الأوامر السريعة:

```bash
# Clean and rebuild
cd android
./gradlew clean
./gradlew assembleDebug

# Get SHA keys
./gradlew signingReport
```
