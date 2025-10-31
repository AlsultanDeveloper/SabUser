# تفعيل Cloud Functions لإرسال الإشعارات تلقائياً
# Deploy Cloud Functions for Automatic Notifications

## المشكلة | Problem
عند الرد على رسالة دعم من لوحة التحكم، يتم حفظ الرد ولكن **لا يُرسل إشعار** للمستخدم.

When replying to a support message from admin panel, the reply is saved but **notification is NOT sent** to the user.

## الحل | Solution
استخدام Firebase Cloud Functions لإرسال الإشعار **تلقائياً** عند حفظ الرد.

Use Firebase Cloud Functions to send notification **automatically** when reply is saved.

---

## خطوات التفعيل | Deployment Steps

### 1. تثبيت Firebase CLI
```powershell
npm install -g firebase-tools
```

### 2. تسجيل الدخول إلى Firebase
```powershell
firebase login
```

### 3. إنشاء مجلد functions
```powershell
# إنشاء مجلد functions إذا لم يكن موجوداً
New-Item -ItemType Directory -Force -Path "functions"

# نسخ ملف الدوال
Copy-Item "firebase-functions-support.js" -Destination "functions/index.js"
```

### 4. إنشاء package.json للـ functions
قم بإنشاء ملف `functions/package.json`:

```json
{
  "name": "sab-store-functions",
  "version": "1.0.0",
  "description": "Firebase Cloud Functions for Sab Store",
  "engines": {
    "node": "18"
  },
  "main": "index.js",
  "dependencies": {
    "firebase-admin": "^12.0.0",
    "firebase-functions": "^4.0.0"
  }
}
```

### 5. تثبيت الحزم في مجلد functions
```powershell
cd functions
npm install
cd ..
```

### 6. رفع الدوال إلى Firebase
```powershell
firebase deploy --only functions:onSupportMessageReply
```

---

## ما تفعله الدالة | What the Function Does

```javascript
// تعمل تلقائياً عند تحديث أي مستند في supportMessages
// Runs automatically when any document in supportMessages is updated

exports.onSupportMessageReply = functions.firestore
  .document('supportMessages/{messageId}')
  .onUpdate(async (change, context) => {
    // ...
  });
```

### سيناريو العمل | Workflow:

1. **Admin يفتح لوحة التحكم** → يرى رسائل الدعم
2. **Admin يضيف رد** → يحفظ في حقل `reply`
3. **Cloud Function تعمل تلقائياً** → تكتشف إضافة `reply`
4. **تحصل على pushToken للمستخدم**
5. **ترسل إشعار فوري** عبر Expo Push API

---

## كيفية استخدامها من لوحة التحكم | How to Use from Admin Panel

### على Firebase Console:

1. افتح Firestore Database
2. اذهب إلى collection: `supportMessages`
3. افتح المستند الخاص بالرسالة
4. أضف حقل جديد:
   - Field name: `reply`
   - Type: `string`
   - Value: نص الرد (مثال: "شكراً لتواصلك، سنحل المشكلة خلال 24 ساعة")
5. اضغط Save

**النتيجة:** الدالة السحابية سترسل إشعار تلقائياً للمستخدم! 🎉

---

## التحقق من عمل الدالة | Verify Function Works

### 1. شاهد Logs في Firebase Console:
```
https://console.firebase.google.com/project/sab-store-9b947/functions/logs
```

### 2. أو عبر Terminal:
```powershell
firebase functions:log --only onSupportMessageReply
```

### 3. ستظهر رسائل مثل:
```
✅ Support reply notification sent successfully to user: KATVNw...
📱 Expo Push sent to token: ExponentPushToken[x5-k8...]
```

---

## بدائل إذا لم تنجح Cloud Functions | Alternatives

إذا لم تستطع استخدام Cloud Functions، يمكنك:

### الخيار 1: استدعاء دالة من Admin Panel
إذا كان لديك admin panel مخصص (React/Next.js):

```typescript
import { notifySupportMessageReply } from './utils/notifications';

async function handleSendReply(messageId: string, replyText: string) {
  // 1. حفظ الرد في Firestore
  await updateDocument('supportMessages', messageId, {
    reply: replyText,
    status: 'replied',
  });
  
  // 2. إرسال الإشعار
  await notifySupportMessageReply(messageId, replyText);
  
  alert('تم إرسال الرد والإشعار بنجاح!');
}
```

### الخيار 2: استخدام Zapier/Make.com
- أنشئ Webhook يستمع لتغييرات Firestore
- عند إضافة `reply`، استدعِ API endpoint
- الـ endpoint يرسل الإشعار

---

## ملاحظات مهمة | Important Notes

⚠️ **Cloud Functions تحتاج Blaze Plan** (الخطة المدفوعة في Firebase)
- لكن لديك **2 مليون استدعاء مجاني شهرياً**
- كافٍ لمعظم التطبيقات الصغيرة والمتوسطة

✅ **الميزات:**
- ✅ تعمل تلقائياً - لا حاجة لتعديل لوحة التحكم
- ✅ موثوقة - تعمل حتى لو كان التطبيق مغلق
- ✅ سريعة - إشعار فوري بعد الرد
- ✅ آمنة - تعمل على سيرفر Firebase

---

## اختبار سريع | Quick Test

بعد الرفع، جرب:

1. افتح Firebase Console → Firestore
2. اذهب لـ `supportMessages`
3. اختر أي رسالة فيها `userId`
4. أضف حقل `reply` بقيمة: "هذا رد تجريبي"
5. **انتظر 2-3 ثواني**
6. افتح التطبيق → يجب أن تصلك إشعار! 📱

---

## الدعم | Support

إذا واجهت مشاكل:
- تحقق من Logs: `firebase functions:log`
- تأكد من وجود `pushToken` للمستخدم في Firestore
- تأكد من أن الرسالة فيها `userId`
