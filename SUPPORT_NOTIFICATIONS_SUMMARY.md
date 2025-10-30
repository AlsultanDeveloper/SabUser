# ملخص نظام إشعارات الدعم
# Support Notifications System Summary

تم إضافة نظام كامل لإرسال إشعارات للمستخدمين عند الرد على رسائل الدعم الخاصة بهم.

---

## ✅ ما تم إضافته

### 1. دوال الإشعارات في `utils/notifications.ts`

تمت إضافة الدوال التالية:

#### `sendPushNotification()`
- إرسال إشعار لجهاز واحد
- تُستخدم لإرسال إشعارات فردية

#### `sendBulkPushNotifications()`
- إرسال إشعارات لعدة أجهزة
- تُستخدم لإرسال إشعارات جماعية

#### `notifySupportMessageReply()` ⭐ جديد
- **الغرض:** إرسال إشعار للمستخدم عند الرد على رسالة الدعم
- **المدخلات:**
  - `supportMessageId`: معرف رسالة الدعم
  - `replyText`: نص الرد
- **الإخراج:** `true` إذا تم الإرسال بنجاح، `false` إذا فشل

**مثال الاستخدام:**
```typescript
import { notifySupportMessageReply } from '@/utils/notifications';

await notifySupportMessageReply('message_123', 'شكراً على تواصلك!');
```

---

### 2. Firebase Cloud Functions في `firebase-functions-support.js`

تمت إضافة 4 دوال سحابية:

#### `onSupportMessageReply` ⭐ الرئيسية
- **تعمل تلقائياً** عند تحديث رسالة دعم
- ترسل إشعار للمستخدم عند إضافة رد جديد
- لا تحتاج لأي استدعاء يدوي

#### `onNewOrder`
- إرسال إشعار للإدارة عند طلب جديد
- مفيد للوحة التحكم

#### `cleanupOldNotifications`
- حذف الإشعارات القديمة (> 30 يوم)
- تعمل تلقائياً يومياً

#### `onNewUser`
- إرسال رسالة ترحيبية للمستخدمين الجدد
- تعمل تلقائياً عند التسجيل

---

### 3. ملفات التوثيق

#### `SUPPORT_NOTIFICATIONS_GUIDE.md`
دليل شامل يشرح:
- كيفية عمل نظام الإشعارات
- 3 طرق لإرسال الإشعارات
- أمثلة عملية للاستخدام
- معالجة الإشعارات في التطبيق
- Firebase Security Rules

#### `FIREBASE_FUNCTIONS_DEPLOYMENT.md`
دليل النشر الكامل:
- خطوات تثبيت Firebase CLI
- كيفية نشر الدوال
- الاختبار المحلي
- مراقبة السجلات
- استكشاف الأخطاء
- التكاليف المتوقعة

---

## 🚀 كيفية البدء

### الطريقة 1: Firebase Functions (موصى بها) - تلقائي 100%

**1. تثبيت Firebase CLI:**
```bash
npm install -g firebase-tools
firebase login
```

**2. تهيئة Functions:**
```bash
firebase init functions
```

**3. نسخ الكود:**
```bash
Copy-Item firebase-functions-support.js functions/index.js
```

**4. النشر:**
```bash
cd functions
npm install
cd ..
firebase deploy --only functions
```

**5. تم! 🎉**
الآن عند الرد على أي رسالة دعم من Firebase Console، سيتم إرسال إشعار تلقائياً!

---

### الطريقة 2: من لوحة التحكم - يدوي

إذا كان لديك admin panel:

```typescript
import { notifySupportMessageReply } from '@/utils/notifications';
import { updateDocument, collections } from '@/constants/firestore';

async function handleReply(messageId, replyText) {
  // 1. حفظ الرد
  await updateDocument(collections.supportMessages, messageId, {
    reply: replyText,
    status: 'replied',
    repliedAt: new Date().toISOString(),
  });
  
  // 2. إرسال الإشعار
  await notifySupportMessageReply(messageId, replyText);
}
```

---

## 📱 كيف يعمل النظام

### للمستخدم:

1. **إرسال رسالة دعم:**
   ```
   المستخدم يفتح "اتصل بالدعم" ← يكتب رسالته ← يرسل
   ```

2. **الانتظار:**
   ```
   الرسالة تُحفظ في Firestore
   ```

3. **استلام الإشعار:**
   ```
   فريق الدعم يرد ← Firebase Function ترسل إشعار ← المستخدم يستلم
   ```

4. **قراءة الرد:**
   ```
   المستخدم ينقر على الإشعار ← يفتح التطبيق ← يرى الرد
   ```

---

### للإدارة:

**عبر Firebase Console:**
```
1. فتح Firebase Console
2. Firestore Database → supportMessages
3. اختيار الرسالة
4. إضافة حقل "reply" مع نص الرد
5. تحديث "status" إلى "replied"
6. حفظ ← الإشعار يُرسل تلقائياً ✅
```

**عبر Admin Panel (إن وُجد):**
```
1. فتح رسائل الدعم
2. اختيار رسالة
3. كتابة الرد
4. الضغط على "إرسال"
5. الكود يحفظ الرد ويرسل الإشعار معاً
```

---

## 🔔 شكل الإشعار

```
┌────────────────────────────────────┐
│ 💬 رد من فريق الدعم | Support Reply │
├────────────────────────────────────┤
│ شكراً على تواصلك معنا. تم حل       │
│ المشكلة وسيتم معالجة طلبك...       │
└────────────────────────────────────┘
```

---

## ✨ مميزات النظام

- ✅ **تلقائي بالكامل** (مع Firebase Functions)
- ✅ **ثنائي اللغة** (عربي/إنجليزي)
- ✅ **سريع** (إشعار فوري)
- ✅ **آمن** (Firebase Security Rules)
- ✅ **موفر** (ضمن الحصة المجانية)
- ✅ **قابل للتوسع** (يدعم آلاف المستخدمين)

---

## 📊 البيانات المطلوبة

### في `users` collection:
```json
{
  "uid": "user_123",
  "email": "user@example.com",
  "pushToken": "ExponentPushToken[xxx]",  ← مطلوب للإشعارات
  "role": "user"  // أو "admin" للإدارة
}
```

### في `supportMessages` collection:
```json
{
  "id": "msg_123",
  "userId": "user_123",  ← ربط مع المستخدم
  "name": "Ahmed",
  "email": "ahmed@example.com",
  "message": "سؤالي هو...",
  "status": "pending",  // pending → replied → resolved
  "read": false,
  "createdAt": "2025-10-31T10:00:00Z",
  "updatedAt": "2025-10-31T10:00:00Z",
  
  // تُضاف عند الرد:
  "reply": "الجواب هو...",
  "repliedAt": "2025-10-31T12:00:00Z"
}
```

---

## 🎯 الخطوات التالية

1. **نشر Firebase Functions** (راجع `FIREBASE_FUNCTIONS_DEPLOYMENT.md`)
2. **اختبار النظام** (أرسل رسالة دعم واختبر الرد)
3. **تخصيص الإشعارات** (يمكن تغيير النصوص والأيقونات)
4. **إضافة شاشة عرض الردود** (اختياري - لعرض تاريخ المحادثات)

---

## 📞 دعم فني

راجع الملفات التالية للمزيد:
- `SUPPORT_NOTIFICATIONS_GUIDE.md` - دليل الإشعارات الشامل
- `FIREBASE_FUNCTIONS_DEPLOYMENT.md` - دليل النشر
- `NOTIFICATIONS_GUIDE.md` - دليل عام للإشعارات
- `FIRESTORE_STRUCTURE.md` - هيكل قاعدة البيانات

---

**تاريخ الإنشاء:** 31 أكتوبر 2025
**الحالة:** ✅ جاهز للاستخدام
