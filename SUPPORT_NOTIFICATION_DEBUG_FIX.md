# حل مشكلة عدم وصول إشعارات الدعم
# Fix for Support Reply Notifications Not Received

## المشكلة | The Problem

عند إرسال رسالة للدعم من التطبيق، تصل الرسالة للوحة التحكم ✅  
لكن عند الرد من لوحة التحكم، **لا يصل إشعار للمستخدم** ❌

When sending a message to support from the app, the message reaches the admin panel ✅  
But when replying from the admin panel, **no notification reaches the user** ❌

---

## الأسباب المحتملة | Possible Causes

### 1. ❌ Push Token غير مُسجل
المستخدم لم يسجل push token في Firestore

**الأسباب:**
- لم يتم طلب إذن الإشعارات
- تم تسجيل الدخول قبل الحصول على Token
- خطأ في حفظ Token إلى Firestore

### 2. ❌ صلاحيات الإشعارات مرفوضة
المستخدم رفض منح صلاحيات الإشعارات للتطبيق

### 3. ❌ Token منتهي الصلاحية
Push token قديم أو غير صالح

### 4. ❌ الجهاز غير مدعوم
المحاكي لا يدعم push notifications (يحتاج جهاز فعلي)

---

## الحل | The Solution

### ✅ الخطوة 1: التحقق من Push Token

تم إضافة زر "تحقق من Token" في صفحة الإشعارات للتشخيص:

```typescript
// في app/notifications.tsx
const handleCheckPushToken = async () => {
  // احصل على token من Context
  const currentToken = expoPushToken;
  
  // احصل على token من Firestore
  const userProfile = await getDocument(collections.users, user.uid);
  const savedToken = userProfile?.pushToken;
  
  // قارن وأظهر النتيجة
  if (currentToken && savedToken && currentToken === savedToken) {
    // ✅ Token مُسجل بنجاح
  } else if (currentToken && !savedToken) {
    // ⚠️ Token موجود لكن غير محفوظ
    await savePushTokenToUser(user.uid, currentToken);
  }
};
```

**كيفية الاستخدام:**
1. افتح التطبيق
2. اذهب إلى **الإشعارات** (Notifications)
3. اضغط على زر **"تحقق من Token"**
4. ستظهر رسالة تخبرك بحالة Token

---

### ✅ الخطوة 2: تحسين حفظ Push Token

تم تحسين `NotificationContext` لضمان حفظ Token:

```typescript
// في contexts/NotificationContext.tsx

// إضافة logs تفصيلية
const savePushTokenToUser = async (userId: string, token: string) => {
  console.log('💾 Saving push token to user profile:', userId);
  console.log('📱 Token:', token);
  
  const pushTokenData = {
    pushToken: token,
    pushTokenUpdatedAt: new Date().toISOString(),
    platform: Platform.OS, // ✅ إضافة المنصة
  };
  
  // Always try to update or create
  const docSnap = await getDoc(userDocRef);
  if (docSnap.exists()) {
    await updateDoc(userDocRef, pushTokenData);
    console.log('✅ Push token updated successfully');
  } else {
    await setDoc(userDocRef, {
      ...pushTokenData,
      createdAt: new Date().toISOString(),
    });
    console.log('✅ User document created with push token');
  }
};

// إضافة logs في useEffect
useEffect(() => {
  if (user?.uid && expoPushToken) {
    console.log('🔄 User and token available, saving...');
    console.log('👤 User ID:', user.uid);
    console.log('📱 Push Token:', expoPushToken);
    savePushTokenToUser(user.uid, expoPushToken);
  } else {
    if (user?.uid) {
      console.log('⚠️ User available but no push token yet');
    }
    if (expoPushToken) {
      console.log('⚠️ Push token available but no user yet');
    }
  }
}, [user, expoPushToken, savePushTokenToUser]);
```

---

### ✅ الخطوة 3: التحقق من صلاحيات الإشعارات

**على iOS:**
```
Settings → [اسم التطبيق] → Notifications → Allow Notifications ✅
```

**على Android:**
```
Settings → Apps → [اسم التطبيق] → Notifications → Allow ✅
```

---

### ✅ الخطوة 4: اختبار النظام الكامل

#### 1. **تسجيل الخروج وإعادة الدخول**

```bash
# 1. افتح التطبيق
npx expo start

# 2. سجل خروج من التطبيق

# 3. سجل دخول مرة أخرى

# 4. راقب الـ Console:
# يجب أن ترى:
# ✅ "Push token obtained: ExponentPushToken[xxx]"
# ✅ "💾 Saving push token to user profile"
# ✅ "✅ Push token updated successfully"
```

#### 2. **التحقق من Token في Firebase**

```
1. افتح Firebase Console
2. اذهب إلى Firestore Database
3. افتح collection "users"
4. ابحث عن المستخدم الخاص بك
5. تحقق من وجود حقل "pushToken"
6. يجب أن يبدأ بـ "ExponentPushToken[..."
```

#### 3. **اختبار إرسال رسالة دعم**

```
1. من التطبيق: اتصل بالدعم → أرسل رسالة

2. من لوحة التحكم: 
   - افتح Firebase Console
   - Firestore → supportMessages
   - اختر الرسالة
   - أضف حقل "reply" مع نص الرد
   - احفظ

3. يجب أن يصل إشعار للتطبيق! ✅
```

---

## خطوات التشخيص | Diagnostic Steps

### الخطوة 1: افحص الـ Console Logs

عند تشغيل التطبيق، ابحث عن:

```
✅ Push token obtained: ExponentPushToken[xxx]
✅ 💾 Saving push token to user profile: user_123
✅ 📱 Token: ExponentPushToken[xxx]
✅ ✅ Push token updated successfully
```

إذا **لم تظهر** هذه الرسائل:
- ❌ Token لم يُحفظ

إذا ظهرت رسالة خطأ:
- ❌ مشكلة في Firebase أو الأذونات

---

### الخطوة 2: استخدم زر "تحقق من Token"

في صفحة الإشعارات:
1. اضغط "تحقق من Token"
2. اقرأ الرسالة التي تظهر

**الحالات الممكنة:**

#### ✅ Token مُسجل بنجاح
```
✅ الحالة: Token مُسجل بنجاح!
```
**الحل:** كل شيء يعمل! المشكلة قد تكون في لوحة التحكم

#### ⚠️ Token موجود لكن غير محفوظ
```
⚠️ الحالة: Token موجود لكن غير محفوظ!
سيتم حفظه الآن...
✅ تم الحفظ!
```
**الحل:** تم الحفظ تلقائياً، جرب الآن

#### ❌ لم يتم الحصول على Token
```
❌ الحالة: لم يتم الحصول على Token
تأكد من منح صلاحيات الإشعارات
```
**الحل:** راجع صلاحيات الإشعارات (الخطوة 3)

---

### الخطوة 3: التحقق من Firebase Firestore

```javascript
// في Firebase Console → Firestore
users/{userId} يجب أن يحتوي على:
{
  email: "user@example.com",
  pushToken: "ExponentPushToken[xxxxxx]", ← مطلوب!
  pushTokenUpdatedAt: "2025-10-31T...",
  platform: "ios", // أو "android"
  createdAt: "..."
}
```

إذا **لم يوجد `pushToken`**:
1. سجل خروج
2. سجل دخول مرة أخرى
3. اضغط "تحقق من Token"

---

### الخطوة 4: اختبار على جهاز فعلي

⚠️ **المحاكي لا يدعم Push Notifications**

**يجب الاختبار على:**
- ✅ iPhone/iPad فعلي
- ✅ Android device فعلي
- ❌ iOS Simulator (لا يعمل)
- ❌ Android Emulator (قد لا يعمل)

---

## حل سريع | Quick Fix

إذا كانت المشكلة لا تزال موجودة، جرب هذا:

### 1. امسح البيانات وأعد التثبيت

```bash
# احذف التطبيق من الجهاز
# أعد التشغيل
npx expo start --clear

# سجل دخول من جديد
```

### 2. تحديث Push Token يدوياً

```typescript
// في التطبيق، استخدم زر "تحقق من Token"
// سيحفظ Token تلقائياً إذا لم يكن موجوداً
```

### 3. التحقق من Firebase Functions

إذا كنت تستخدم Firebase Functions للرد على الدعم:

```javascript
// firebase-functions-support.js
exports.onSupportMessageReply = functions.firestore
  .document('supportMessages/{messageId}')
  .onUpdate(async (change, context) => {
    // تأكد أن هذه Function منشورة
    // firebase deploy --only functions:onSupportMessageReply
  });
```

---

## الملفات المُعدّلة | Modified Files

### 1. `contexts/NotificationContext.tsx`
✅ إضافة logs تفصيلية  
✅ إضافة حقل `platform`  
✅ تحسين معالجة الأخطاء

### 2. `app/notifications.tsx`
✅ إضافة زر "تحقق من Token"  
✅ إضافة دالة `handleCheckPushToken`  
✅ عرض معلومات Token للمستخدم

---

## الاختبار النهائي | Final Test

### خطوات الاختبار الكاملة:

```
1. ✅ سجل خروج من التطبيق

2. ✅ أغلق التطبيق تماماً

3. ✅ افتح التطبيق من جديد
   npx expo start

4. ✅ سجل دخول (Email/Google/Apple)

5. ✅ اذهب للإشعارات → اضغط "تحقق من Token"
   يجب أن ترى: "✅ Token مُسجل بنجاح"

6. ✅ اذهب للدعم → أرسل رسالة اختبار

7. ✅ من Firebase Console:
   - Firestore → supportMessages → [رسالتك]
   - أضف حقل "reply": "شكراً على تواصلك!"
   - احفظ

8. ✅ يجب أن يصل إشعار للتطبيق! 🎉
```

---

## استكشاف الأخطاء | Troubleshooting

### المشكلة: "لم يصل الإشعار"

**تحقق من:**

1. ✅ **Push Token مُسجل في Firestore؟**
   ```
   Firebase Console → Firestore → users → [userId] → pushToken
   ```

2. ✅ **صلاحيات الإشعارات ممنوحة؟**
   ```
   Settings → App → Notifications → Enabled
   ```

3. ✅ **الجهاز فعلي (ليس محاكي)؟**
   ```
   المحاكي لا يدعم push notifications
   ```

4. ✅ **Firebase Function منشورة؟**
   ```
   firebase deploy --only functions:onSupportMessageReply
   ```

5. ✅ **الرد تم إضافته في Firestore؟**
   ```
   supportMessages → [messageId] → reply: "نص الرد"
   ```

---

### المشكلة: "خطأ عند حفظ Token"

```
❌ Error saving push token: [Firebase: Error...]
```

**الحل:**
1. تحقق من Firebase Rules:
   ```javascript
   match /users/{userId} {
     allow write: if request.auth.uid == userId;
   }
   ```

2. تحقق من الاتصال بالإنترنت

3. أعد تسجيل الدخول

---

### المشكلة: "Token = undefined"

```
⚠️ Push token available but no user yet
```

**الحل:**
1. سجل خروج
2. سجل دخول مرة أخرى
3. انتظر 5 ثوان
4. اضغط "تحقق من Token"

---

## ملخص الحل | Solution Summary

### ما تم إصلاحه:

1. ✅ **إضافة logs تفصيلية** في NotificationContext
2. ✅ **إضافة زر تشخيص** في صفحة الإشعارات
3. ✅ **تحسين حفظ Token** مع إضافة platform
4. ✅ **معالجة أفضل للأخطاء**

### كيف تتأكد أن كل شيء يعمل:

```
1. اضغط "تحقق من Token" في الإشعارات
2. يجب أن ترى: "✅ Token مُسجل بنجاح"
3. أرسل رسالة دعم واختبر الرد
4. يجب أن يصل الإشعار! 🎊
```

---

**تاريخ الإصلاح:** 31 أكتوبر 2025  
**الحالة:** ✅ تم الإصلاح مع أدوات تشخيص
