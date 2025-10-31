# اختبار Cloud Function - إرسال إشعار رد الدعم
# Test Cloud Function - Support Reply Notification

## الخطوات | Steps:

### 1️⃣ افتح Firebase Console
تم فتح صفحة `supportMessages` في المتصفح تلقائياً!

أو افتح يدوياً:
```
https://console.firebase.google.com/project/sab-store-9b947/firestore/databases/-default-/data/~2FsupportMessages
```

---

### 2️⃣ اختر رسالة دعم للرد عليها

في صفحة Firestore:
1. ستجد قائمة برسائل الدعم
2. اختر أي رسالة **فيها `userId`** (مهم!)
3. اضغط عليها لفتحها

---

### 3️⃣ أضف حقل الرد `reply`

في صفحة تفاصيل الرسالة:

1. اضغط على **"Add field"** أو **"إضافة حقل"**

2. املأ البيانات:
   - **Field name:** `reply`
   - **Type:** `string`
   - **Value:** اكتب نص الرد (مثال: "شكراً لتواصلك! سنحل المشكلة خلال 24 ساعة 🙏")

3. اضغط **"Save"** أو **"حفظ"**

---

### 4️⃣ راقب السجلات (Logs)

افتح Terminal جديد وشغل:

```powershell
firebase functions:log --only onSupportMessageReply
```

أو افتح من المتصفح:
```
https://console.firebase.google.com/project/sab-store-9b947/functions/logs
```

**ما يجب أن تراه في Logs:**
```
Support message updated: [messageId]
Notification sent successfully
✅ Support reply notification sent successfully to user: [userId]
```

---

### 5️⃣ تحقق من التطبيق 📱

على جهازك (أو المحاكي):
- يجب أن يصلك إشعار فوري! 📱
- العنوان: **"رد من فريق الدعم"**
- المحتوى: نص الرد الذي كتبته

---

## 🔍 استكشاف الأخطاء | Troubleshooting

### إذا لم يصل الإشعار:

#### 1. تحقق من Logs
```powershell
firebase functions:log
```

**ابحث عن:**
- ❌ `No userId found` → الرسالة ليس فيها userId
- ❌ `User not found` → المستخدم غير موجود
- ❌ `No push token` → المستخدم ليس لديه pushToken

#### 2. تحقق من pushToken في Firestore

افتح:
```
https://console.firebase.google.com/project/sab-store-9b947/firestore/databases/-default-/data/~2Fusers
```

ابحث عن المستخدم وتأكد من وجود حقل `pushToken` بقيمة مثل:
```
ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]
```

#### 3. تحقق من الأذونات (Permissions)

في التطبيق، اذهب إلى:
- الإعدادات → الإشعارات
- اضغط زر **"إعادة"** (Retry) لإعادة طلب الأذونات
- امنح التطبيق إذن الإشعارات

---

## 🎯 اختبار سريع بدون رسالة حقيقية

إذا لم تكن هناك رسائل دعم، يمكنك إنشاء واحدة تجريبية:

### من Firebase Console:

1. اذهب إلى `supportMessages`
2. اضغط **"Add document"**
3. املأ:
   ```
   Document ID: (auto-generated)
   
   Fields:
   - name: "اختبار"
   - phoneNumber: "+966500000000"
   - message: "رسالة اختبار"
   - userId: "KATVNw7VXXPAwZauqsWh5Slubu42" (userId الخاص بك)
   - status: "pending"
   - read: false
   - createdAt: (timestamp - الآن)
   ```
4. اضغط **Save**

الآن:
5. افتح الرسالة مرة أخرى
6. أضف حقل `reply` كما في الخطوة 3 أعلاه
7. انتظر الإشعار! 🎉

---

## 📊 النتيجة المتوقعة | Expected Result

✅ **إذا نجح الاختبار:**
- يصل إشعار فوري للتطبيق
- تظهر رسالة في Logs: "Notification sent successfully"
- المستخدم يمكنه فتح التطبيق ورؤية الرد

✅ **الميزات:**
- الإشعار يعمل حتى لو كان التطبيق مغلق
- الدالة تعمل تلقائياً بدون أي كود إضافي
- لا حاجة لاستدعاء API يدوياً

---

## 🎉 بعد نجاح الاختبار

الآن يمكنك:
1. استخدام Firebase Console للرد على رسائل الدعم
2. الردود سترسل إشعارات تلقائياً
3. المستخدمون سيتلقون إشعارات فورية

**ملاحظة:** يمكنك أيضاً إنشاء لوحة تحكم مخصصة (Admin Panel) تستخدم نفس الطريقة:
- تضيف حقل `reply` في Firestore
- الدالة السحابية تعمل تلقائياً
- لا حاجة لاستدعاء دالة الإشعار يدوياً!

---

## 🔗 روابط مفيدة | Useful Links

- [Firebase Console - Firestore](https://console.firebase.google.com/project/sab-store-9b947/firestore)
- [Firebase Console - Functions Logs](https://console.firebase.google.com/project/sab-store-9b947/functions/logs)
- [Expo Push Notification Tool](https://expo.dev/notifications)

---

**جاهز للاختبار! 🚀**

افتح Firebase Console الآن وجرب إضافة رد على أي رسالة دعم!
