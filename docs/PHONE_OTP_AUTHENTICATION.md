# 📱 Phone OTP Authentication System

## نظام تسجيل الدخول برمز التحقق عبر الجوال

---

## 📋 نظرة عامة

تم تطبيق نظام تسجيل دخول كامل باستخدام **رمز التحقق (OTP)** المرسل عبر **Push Notifications** - بدون الحاجة لرسائل SMS المكلفة!

### ✅ المميزات:
- 🆓 **مجاني تماماً** - لا تكاليف لرسائل SMS
- ⚡ **فوري** - يصل الإشعار خلال ثوانٍ
- 🔒 **آمن** - كود OTP مكون من 6 أرقام
- ⏱️ **صلاحية محدودة** - 5 دقائق فقط
- 🔄 **إعادة إرسال** - بعد 60 ثانية
- 🛡️ **حماية من الهجمات** - حد أقصى 5 محاولات
- 👤 **إنشاء حساب تلقائي** - للمستخدمين الجدد

---

## 🏗️ البنية المعمارية

### 1. **Cloud Functions** (`functions/index.js`)

#### `sendPhoneOTP`
```javascript
// الوظيفة: توليد كود OTP وإرساله عبر Push Notification
exports.sendPhoneOTP = onCall(async (request) => {
  const { phoneNumber, pushToken } = request.data;
  
  // 1. توليد كود عشوائي من 6 أرقام
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  
  // 2. حفظه في Firestore مع انتهاء صلاحية بعد 5 دقائق
  await firestore.collection('phoneOTPs').doc(phoneNumber).set({
    otp,
    expiresAt: Date.now() + 5 * 60 * 1000,
    verified: false,
    attempts: 0
  });
  
  // 3. إرسال Push Notification
  await sendPushNotification(pushToken, `Your code: ${otp}`);
});
```

#### `verifyPhoneOTP`
```javascript
// الوظيفة: التحقق من الكود وإنشاء/تحديث المستخدم
exports.verifyPhoneOTP = onCall(async (request) => {
  const { phoneNumber, otp } = request.data;
  
  // 1. التحقق من الكود والصلاحية
  const otpDoc = await firestore.collection('phoneOTPs').doc(phoneNumber).get();
  
  // 2. إنشاء مستخدم جديد أو تحديث موجود
  if (userNotExists) {
    await createUser(phoneNumber);
  }
  
  // 3. إرجاع userId للواجهة
  return { success: true, userId, isNewUser };
});
```

### 2. **Frontend Service** (`utils/phoneOTP.ts`)

```typescript
// إرسال OTP
export async function sendPhoneOTP(phoneNumber: string) {
  // 1. طلب أذونات Push Notifications
  // 2. الحصول على Push Token
  // 3. استدعاء Cloud Function
  const sendOTP = httpsCallable(functions, 'sendPhoneOTP');
  return await sendOTP({ phoneNumber, pushToken });
}

// التحقق من OTP
export async function verifyPhoneOTP(phoneNumber: string, otp: string) {
  const verifyOTP = httpsCallable(functions, 'verifyPhoneOTP');
  return await verifyOTP({ phoneNumber, otp });
}
```

### 3. **UI Screens**

#### `app/auth/login.tsx`
- خيار "الهاتف" لتسجيل الدخول
- إدخال رقم الجوال
- زر "إرسال رمز التحقق"

#### `app/auth/verify-otp.tsx`
- 6 خانات لإدخال الكود
- عداد زمني 60 ثانية
- زر "إعادة إرسال"
- تحقق تلقائي عند ملء جميع الخانات

### 4. **Authentication Context** (`contexts/AuthContext.tsx`)

```typescript
// دالة تسجيل الدخول بعد التحقق من OTP
const signInWithPhoneOTP = async (userId: string, phoneNumber: string) => {
  // 1. جلب بيانات المستخدم من Firestore
  // 2. تحديث state مع بيانات المستخدم
  // 3. حفظ الجلسة في AsyncStorage
  setState({ user: mockUser });
};
```

---

## 🔄 تدفق العمل (User Flow)

```
1. المستخدم يفتح التطبيق
   ↓
2. يختار "تسجيل الدخول بالجوال"
   ↓
3. يدخل رقم الجوال (+961XXXXXXXX)
   ↓
4. يضغط "إرسال رمز التحقق"
   ↓
5. Cloud Function يولد كود 6 أرقام
   ↓
6. يرسل Push Notification للجوال
   ↓
7. المستخدم يرى الإشعار مع الكود
   ↓
8. يفتح التطبيق ويدخل الكود
   ↓
9. Cloud Function يتحقق من الكود
   ↓
10. إنشاء حساب جديد أو تسجيل دخول
    ↓
11. المستخدم يصل للصفحة الرئيسية ✅
```

---

## 📊 قاعدة البيانات

### Collection: `phoneOTPs`
```javascript
{
  documentId: "+961XXXXXXXX", // رقم الجوال
  fields: {
    phoneNumber: "+961XXXXXXXX",
    otp: "123456",
    createdAt: Timestamp,
    expiresAt: Timestamp, // بعد 5 دقائق
    verified: false,
    attempts: 0
  }
}
```

### Collection: `users`
```javascript
{
  documentId: "auto-generated-id",
  fields: {
    uid: "user-id",
    phoneNumber: "+961XXXXXXXX",
    phoneVerified: true,
    signInMethod: "phone",
    displayName: "+961XXXXXXXX",
    createdAt: Timestamp,
    // ... بقية الحقول
  }
}
```

---

## 🔒 الأمان

### 1. **صلاحية محدودة**
- الكود ينتهي بعد **5 دقائق**
- يتم حذفه تلقائياً بعد التحقق الناجح

### 2. **حد أقصى للمحاولات**
- **5 محاولات فقط** لإدخال الكود
- بعدها يطلب من المستخدم طلب كود جديد

### 3. **عداد زمني لإعادة الإرسال**
- **60 ثانية** بين كل طلب
- يمنع الإزعاج (spam)

### 4. **تشفير**
- الكود يرسل عبر **Firebase Cloud Messaging**
- اتصال مشفر بـ **HTTPS**

---

## 🧪 الاختبار

### 1. **اختبار محلي**
```bash
# تشغيل التطبيق
npx expo start

# اختبار تدفق كامل:
1. اختر "الهاتف" في صفحة تسجيل الدخول
2. أدخل رقم جوال (مثال: +96170123456)
3. اضغط "إرسال رمز التحقق"
4. افتح الإشعارات لرؤية الكود
5. أدخل الكود في الشاشة
6. تحقق من تسجيل الدخول ✅
```

### 2. **اختبار الأخطاء**
- ❌ كود خاطئ → "رمز التحقق غير صحيح"
- ⏱️ كود منتهي → "انتهت صلاحية الرمز"
- 🔒 محاولات كثيرة → "تم تجاوز عدد المحاولات"

---

## 📱 Push Notification Format

```javascript
{
  title: "رمز التحقق | Verification Code",
  body: "رمز التحقق الخاص بك: 123456\nYour verification code: 123456",
  data: {
    type: "phone_otp",
    otp: "123456",
    phoneNumber: "+961XXXXXXXX"
  },
  priority: "high",
  channelId: "default"
}
```

---

## 🚀 النشر

### Cloud Functions
```bash
# نشر الدوال على Firebase
cd functions
firebase deploy --only functions

# التحقق من النشر
firebase functions:log
```

### تحديث التطبيق
```bash
# OTA Update
eas update --branch production --message "Added Phone OTP login"

# أو بناء جديد
eas build --platform all --profile production
```

---

## 📝 الملفات المعدلة

### 1. **Cloud Functions**
- ✅ `functions/index.js` - إضافة `sendPhoneOTP` و `verifyPhoneOTP`

### 2. **Frontend**
- ✅ `utils/phoneOTP.ts` - خدمة OTP
- ✅ `constants/firebase.ts` - تصدير `functions`
- ✅ `app/auth/login.tsx` - إرسال OTP
- ✅ `app/auth/verify-otp.tsx` - شاشة إدخال الكود
- ✅ `contexts/AuthContext.tsx` - `signInWithPhoneOTP`

---

## 💡 نصائح

### للتطوير:
- استخدم رقم جوال حقيقي لتلقي الإشعارات
- تأكد من تفعيل Push Notifications في الجهاز
- تحقق من console logs لتتبع العملية

### للإنتاج:
- راقب عدد الطلبات (Firebase Free Tier: 125K/day)
- فعّل Analytics لتتبع معدل النجاح
- أضف Captcha لحماية إضافية (اختياري)

---

## 🔗 الموارد

- [Firebase Cloud Functions Docs](https://firebase.google.com/docs/functions)
- [Expo Push Notifications](https://docs.expo.dev/push-notifications/overview/)
- [Phone Authentication Best Practices](https://firebase.google.com/docs/auth/android/phone-auth)

---

## ✅ الحالة

**تم التطبيق بنجاح في:** November 10, 2025  
**النسخة:** 1.0.14  
**الحالة:** ✅ جاهز للاستخدام في Production

---

## 📞 الدعم

إذا واجهت أي مشكلة:
1. تحقق من Firebase Console → Functions → Logs
2. تحقق من App Logs في Expo
3. تحقق من Firestore → phoneOTPs collection

**تم بنجاح! 🎉**
