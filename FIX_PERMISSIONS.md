# إصلاح مشكلة الصلاحيات - Cloud Functions
# Fix Permissions Issue - Cloud Functions

## المشكلة | Problem:
```
Error: 7 PERMISSION_DENIED: Missing or insufficient permissions.
```

الدالة السحابية **تعمل** ولكنها لا تستطيع قراءة بيانات Firestore!

---

## الحل | Solution:

### الطريقة 1: منح صلاحيات Admin SDK (موصى به) ⭐

تحديث IAM Permissions من Google Cloud Console:

1. **افتح Google Cloud Console:**
   ```
   https://console.cloud.google.com/iam-admin/iam?project=sab-store-9b947
   ```

2. **ابحث عن Service Account:**
   ```
   263235150197-compute@developer.gserviceaccount.com
   ```

3. **اضغط Edit (✏️)**

4. **أضف Role جديد:**
   - اضغط **"Add Another Role"**
   - ابحث عن: **"Cloud Datastore User"**
   - أو: **"Firebase Admin SDK Administrator Service Agent"**

5. **احفظ التغييرات**

---

### الطريقة 2: تحديث Firestore Rules (حل سريع)

**⚠️ تحذير:** هذه الطريقة تفتح Firestore للقراءة من Server Side فقط

افتح Firestore Rules:
```
https://console.firebase.google.com/project/sab-store-9b947/firestore/rules
```

أضف قاعدة للـ Service Account:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // السماح للـ Cloud Functions بالقراءة والكتابة
    // Allow Cloud Functions to read/write
    match /{document=**} {
      allow read, write: if request.auth != null;
      // السماح لـ Service Account (Cloud Functions)
      allow read, write: if request.auth.token.email == '263235150197-compute@developer.gserviceaccount.com';
    }
    
    // أو استخدم هذه القاعدة البسيطة (للتطوير فقط):
    // match /{document=**} {
    //   allow read, write: if true;  // ⚠️ للتطوير فقط!
    // }
  }
}
```

---

### الطريقة 3: استخدام Service Account Key (الأكثر أماناً) 🔐

1. **إنشاء Service Account Key:**
   ```
   https://console.cloud.google.com/iam-admin/serviceaccounts?project=sab-store-9b947
   ```

2. **اختر Service Account → Actions → Create Key**

3. **حمّل JSON Key**

4. **ارفع الـ Key إلى Functions:**
   
   في `functions/index.js`، غيّر التهيئة:
   
   ```javascript
   const admin = require('firebase-admin');
   const serviceAccount = require('./serviceAccountKey.json');
   
   admin.initializeApp({
     credential: admin.credential.cert(serviceAccount)
   });
   ```

5. **أعد رفع الدالة:**
   ```powershell
   firebase deploy --only functions
   ```

---

## الحل الأسرع (للاختبار فقط) ⚡

**مؤقتاً**، افتح Firestore Rules للجميع:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;  // ⚠️ للتطوير فقط!
    }
  }
}
```

**⚠️ تحذير:** هذا يجعل قاعدة البيانات مفتوحة للجميع! **استخدمه للاختبار فقط ثم أغلقه!**

---

## التنفيذ السريع | Quick Fix

### الخطوة 1: افتح Firestore Rules

تم فتح الصفحة في المتصفح!

### الخطوة 2: استبدل القواعد

الصق هذا الكود (للاختبار):

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null || true;
    }
  }
}
```

### الخطوة 3: اضغط **Publish**

### الخطوة 4: جرب إضافة الرد مرة أخرى!

---

## التحقق من نجاح الإصلاح | Verify Fix

بعد تحديث الصلاحيات:

1. **اذهب إلى Firebase Console → Firestore**
2. **افتح أي رسالة دعم**
3. **أضف حقل `reply`**
4. **راقب Logs:**
   ```powershell
   firebase functions:log
   ```

**يجب أن ترى:**
```
Support message updated: [messageId]
Notification sent successfully ✅
```

**بدلاً من:**
```
Error: PERMISSION_DENIED ❌
```

---

## ملاحظات مهمة | Important Notes

1. **بعد الاختبار:** أعد قواعد Firestore إلى الوضع الآمن!

2. **للإنتاج:** استخدم الطريقة 1 (IAM Permissions) أو الطريقة 3 (Service Account Key)

3. **Cloud Functions** تعمل من Server Side، لذا لا تخضع لنفس قواعد الأمان

---

## الحل النهائي الآمن | Final Secure Solution

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // للمستخدمين المسجلين
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // للطلبات
    match /orders/{orderId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }
    
    // لرسائل الدعم
    match /supportMessages/{messageId} {
      allow read, write: if request.auth != null;
    }
    
    // للباقي - قراءة فقط للمسجلين
    match /{document=**} {
      allow read: if request.auth != null;
    }
  }
}
```

هذه القواعد تسمح للمستخدمين المسجلين (including Cloud Functions service account) بالوصول!

---

**الآن:** افتح Firestore Rules وحدّثها، ثم جرب إضافة الرد مرة أخرى! 🚀
