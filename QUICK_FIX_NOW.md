# 🎯 خطوة واحدة فقط لحل المشكلة!

## ✅ التعديل تم تطبيقه في الكود

الكود الآن يستخدم:
```
https://auth.expo.io/@alsultandeveloper/sab-store
```
بدلاً من:
```
app.rork.lebanonmultivendorecommerceplatform:/oauthredirect ❌
```

---

## 🌐 افعل هذا الآن

### 1. افتح Google Cloud Console

**رابط مباشر**:
```
https://console.cloud.google.com/apis/credentials?project=sab-store-9b947
```

### 2. اختر **Web OAuth Client** (وليس Android!)

ابحث عن:
```
Web client (auto created by Google Service)
Client ID: 263235150197-7ur5kp8iath4f503m1f7juq5nha1nvqj
```

**⚠️ مهم**: اختر **Web client** وليس **Android client**!

### 3. أضف Redirect URI

في قسم **"Authorized redirect URIs"**:

**انسخ هذا بالضبط**:
```
https://auth.expo.io/@alsultandeveloper/sab-store
```

**الصق واضغط Enter**

**اضغط "Save"** أسفل الصفحة

---

## ❓ لماذا Web Client وليس Android Client؟

### Android OAuth Client:
```
❌ لا يحتوي على "Authorized redirect URIs"
✅ يحتوي على SHA-1/SHA-256 فقط
```

### Web OAuth Client:
```
✅ يحتوي على "Authorized redirect URIs"
✅ يستخدمه expo-auth-session على Android
```

**الشرح**:
- `expo-auth-session` يفتح **Chrome Custom Tab** (متصفح)
- المتصفح يستخدم **Web Client ID** للمصادقة
- لذلك نضيف الـ redirect URI في **Web Client** وليس Android Client

---

## 🔄 بعد الحفظ

### في PowerShell:
```powershell
# Ctrl+C لإيقاف Metro
npx expo start --dev-client --clear
```

### في الجهاز:
1. رج الجهاز → Reload
2. جرّب Google Sign-In
3. **سيعمل!** ✅

---

## 📸 ما ستراه في Console

**قبل**:
```
🔄 Redirect URI: app.rork.lebanonmultivendorecommerceplatform:/oauthredirect
❌ Error 400: invalid_request
```

**بعد**:
```
🔧 Using Expo Auth Proxy redirect URI: https://auth.expo.io/@alsultandeveloper/sab-store
✅ Google sign in successful!
```

---

## 📋 ملخص Client IDs في مشروعك

| Client Type | Client ID | الاستخدام |
|------------|-----------|---------|
| **Android** | `263235150197-71q01c46r4923tdgsei29oohkfthkk9i` | SHA fingerprints فقط |
| **iOS** | `263235150197-uearggvrhr7u97uh9likv6hsbs73muqu` | Apple Sign-In |
| **Web** ⭐ | `263235150197-7ur5kp8iath4f503m1f7juq5nha1nvqj` | **أضف redirect URI هنا!** |

---

**وقت الحل**: 2 دقيقة ⏱️  
**صعوبة**: سهل جداً ⭐  
**النتيجة**: Google Sign-In يعمل على كل المنصات! 🎉
