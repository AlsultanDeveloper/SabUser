# دليل نشر Firebase Functions | Firebase Functions Deployment Guide

## نظرة عامة

هذا الدليل يشرح كيفية نشر Firebase Cloud Functions لإرسال إشعارات تلقائية عند الرد على رسائل الدعم.

---

## المتطلبات الأساسية

### 1. تثبيت Firebase CLI

```bash
npm install -g firebase-tools
```

### 2. تسجيل الدخول إلى Firebase

```bash
firebase login
```

### 3. تهيئة Firebase Functions في المشروع

```bash
# في المجلد الرئيسي للمشروع
firebase init functions
```

اختر الإعدادات التالية:
- **Project:** sab-store-9b947
- **Language:** JavaScript
- **ESLint:** Yes
- **Install dependencies:** Yes

---

## إعداد المشروع

### 1. هيكل المجلد

بعد التهيئة، سيكون لديك الهيكل التالي:

```
SabUser/
├── functions/
│   ├── index.js          ← الملف الرئيسي للدوال
│   ├── package.json
│   └── node_modules/
├── firebase.json
└── .firebaserc
```

### 2. نسخ الدوال

انسخ محتوى ملف `firebase-functions-support.js` إلى `functions/index.js`:

```bash
# في PowerShell
Copy-Item firebase-functions-support.js functions/index.js
```

### 3. تحديث package.json

تأكد من أن `functions/package.json` يحتوي على:

```json
{
  "name": "functions",
  "description": "Cloud Functions for Sab Store",
  "scripts": {
    "serve": "firebase emulators:start --only functions",
    "shell": "firebase functions:shell",
    "start": "npm run shell",
    "deploy": "firebase deploy --only functions",
    "logs": "firebase functions:log"
  },
  "engines": {
    "node": "18"
  },
  "main": "index.js",
  "dependencies": {
    "firebase-admin": "^11.8.0",
    "firebase-functions": "^4.3.1"
  }
}
```

---

## نشر الدوال

### نشر جميع الدوال

```bash
cd functions
npm install
cd ..
firebase deploy --only functions
```

### نشر دالة محددة

```bash
# نشر دالة الرد على الدعم فقط
firebase deploy --only functions:onSupportMessageReply

# نشر دالة الطلبات الجديدة فقط
firebase deploy --only functions:onNewOrder
```

---

## الدوال المتاحة

### 1. `onSupportMessageReply`
**الغرض:** إرسال إشعار للمستخدم عند الرد على رسالة الدعم

**المحفز:** تحديث مستند في `supportMessages`

**الاستخدام:**
```javascript
// من لوحة التحكم أو Firebase Console
await updateDocument('supportMessages', messageId, {
  reply: 'شكراً على تواصلك...',
  status: 'replied',
  repliedAt: new Date().toISOString()
});
// سيتم إرسال الإشعار تلقائياً ✅
```

---

### 2. `onNewOrder`
**الغرض:** إرسال إشعار للإدارة عند إنشاء طلب جديد

**المحفز:** إنشاء مستند جديد في `orders`

**ملاحظة:** يتطلب إضافة حقل `role: 'admin'` للمستخدمين الإداريين

---

### 3. `cleanupOldNotifications`
**الغرض:** حذف الإشعارات الأقدم من 30 يوم

**المحفز:** جدولة يومية (منتصف الليل بتوقيت السعودية)

---

### 4. `onNewUser`
**الغرض:** إرسال رسالة ترحيبية للمستخدمين الجدد

**المحفز:** إنشاء مستند جديد في `users`

---

## اختبار الدوال محلياً

### 1. تشغيل المحاكي

```bash
firebase emulators:start
```

### 2. اختبار دالة معينة

```bash
# افتح shell للدوال
firebase functions:shell

# اختبر دالة
> onSupportMessageReply({messageId: 'test123'})
```

---

## مراقبة الدوال

### عرض السجلات في الوقت الفعلي

```bash
firebase functions:log
```

### عرض سجلات دالة معينة

```bash
firebase functions:log --only onSupportMessageReply
```

### عرض السجلات في Firebase Console

1. افتح [Firebase Console](https://console.firebase.google.com)
2. اختر المشروع: sab-store-9b947
3. اذهب إلى **Functions** > **Logs**

---

## استكشاف الأخطاء

### خطأ: "Firebase is not initialized"

**الحل:**
```bash
cd functions
npm install firebase-admin
```

### خطأ: "Permission denied"

**الحل:** تأكد من تسجيل الدخول:
```bash
firebase login
```

### خطأ: "Billing account not configured"

**الحل:** 
1. افتح Firebase Console
2. اذهب إلى **Settings** > **Usage and billing**
3. قم بربط حساب Google Cloud Billing

**ملاحظة:** Firebase Functions تتطلب خطة Blaze (الدفع حسب الاستخدام)، لكن لديها حصة مجانية سخية:
- 2M invocations/month
- 400,000 GB-sec/month
- 200,000 CPU-sec/month

---

## الأمان

### Firebase Security Rules

تأكد من تحديث قواعد Firestore:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /supportMessages/{messageId} {
      allow read: if request.auth != null && 
                     resource.data.userId == request.auth.uid;
      allow create: if true;
      allow update: if request.auth != null && 
                       get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

نشر القواعد:
```bash
firebase deploy --only firestore:rules
```

---

## التكاليف المتوقعة

مع الاستخدام المتوسط (< 100 رسالة دعم يومياً):

- **الحصة المجانية:** كافية تماماً ✅
- **التكلفة المتوقعة:** $0/شهر

مع الاستخدام الكثيف (1000 رسالة يومياً):

- **التكلفة المتوقعة:** < $1/شهر

---

## أوامر مفيدة

```bash
# عرض حالة المشروع
firebase projects:list

# عرض الدوال المنشورة
firebase functions:list

# حذف دالة
firebase functions:delete onSupportMessageReply

# عرض استخدام الدوال
firebase functions:log --open
```

---

## الدعم الفني

للمزيد من المعلومات:
- [Firebase Functions Documentation](https://firebase.google.com/docs/functions)
- [Expo Push Notifications](https://docs.expo.dev/push-notifications/overview/)
- `SUPPORT_NOTIFICATIONS_GUIDE.md` - دليل الإشعارات الكامل

---

**تاريخ آخر تحديث:** 31 أكتوبر 2025
