# دليل نشر التطبيق - Deployment Guide

## 📋 نظرة عامة | Overview

هذا الدليل يشرح كيفية نشر تطبيق Sab Store للنشر العالمي على متاجر التطبيقات (App Store و Google Play Store) باستخدام EAS (Expo Application Services).

---

## ✅ الإعدادات الحالية | Current Setup

### 1. **معلومات التطبيق الأساسية**
```json
{
  "name": "Sab Store",
  "slug": "sab-store",
  "version": "1.0.14",
  "runtimeVersion": "1.0.14"
}
```

### 2. **التحديثات الهوائية (OTA) - مُفعّلة ✅**
```json
"updates": {
  "enabled": true,
  "url": "https://u.expo.dev/d5069f4c-8710-4ecf-8aa3-7dce45e85b18",
  "checkAutomatically": "ON_LOAD",
  "fallbackToCacheTimeout": 0
}
```

**كيف تعمل:**
- ✅ التطبيق يتحقق تلقائياً من التحديثات عند فتحه
- ✅ يتم تنزيل التحديثات في الخلفية تلقائياً
- ✅ التحديثات تُطبّق عند إعادة فتح التطبيق
- ✅ **لا حاجة لزر يدوي** - العملية تلقائية بالكامل

### 3. **معرف المشروع EAS**
```
Project ID: d5069f4c-8710-4ecf-8aa3-7dce45e85b18
```

---

## 🚀 خطوات النشر | Deployment Steps

### الخطوة 1️⃣: التحضير للنشر

#### تحديث الإصدار (Version)
```bash
# في app.json
"version": "1.0.14",  # زيادة الرقم عند كل نشر
"runtimeVersion": "1.0.14"  # يجب أن يطابق version
```

#### التحقق من الملفات الأساسية
- ✅ `app.json` - جميع الإعدادات صحيحة
- ✅ `eas.json` - قنوات النشر معدّة
- ✅ Firebase - جميع المفاتيح موجودة
- ✅ Google Services - `google-services.json` و `GoogleService-Info.plist`

---

### الخطوة 2️⃣: بناء التطبيق (Build)

#### 🤖 **Android - Google Play Store**

##### بناء الإصدار الإنتاجي:
```bash
# بناء AAB (Android App Bundle) للنشر
eas build --platform android --profile production

# أو بناء APK للاختبار
eas build --platform android --profile preview
```

**ملاحظات مهمة:**
- سيتم إنشاء ملف `.aab` للنشر على Google Play
- الملف سيكون موقّع تلقائياً بواسطة EAS
- التحديث التلقائي لرقم الإصدار مُفعّل (`autoIncrement: true`)

---

#### 🍎 **iOS - App Store**

##### بناء الإصدار الإنتاجي:
```bash
# بناء IPA للنشر
eas build --platform ios --profile production
```

**متطلبات iOS:**
- ✅ Apple Developer Account ($99/سنة)
- ✅ Bundle Identifier: `app.rork.lebanon-multi-vendor-ecommerce-platform`
- ✅ شهادة توقيع (Signing Certificate) - يديرها EAS تلقائياً

---

### الخطوة 3️⃣: رفع التطبيق للمتاجر

#### 🤖 **Google Play Store**

```bash
# رفع تلقائي للـ Google Play Console
eas submit --platform android --profile production
```

**أو يدوياً:**
1. تحميل ملف `.aab` من EAS Dashboard
2. الذهاب إلى [Google Play Console](https://play.google.com/console)
3. اختيار التطبيق → إنتاج (Production) → إنشاء إصدار جديد
4. رفع ملف `.aab`
5. ملء معلومات الإصدار
6. إرسال للمراجعة

---

#### 🍎 **App Store**

```bash
# رفع تلقائي لـ App Store Connect
eas submit --platform ios --profile production
```

**أو يدوياً عبر Transporter:**
1. تحميل ملف `.ipa` من EAS Dashboard
2. فتح تطبيق [Transporter](https://apps.apple.com/app/transporter/id1450874784)
3. رفع ملف `.ipa`
4. الذهاب إلى [App Store Connect](https://appstoreconnect.apple.com)
5. إنشاء إصدار جديد وإرساله للمراجعة

---

## 🔄 التحديثات بعد النشر | Post-Release Updates

### نوعان من التحديثات:

#### 1️⃣ **تحديثات OTA (فورية - بدون مراجعة المتجر)**
**للتغييرات في:**
- ✅ JavaScript/TypeScript code
- ✅ Assets (صور، أيقونات، إلخ)
- ✅ إصلاح أخطاء (Bugs)
- ✅ تحسينات UI/UX
- ✅ تحديث المحتوى

**كيفية النشر:**
```bash
# نشر تحديث OTA
eas update --branch production --message "إصلاح مشكلة في عرض المنتجات"

# أو للقناة المحددة
eas update --channel production --message "Update description"
```

**المستخدمون يحصلون على التحديث:**
- ✅ تلقائياً عند فتح التطبيق
- ✅ خلال ثوانٍ (لا انتظار لمراجعة المتجر)
- ✅ بدون إعادة تنزيل من المتجر

---

#### 2️⃣ **تحديثات Native (تحتاج مراجعة المتجر)**
**للتغييرات في:**
- ❌ Native modules (كاميرا، موقع، إلخ)
- ❌ App permissions (صلاحيات جديدة)
- ❌ تحديثات Expo SDK
- ❌ تغييرات في `app.json` config

**كيفية النشر:**
```bash
# 1. تحديث الإصدار
# في app.json: "version": "1.0.15"

# 2. بناء جديد
eas build --platform all --profile production

# 3. رفع للمتاجر
eas submit --platform all --profile production
```

---

## 🔍 متابعة التحديثات | Monitoring Updates

### لوحة التحكم EAS
```
https://expo.dev/accounts/[username]/projects/sab-store/updates
```

**يمكنك مشاهدة:**
- 📊 عدد التحديثات المنشورة
- 👥 عدد المستخدمين على كل إصدار
- 📈 معدل تنزيل التحديثات
- ⚠️ أخطاء التحديثات (إن وجدت)

---

## 📱 معلومات Console في التطبيق

عند تشغيل التطبيق، ستظهر:

```
📱 Update Information:
  - Updates Enabled: true
  - Update ID: xxxx-xxxx-xxxx-xxxx
  - Created At: 2025-11-10T...
  - Runtime Version: 1.0.14
  - Channel: production

🔄 Auto-checking for updates...
```

**إذا كان هناك تحديث:**
```
✅ Update available!
📥 Auto-downloading update in background...
✅ Update downloaded successfully
```

**ثم يظهر Alert للمستخدم:**
```
"تحديث جاهز"
"تم تنزيل إصدار جديد من التطبيق. سيتم تطبيقه عند إعادة فتح التطبيق."

[لاحقاً]  [إعادة التشغيل]
```

---

## ⚙️ إعدادات `eas.json`

```json
{
  "build": {
    "production": {
      "autoIncrement": true,        // ✅ زيادة تلقائية لرقم البناء
      "channel": "production"       // ✅ قناة الإنتاج
    },
    "preview": {
      "distribution": "internal",   // للاختبار الداخلي
      "channel": "preview"
    }
  }
}
```

---

## 🎯 أفضل الممارسات | Best Practices

### 1. **استراتيجية التحديثات**
```bash
# للتغييرات الصغيرة (bug fixes, UI)
eas update --branch production --message "Fixed product display issue"

# للتغييرات الكبيرة (features, breaking changes)
# زيادة version → build → submit للمتجر
```

### 2. **اختبار قبل النشر**
```bash
# 1. بناء preview للاختبار
eas build --platform android --profile preview

# 2. اختبار التحديث OTA على preview
eas update --branch preview --message "Testing new feature"

# 3. بعد التأكد، نشر للإنتاج
eas update --branch production --message "New feature: Categories filter"
```

### 3. **Rollback (التراجع عن تحديث)**
```bash
# العودة لتحديث سابق
eas update:list --branch production  # للحصول على ID
eas branch:publish --branch production --update-id <previous-update-id>
```

---

## 🔐 الأمان | Security

### معلومات حساسة في `app.json`:
```json
"extra": {
  "EXPO_PUBLIC_FIREBASE_API_KEY": "...",
  "EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID": "...",
  // جميع المفاتيح موجودة ✅
}
```

⚠️ **ملاحظة:** هذه المفاتيح عامة ويتم تضمينها في التطبيق. للمعلومات الحساسة استخدم:
- Firebase Security Rules
- Backend API Keys (في السيرفر فقط)

---

## 📊 Timeline النشر المتوقع

### **Google Play Store:**
- ⏱️ المراجعة: 1-3 أيام
- ✅ OTA Updates: فورية (ثوانٍ)

### **App Store:**
- ⏱️ المراجعة: 1-3 أيام (أحياناً 24 ساعة)
- ✅ OTA Updates: فورية (ثوانٍ)

---

## 🎉 الخلاصة | Summary

### ✅ **ما تم إعداده:**
1. ✅ التحديثات الهوائية (OTA) مُفعّلة وتعمل تلقائياً
2. ✅ الفحص التلقائي عند فتح التطبيق
3. ✅ تنزيل تلقائي في الخلفية
4. ✅ **لا حاجة لزر "تحقق من التحديثات"** - كل شيء تلقائي
5. ✅ EAS Build & Submit جاهز للاستخدام

### 📝 **للنشر الأولي:**
```bash
# 1. بناء لكلا المنصتين
eas build --platform all --profile production

# 2. رفع للمتاجر
eas submit --platform all --profile production

# 3. انتظار الموافقة (1-3 أيام)
```

### 🔄 **للتحديثات اللاحقة:**
```bash
# تحديثات سريعة (OTA)
eas update --branch production --message "Bug fixes and improvements"

# تحديثات كبيرة (Native)
# version++ → build → submit
```

---

## 📞 المساعدة | Help

- [Expo EAS Documentation](https://docs.expo.dev/eas/)
- [EAS Build](https://docs.expo.dev/build/introduction/)
- [EAS Submit](https://docs.expo.dev/submit/introduction/)
- [EAS Update](https://docs.expo.dev/eas-update/introduction/)

---

**التطبيق جاهز للنشر العالمي! 🚀**
