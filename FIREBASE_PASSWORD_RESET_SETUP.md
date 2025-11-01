# 🔐 Firebase Password Reset Setup للتطبيق

## المشكلة الحالية
عند reset password، Firebase يوجه المستخدم إلى:
- ❌ `admin.sab-store.com` (لوحة التحكم)
- نحتاج التوجيه إلى التطبيق للـ users، ولوحة التحكم للـ admins

---

## ✅ الحل: Continue URL مختلف لكل نوع مستخدم

### استراتيجية الحل:
- **Users** (من التطبيق): `continueUrl = https://sab-store.com/reset-complete`
- **Admins** (من لوحة التحكم): `continueUrl = https://admin.sab-store.com/reset-complete`

---

## 📱 1️⃣ في التطبيق (للـ Users)

### في `forgot-password.tsx`:

```typescript
await sendPasswordResetEmail(auth, email.trim(), {
  url: 'https://sab-store.com/reset-complete', // ✅ للـ users
  handleCodeInApp: false,
});
```

### صفحة `sab-store.com/reset-complete`:

```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Password Reset Complete - SAB Store</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            background: linear-gradient(135deg, #8B5CF6 0%, #6366F1 100%);
            margin: 0;
            padding: 20px;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .container {
            background: white;
            padding: 40px;
            border-radius: 20px;
            max-width: 400px;
            width: 100%;
            text-align: center;
        }
        h1 { color: #8B5CF6; }
        .success { color: #059669; font-size: 64px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="success">✅</div>
        <h1>Password Reset Complete!</h1>
        <p>Your password has been changed successfully.</p>
        <p>Opening SAB Store app...</p>
    </div>

    <script>
        // فتح التطبيق
        setTimeout(() => {
            window.location.href = 'sabstore://auth/login';
            
            // Fallback بعد ثانية
            setTimeout(() => {
                document.body.innerHTML = `
                    <div style="text-align: center; padding: 40px;">
                        <h2>Open the SAB Store App</h2>
                        <a href="sabstore://auth/login" 
                           style="display: inline-block; padding: 15px 30px; 
                                  background: linear-gradient(135deg, #8B5CF6, #6366F1); 
                                  color: white; text-decoration: none; 
                                  border-radius: 10px; font-weight: bold;">
                            Open App
                        </a>
                    </div>
                `;
            }, 1000);
        }, 2000);
    </script>
</body>
</html>
```

---

## 💼 2️⃣ في لوحة التحكم (للـ Admins)

### في Admin Panel forgot password:

```typescript
await sendPasswordResetEmail(auth, email, {
  url: 'https://admin.sab-store.com/reset-complete', // ✅ للـ admins
  handleCodeInApp: false,
});
```

### صفحة `admin.sab-store.com/reset-complete`:

```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Password Reset Complete - Admin Panel</title>
</head>
<body>
    <div style="text-align: center; padding: 40px;">
        <h1>✅ Password Reset Complete!</h1>
        <p>Your password has been changed successfully.</p>
        <p>Redirecting to admin login...</p>
    </div>

    <script>
        // التوجيه للوحة التحكم
        setTimeout(() => {
            window.location.href = '/login';
        }, 2000);
    </script>
</body>
</html>
```

---

## 🎯 التدفق النهائي

### للـ Users (من التطبيق):
1. User يضغط "Forgot Password" في التطبيق
2. App يرسل email مع `url: sab-store.com/reset-complete`
3. User يفتح Email ويضغط الرابط
4. Firebase default page لتغيير كلمة المرور
5. بعد النجاح → يروح لـ `sab-store.com/reset-complete`
6. الصفحة تفتح التطبيق تلقائياً ✅

### للـ Admins (من لوحة التحكم):
1. Admin يضغط "Forgot Password" في لوحة التحكم
2. Admin Panel يرسل email مع `url: admin.sab-store.com/reset-complete`
3. Admin يفتح Email ويضغط الرابط
4. Firebase default page لتغيير كلمة المرور
5. بعد النجاح → يروح لـ `admin.sab-store.com/reset-complete`
6. الصفحة توجهه للوحة التحكم ✅

---

## ⚙️ الإعدادات المطلوبة

### في Firebase Console:

1. **Authentication → Settings → Authorized domains**
   - ✅ أضف: `sab-store.com`
   - ✅ أضف: `admin.sab-store.com`

2. **لا تحتاج تغيير Action URL** - نستخدم Continue URL بدلاً منه

### على السيرفر:

- ✅ ارفع `reset-complete` على `sab-store.com`
- ✅ ارفع `reset-complete` على `admin.sab-store.com`

### في التطبيق (app.json):

```json
{
  "expo": {
    "scheme": "sabstore",
    "android": {
      "intentFilters": [
        {
          "action": "VIEW",
          "data": [{ "scheme": "sabstore" }],
          "category": ["BROWSABLE", "DEFAULT"]
        }
      ]
    }
  }
}
```

---

## 🔍 للاختبار

### اختبار Users:
1. افتح التطبيق → Forgot Password
2. أدخل email
3. افتح Email → اضغط الرابط
4. غير كلمة المرور
5. ✅ يجب أن يفتح التطبيق

### اختبار Admins:
1. افتح لوحة التحكم → Forgot Password
2. أدخل email
3. افتح Email → اضغط الرابط
4. غير كلمة المرور
5. ✅ يجب أن يروح للوحة التحكم

---

## 🎨 المميزات

- ✅ كل نوع مستخدم يروح للمكان الصحيح
- ✅ ما في تضارب بين Users و Admins
- ✅ تجربة سلسة لكل الأطراف
- ✅ استخدام Firebase بالطريقة الصحيحة

---

## 📝 ملاحظات مهمة

1. **Continue URL** يختلف عن **Action URL**:
   - Action URL: صفحة Firebase لتغيير كلمة المرور (واحدة للجميع)
   - Continue URL: الصفحة بعد النجاح (مختلفة لكل نوع)

2. **Deep Link** يحتاج rebuild للتطبيق بعد إضافة scheme

3. يمكن استخدام Firebase Hosting لرفع الصفحات

---

## ✅ الخلاصة

**الحل النهائي:** استخدام `continueUrl` مختلف في كل مكان ترسل منه reset email!

- التطبيق → `sab-store.com/reset-complete` → يفتح التطبيق
- لوحة التحكم → `admin.sab-store.com/reset-complete` → يروح للوحة التحكم

**مدة التنفيذ:** 20-30 دقيقة

### 1️⃣ في Firebase Console

1. اذهب إلى: https://console.firebase.google.com
2. اختر مشروعك
3. **Authentication** → **Templates** (في القائمة الجانبية)
4. اضغط على **Password reset** (قلم التعديل)
5. غير الإعدادات:

```
Action URL (URL pattern):
https://sab-store.com/__/auth/action

أو إذا عندك domain مخصص للتطبيق:
https://app.sab-store.com/__/auth/action
```

6. **احفظ التغييرات**

---

### 2️⃣ إنشاء صفحة Custom Reset (على الويب)

يجب إنشاء صفحة HTML على domain التطبيق:

**الموقع:** `https://sab-store.com/__/auth/action`

**الكود:**

```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reset Password - SAB Store</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            background: linear-gradient(135deg, #8B5CF6 0%, #6366F1 100%);
            margin: 0;
            padding: 20px;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .container {
            background: white;
            padding: 40px;
            border-radius: 20px;
            max-width: 400px;
            width: 100%;
            box-shadow: 0 20px 60px rgba(0,0,0,0.2);
        }
        .logo {
            text-align: center;
            margin-bottom: 30px;
        }
        .logo h1 {
            color: #8B5CF6;
            margin: 0;
            font-size: 32px;
        }
        input {
            width: 100%;
            padding: 15px;
            border: 2px solid #E5E7EB;
            border-radius: 10px;
            font-size: 16px;
            margin-bottom: 15px;
            box-sizing: border-box;
        }
        button {
            width: 100%;
            padding: 15px;
            background: linear-gradient(135deg, #8B5CF6 0%, #6366F1 100%);
            color: white;
            border: none;
            border-radius: 10px;
            font-size: 16px;
            font-weight: bold;
            cursor: pointer;
        }
        button:disabled {
            opacity: 0.5;
            cursor: not-allowed;
        }
        .message {
            padding: 15px;
            border-radius: 10px;
            margin-bottom: 15px;
            text-align: center;
        }
        .success {
            background: #D1FAE5;
            color: #065F46;
        }
        .error {
            background: #FEE2E2;
            color: #991B1B;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="logo">
            <h1>🛍️ SAB STORE</h1>
            <p style="color: #6B7280;">Reset Your Password</p>
        </div>

        <div id="message"></div>

        <form id="resetForm">
            <input type="password" id="newPassword" placeholder="New Password" required minlength="6">
            <input type="password" id="confirmPassword" placeholder="Confirm Password" required minlength="6">
            <button type="submit" id="submitBtn">Reset Password</button>
        </form>

        <p style="text-align: center; margin-top: 20px; color: #6B7280; font-size: 14px;">
            After resetting, open the SAB Store app to sign in
        </p>
    </div>

    <script type="module">
        import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
        import { getAuth, confirmPasswordReset, verifyPasswordResetCode } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';

        // Firebase config - استبدل بالـ config الخاص بمشروعك
        const firebaseConfig = {
            apiKey: "YOUR_API_KEY",
            authDomain: "YOUR_PROJECT.firebaseapp.com",
            projectId: "YOUR_PROJECT_ID",
            // ... باقي الـ config
        };

        const app = initializeApp(firebaseConfig);
        const auth = getAuth(app);

        // الحصول على oobCode من URL
        const urlParams = new URLSearchParams(window.location.search);
        const oobCode = urlParams.get('oobCode');
        const mode = urlParams.get('mode');

        const messageDiv = document.getElementById('message');
        const form = document.getElementById('resetForm');
        const submitBtn = document.getElementById('submitBtn');

        if (!oobCode || mode !== 'resetPassword') {
            messageDiv.className = 'message error';
            messageDiv.textContent = 'Invalid or expired reset link';
            form.style.display = 'none';
        }

        // التحقق من صلاحية الكود
        verifyPasswordResetCode(auth, oobCode)
            .then((email) => {
                console.log('Valid reset code for:', email);
            })
            .catch((error) => {
                messageDiv.className = 'message error';
                messageDiv.textContent = 'Invalid or expired reset link';
                form.style.display = 'none';
            });

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const newPassword = document.getElementById('newPassword').value;
            const confirmPassword = document.getElementById('confirmPassword').value;

            if (newPassword !== confirmPassword) {
                messageDiv.className = 'message error';
                messageDiv.textContent = 'Passwords do not match';
                return;
            }

            if (newPassword.length < 6) {
                messageDiv.className = 'message error';
                messageDiv.textContent = 'Password must be at least 6 characters';
                return;
            }

            submitBtn.disabled = true;
            submitBtn.textContent = 'Resetting...';

            try {
                await confirmPasswordReset(auth, oobCode, newPassword);
                
                messageDiv.className = 'message success';
                messageDiv.textContent = '✅ Password reset successful!';
                form.style.display = 'none';

                // فتح التطبيق بعد 2 ثانية
                setTimeout(() => {
                    // Deep link للتطبيق
                    window.location.href = 'sabstore://auth/login';
                    
                    // Fallback: عرض رسالة للمستخدم
                    setTimeout(() => {
                        messageDiv.innerHTML = '<p>Open the <strong>SAB Store</strong> app to sign in with your new password</p>';
                    }, 1000);
                }, 2000);

            } catch (error) {
                messageDiv.className = 'message error';
                messageDiv.textContent = 'Failed to reset password. Please try again.';
                submitBtn.disabled = false;
                submitBtn.textContent = 'Reset Password';
            }
        });
    </script>
</body>
</html>
```

---

### 3️⃣ إعداد Deep Linking في التطبيق

لفتح التطبيق مباشرة بعد reset:

**في `app.json`:**

```json
{
  "expo": {
    "scheme": "sabstore",
    "android": {
      "intentFilters": [
        {
          "action": "VIEW",
          "data": [
            {
              "scheme": "sabstore"
            }
          ],
          "category": ["BROWSABLE", "DEFAULT"]
        }
      ]
    },
    "ios": {
      "bundleIdentifier": "com.sabstore.app",
      "associatedDomains": ["applinks:sab-store.com"]
    }
  }
}
```

---

## 🎯 التدفق النهائي

1. **User** يضغط "Forgot Password" في التطبيق
2. **App** يرسل email عبر Firebase
3. **User** يفتح Email ويضغط الرابط
4. **يفتح** صفحة الويب المخصصة (sab-store.com)
5. **User** يدخل كلمة المرور الجديدة
6. **Success** → يفتح التطبيق تلقائياً (`sabstore://auth/login`)
7. **User** يسجل دخول بكلمة المرور الجديدة ✅

---

## ⚙️ الإعدادات المطلوبة

### في Firebase Console:
- ✅ غير Action URL في Email Templates
- ✅ أضف domain التطبيق في Authorized domains

### على السيرفر:
- ✅ ارفع صفحة HTML على `sab-store.com/__/auth/action`
- ✅ غير Firebase config في HTML

### في التطبيق:
- ✅ أضف scheme في app.json
- ✅ اعمل rebuild للتطبيق بعد التعديل

---

## 🔍 للاختبار

1. اذهب للتطبيق → Forgot Password
2. أدخل email
3. افتح Email
4. اضغط الرابط
5. يجب أن يفتح صفحة الويب الجديدة (مش admin.sab-store.com)
6. غير كلمة المرور
7. يجب أن يفتح التطبيق تلقائياً

---

## 📝 ملاحظات مهمة

- الصفحة يجب تكون على نفس domain المسجل في Firebase
- Deep link (`sabstore://`) يحتاج rebuild للتطبيق
- تأكد من Firebase config صحيح في صفحة HTML
- يمكن استخدام Firebase Hosting لرفع الصفحة

---

## 🆘 إذا ما اشتغل Deep Link

يمكن إضافة زر بدلاً من التوجيه التلقائي:

```html
<a href="sabstore://auth/login" style="
    display: block;
    width: 100%;
    padding: 15px;
    background: linear-gradient(135deg, #8B5CF6 0%, #6366F1 100%);
    color: white;
    text-align: center;
    border-radius: 10px;
    text-decoration: none;
    font-weight: bold;
    margin-top: 20px;
">
    Open SAB Store App
</a>
```

---

## ✅ بعد التطبيق

- المستخدمون يفتحون التطبيق مباشرة
- ما في توجيه للوحة التحكم
- تجربة سلسة ومتكاملة

**مدة التنفيذ:** 15-30 دقيقة
