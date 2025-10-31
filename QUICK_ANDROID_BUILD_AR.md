# 🚀 الحل السريع: بناء تطبيق Android

## ⚠️ المشكلة
- Google Sign-In **لا يعمل في Expo Go** على Android
- السبب: Google أوقفت Custom URI Schemes
- الحل: **بناء تطبيق standalone**

---

## ✅ الخطوات (15 دقيقة)

### 1️⃣ تثبيت EAS CLI

افتح **PowerShell** واكتب:

```powershell
npm install -g eas-cli
```

### 2️⃣ تسجيل الدخول

```powershell
eas login
```

**بيانات الدخول**:
- Username: `alsultandeveloper`
- Password: (كلمة المرور الخاصة بحساب Expo)

### 3️⃣ بناء التطبيق

```powershell
cd C:\Users\adamd\Project\SabUser

# بناء APK للتطوير (Development)
eas build --profile development --platform android
```

**⏱️ المدة**: 10-15 دقيقة

### 4️⃣ تحميل وتثبيت

بعد اكتمال البناء:

1. ستظهر رسالة:
   ```
   ✅ Build finished!
   📱 Download: https://expo.dev/accounts/alsultandeveloper/projects/sab-store/builds/...
   ```

2. **افتح الرابط على جهاز Android**
3. **حمّل الـ APK**
4. **ثبّته** (قد تحتاج السماح بتثبيت من مصادر غير معروفة)

### 5️⃣ تشغيل التطبيق

في الكمبيوتر:

```powershell
# ابدأ Metro bundler
npx expo start --dev-client
```

في الجهاز:

1. **افتح التطبيق المثبت** (اسمه "Sab Store")
2. **سيتصل تلقائياً** بـ Metro على الكمبيوتر
3. **جرّب Google Sign-In** - سيعمل! ✅

---

## 🔥 ملاحظات مهمة

### ✅ مميزات Development Build

- **التحديث التلقائي**: أي تغيير في الكود يظهر فوراً (مثل Expo Go)
- **Google Sign-In**: يعمل بشكل كامل ✅
- **Apple Sign-In**: يعمل بشكل كامل ✅
- **جميع Native Modules**: تعمل ✅

### 🔄 متى تحتاج إعادة البناء؟

**لا تحتاج إعادة البناء** في هذه الحالات:
- ✅ تغيير كود JavaScript/TypeScript
- ✅ تغيير styles
- ✅ إضافة screens جديدة
- ✅ تعديل دوال

**تحتاج إعادة البناء** فقط إذا:
- ❌ أضفت native module جديد
- ❌ غيّرت app.json (plugins, permissions, etc.)
- ❌ غيّرت package name
- ❌ غيّرت app icon/splash screen

### 📱 كيف يعمل؟

1. **Metro Bundler** يعمل على الكمبيوتر
2. **التطبيق المثبت** يتصل بـ Metro عبر الشبكة المحلية
3. **التحديثات الفورية** (Hot Reload) تعمل تلقائياً
4. **تجربة مطابقة لـ Expo Go** لكن مع دعم كامل للـ native modules!

---

## 🆘 حل المشاكل

### المشكلة: "Build failed"

**الحل**:
```powershell
# نظّف وأعد المحاولة
eas build --clear-cache --profile development --platform android
```

### المشكلة: "Cannot connect to Metro"

**الحل**:
1. تأكد من أن الكمبيوتر والجهاز على **نفس الشبكة**
2. في PowerShell:
   ```powershell
   # ابدأ Metro مع عرض عنوان IP
   npx expo start --dev-client --tunnel
   ```
3. افتح التطبيق مرة أخرى

### المشكلة: "Google Sign-In لا يزال لا يعمل"

**الحل**:
1. تأكد من SHA-1/SHA-256 في Google Cloud Console
2. احصل على SHA من EAS:
   ```powershell
   eas credentials
   ```
3. أضفها إلى: https://console.cloud.google.com/apis/credentials

---

## 🎯 الخطوة التالية

بعد بناء Development Build:

```powershell
# في المرة القادمة، فقط:
npx expo start --dev-client

# وافتح التطبيق المثبت
```

**هذا كل شيء!** 🎉

---

## 📞 الدعم

إذا واجهت مشاكل، أرسل لي:
1. لقطة شاشة من رسالة الخطأ
2. نتيجة الأمر:
   ```powershell
   eas credentials
   ```
