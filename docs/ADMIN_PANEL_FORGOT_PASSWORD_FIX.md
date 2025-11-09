# 🔧 إصلاح Forgot Password في لوحة التحكم (Next.js)

## المشكلة
عند طلب reset password من لوحة التحكم، المستخدم يتحول لنفس الصفحة اللي للتطبيق.

---

## ✅ الحل في Next.js Admin Panel

### 1️⃣ عدّل صفحة Forgot Password في Next.js:

**الموقع:** `pages/forgot-password.tsx` أو `app/forgot-password/page.tsx`

```typescript
import { useState } from 'react';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '@/lib/firebase'; // أو المسار الصحيح

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim()) {
      alert('الرجاء إدخال البريد الإلكتروني');
      return;
    }

    setLoading(true);
    try {
      // ✅ الحل: إرسال reset email مع continue URL للوحة التحكم
      await sendPasswordResetEmail(auth, email.trim(), {
        url: 'https://admin.sab-store.com/reset-complete', // ✅ للأدمن فقط
        handleCodeInApp: false,
      });

      setEmailSent(true);
      alert('تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني');
    } catch (error: any) {
      console.error('Password reset error:', error);
      
      let errorMessage = 'فشل إرسال البريد. حاول مرة أخرى.';
      
      if (error.code === 'auth/user-not-found') {
        errorMessage = 'لا يوجد حساب بهذا البريد الإلكتروني';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'بريد إلكتروني غير صالح';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'محاولات كثيرة. حاول لاحقاً';
      }
      
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-600 to-indigo-600">
      <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-md w-full">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">🔐 نسيت كلمة المرور؟</h1>
          <p className="text-gray-600 mt-2">أدخل بريدك الإلكتروني لإعادة تعيين كلمة المرور</p>
        </div>

        {!emailSent ? (
          <form onSubmit={handleResetPassword}>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">البريد الإلكتروني</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-purple-600 focus:outline-none"
                placeholder="admin@sab-store.com"
                required
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-3 rounded-lg font-semibold hover:opacity-90 disabled:opacity-50 transition"
            >
              {loading ? 'جاري الإرسال...' : 'إرسال رابط إعادة التعيين'}
            </button>
          </form>
        ) : (
          <div className="text-center">
            <div className="text-6xl mb-4">✅</div>
            <p className="text-green-600 font-semibold mb-4">
              تم إرسال رابط إعادة التعيين!
            </p>
            <p className="text-gray-600">
              تحقق من بريدك الإلكتروني واتبع التعليمات
            </p>
          </div>
        )}

        <div className="mt-6 text-center">
          <a href="/login" className="text-purple-600 hover:underline">
            العودة إلى تسجيل الدخول
          </a>
        </div>
      </div>
    </div>
  );
}
```

---

### 2️⃣ إنشاء صفحة `/reset-complete` في Next.js:

**الموقع:** `pages/reset-complete.tsx` أو `app/reset-complete/page.tsx`

```typescript
'use client'; // إذا كنت تستخدم App Router

import { useEffect } from 'react';
import { useRouter } from 'next/navigation'; // أو 'next/router' للـ Pages Router

export default function ResetCompletePage() {
  const router = useRouter();

  useEffect(() => {
    // التوجيه تلقائياً للوحة التحكم بعد 2 ثانية
    const timer = setTimeout(() => {
      router.push('/login');
    }, 2000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-600 to-indigo-600">
      <div className="bg-white p-12 rounded-2xl shadow-2xl text-center max-w-md">
        <div className="text-8xl mb-6">✅</div>
        <h1 className="text-3xl font-bold text-gray-800 mb-4">
          تم تغيير كلمة المرور بنجاح!
        </h1>
        <p className="text-gray-600 mb-6">
          جاري تحويلك إلى صفحة تسجيل الدخول...
        </p>
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-600"></div>
        </div>
      </div>
    </div>
  );
}
```

---

### 3️⃣ في Firebase Console:

**تأكد من:**

1. **Authentication** → **Settings** → **Authorized domains**
   - ✅ `admin.sab-store.com` مضاف
   - ✅ `sab-store.com` مضاف

2. **لا تحتاج تغيير Email Templates** - Continue URL يحل المشكلة!

---

## 🎯 النتيجة النهائية:

### من التطبيق (React Native):
```
User → Forgot Password →
Email مع url: sab-store.com/reset-complete →
✅ يفتح التطبيق بعد Reset
```

### من لوحة التحكم (Next.js):
```
Admin → Forgot Password →
Email مع url: admin.sab-store.com/reset-complete →
✅ يروح للوحة التحكم بعد Reset
```

---

## 📝 ملاحظات مهمة:

1. **Continue URL** مختلف لكل مشروع:
   - التطبيق: `sab-store.com/reset-complete`
   - لوحة التحكم: `admin.sab-store.com/reset-complete`

2. **Firebase يستخدم نفس Authentication**، لكن التوجيه بعد Reset مختلف

3. **Styling:** عدّل الـ CSS حسب theme لوحة التحكم الخاصة بك

4. إذا كنت تستخدم **App Router** في Next.js 13+:
   - استخدم `'use client'` في أول الملف
   - استخدم `useRouter` from `'next/navigation'`

5. إذا كنت تستخدم **Pages Router**:
   - استخدم `useRouter` from `'next/router'`
   - احذف `'use client'`

---

## ✅ الخلاصة:

الحل بسيط جداً:
- في **React Native** → `url: 'sab-store.com/reset-complete'`
- في **Next.js Admin** → `url: 'admin.sab-store.com/reset-complete'`

**كل واحد يروح للمكان الصحيح!** 🎉

---

## 🔗 ملفات ذات صلة:
- `FIREBASE_PASSWORD_RESET_SETUP.md` - الشرح الكامل
- `app/auth/forgot-password.tsx` - تطبيق React Native (✅ جاهز)
- Next.js Admin Pages - تحتاج تطبيق الكود أعلاه
