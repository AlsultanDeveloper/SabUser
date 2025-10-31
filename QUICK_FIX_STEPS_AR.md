# خطوات سريعة لإصلاح Google Sign-In ⚡

## 🎯 الخلاصة السريعة

**المشكلة:** Error 400 - Custom URI Scheme محظور من Google  
**الحل:** استخدام HTTPS Redirect URI بدلاً من Custom Scheme  
**الوقت المتوقع:** 5 دقائق

---

## ✅ الخطوات (يجب تنفيذها الآن!)

### 1️⃣ افتح Google Cloud Console
```
https://console.cloud.google.com/
```

### 2️⃣ اذهب إلى Credentials
- APIs & Services → Credentials
- ابحث عن **Web application** OAuth Client
- (اسمه عادة: "Web client 1" أو مشابه)

### 3️⃣ أضف Redirect URI
في قسم **Authorized redirect URIs**، اضغط **+ ADD URI** وأضف:
```
https://auth.expo.io/@alsultandeveloper/sab-store
```

### 4️⃣ احفظ التغييرات
- اضغط **Save** في الأسفل
- ⏰ **انتظر 2-3 دقائق** (مهم جداً!)

### 5️⃣ أعد تشغيل التطبيق
```bash
npx expo start --clear
```

### 6️⃣ اختبر Google Sign-In
- افتح التطبيق
- اضغط على "Sign in with Google"
- يجب أن يعمل الآن! ✅

---

## 🔍 تحقق من الإعدادات

### في Google Cloud Console، تأكد من:

```
✅ OAuth Client Type: Web application
✅ Authorized redirect URIs يحتوي على:
   https://auth.expo.io/@alsultandeveloper/sab-store

❌ لا تضف Custom URI Schemes مثل:
   sabstore:// (محظور!)
   exp+sab-store:// (محظور!)
```

---

## 🚨 إذا لم يعمل

### احتمال 1: لم تنتظر
- انتظر 2-3 دقائق بعد حفظ التغييرات
- Google تحتاج وقت لنشر التحديثات

### احتمال 2: Redirect URI خطأ
تأكد من النسخ بالضبط:
```
https://auth.expo.io/@alsultandeveloper/sab-store
```

### احتمال 3: Client ID خطأ
تحقق من أن Web Client ID موجود في `.env`:
```env
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=263235150197-7ur5kp8iath4f503m1f7juq5nha1nvqj.apps.googleusercontent.com
```

---

## 📱 الحالة الحالية

### ✅ الكود جاهز:
- استخدام `expo-auth-session` بدلاً من native module
- لا توجد أخطاء في الكود
- التطبيق يعمل بدون مشاكل

### ⏳ ينتظر منك:
- إضافة Redirect URI في Google Cloud Console
- الاختبار

---

## 💡 نصيحة سريعة

إذا كنت متأكد من أن كل شيء صحيح ولكن لا يزال لا يعمل:

1. **نظف Cache:**
   ```bash
   npx expo start --clear
   ```

2. **تأكد من تسجيل الدخول:**
   ```bash
   npx expo whoami
   ```

3. **تحقق من Console Logs:**
   - افتح Metro bundler terminal
   - ابحث عن رسائل مثل:
   ```
   🔐 Starting Google Sign-In with expo-auth-session...
   📋 Auth result type: success
   ```

---

## 🎉 توقعات النجاح

بعد تطبيق هذه الخطوات:
- ✅ لن ترى Error 400 بعد الآن
- ✅ Google Sign-In سيعمل بشكل طبيعي
- ✅ تسجيل الدخول سيكون سريع وآمن

---

**آخر تحديث:** 31 أكتوبر 2025  
**للمزيد من التفاصيل:** اقرأ `GOOGLE_400_ERROR_OFFICIAL_FIX.md`
