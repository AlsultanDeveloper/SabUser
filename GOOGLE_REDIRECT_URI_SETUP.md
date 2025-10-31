# 🔧 إعداد Redirect URIs لـ Google OAuth

## ⚡ المشكلة التي تواجهها:
```
Google sign-in failed: Sign-in popup was closed
```

## 🎯 الحل:

### الخطوة 1: افتح Google Cloud Console
1. اذهب إلى: https://console.cloud.google.com/
2. اختر مشروعك: **sab-store-9b947**
3. من القائمة الجانبية: **APIs & Services** → **Credentials**

### الخطوة 2: اختر Web OAuth Client
ابحث عن أي من هذه:
- **Web client (auto created by Google Service)**
- أو أي OAuth 2.0 Client من نوع **Web application**

اضغط على اسم الـ Client للتعديل

### الخطوة 3: أضف Redirect URIs

في قسم **"Authorized redirect URIs"**, أضف هذين الـ URIs:

#### ✅ للتطوير على Web (localhost):
```
http://localhost:8085
```

#### ✅ للإنتاج (Expo):
```
https://auth.expo.io/@alsultandeveloper/sab-store
```

### الخطوة 4: احفظ التغييرات
1. اضغط **SAVE** في الأسفل
2. انتظر **2-3 دقائق** حتى تنتشر التغييرات في خوادم Google

---

## 🧪 اختبار الحل:

بعد إضافة الـ URIs وانتظار دقيقتين:

### على الويب (localhost):
1. تأكد أن التطبيق يعمل على: `http://localhost:8085`
2. اضغط على **Sign in with Google**
3. يجب أن تفتح نافذة Google منبثقة
4. سجل الدخول بحسابك
5. يجب أن تعود إلى التطبيق تلقائياً

### على Expo Go (الهاتف):
1. افتح التطبيق في Expo Go
2. اضغط على **Sign in with Google**
3. سيتم توجيهك لمتصفح الهاتف
4. سجل الدخول
5. سيعود بك للتطبيق

---

## 🐛 استكشاف الأخطاء:

### إذا ظل الخطأ موجوداً:

#### 1. تحقق من Popup Blocker
- **Chrome**: اضغط على أيقونة "🚫" في شريط العنوان
- اختر **Always allow popups from localhost:8085**

#### 2. تحقق من Console Logs
افتح DevTools (`F12`) وابحث عن:
```
🔄 Redirect URI: ...
```
وتأكد أن الـ URI موجود في Google Cloud Console

#### 3. جرب Incognito Mode
افتح نافذة تصفح خاص وجرب مرة أخرى

#### 4. امسح الـ Cache
```bash
# في Terminal
npx expo start --clear
```

---

## 📝 ملاحظات مهمة:

### ⚠️ الأمان:
- `http://localhost` آمن فقط للتطوير
- لا تستخدمه في الإنتاج
- استخدم `https://auth.expo.io` للإنتاج

### 🔑 Client IDs المستخدمة:
```
Web Client ID: 263235150197-7ur5kp8iath4f503m1f7juq5nha1nvqj
Android Client ID: 263235150197-71q01c46r4923tdgsei29oohkfthkk9i
iOS Client ID: 263235150197-uearggvrhr7u97uh9likv6hsbs73muqu
```

### 🌐 Expo Username & Slug:
```
Username: alsultandeveloper
Slug: sab-store
→ Redirect URI: https://auth.expo.io/@alsultandeveloper/sab-store
```

---

## ✅ Checklist:

قبل الاختبار، تأكد من:

- [ ] أضفت `http://localhost:8085` للـ Web OAuth Client
- [ ] أضفت `https://auth.expo.io/@alsultandeveloper/sab-store` للـ Web OAuth Client
- [ ] ضغطت Save في Google Cloud Console
- [ ] انتظرت 2-3 دقائق بعد الحفظ
- [ ] سمحت للنوافذ المنبثقة (Allow Popups) في المتصفح
- [ ] مسحت الـ Cache: `npx expo start --clear`

---

## 🆘 إذا احتجت مساعدة:

راجع الوثائق:
- [QUICK_FIX_STEPS_AR.md](./QUICK_FIX_STEPS_AR.md) - خطوات سريعة
- [GOOGLE_400_ERROR_OFFICIAL_FIX.md](./GOOGLE_400_ERROR_OFFICIAL_FIX.md) - شرح مفصل
- [GOOGLE_AUTH_SOLUTIONS_COMPARISON.md](./GOOGLE_AUTH_SOLUTIONS_COMPARISON.md) - مقارنة الحلول
