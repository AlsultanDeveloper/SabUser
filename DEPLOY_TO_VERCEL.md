# 🚀 دليل نشر SabUser على Vercel

## الخطة الكاملة لنشر تطبيق Expo Web

### ✅ المتطلبات:
- ✓ مشروع Expo يعمل (موجود)
- ✓ Firebase متصل (موجود)
- ✓ حساب GitHub (موجود: SabStorelb)
- ✓ حساب Vercel (موجود)

---

## 📝 الخطوات التفصيلية:

### 1️⃣ تجهيز Git
```bash
cd C:\Users\adamd\Project\SabUser
git init
git add .
git commit -m "Initial commit - Expo Web App"
```

### 2️⃣ إنشاء Repository على GitHub
- اسم الريبو: `SabUser` أو `sab-store-mobile`
- وصف: "Sab Store - Customer Mobile & Web App"
- Public أو Private حسب رغبتك

### 3️⃣ ربط Git مع GitHub
```bash
git remote add origin https://github.com/SabStorelb/[اسم-الريبو].git
git branch -M main
git push -u origin main
```

### 4️⃣ إنشاء vercel.json
```json
{
  "buildCommand": "npx expo export:web",
  "outputDirectory": "dist",
  "devCommand": "npx expo start --web",
  "framework": null,
  "rewrites": [
    { "source": "/(.*)", "destination": "/" }
  ]
}
```

### 5️⃣ ربط Vercel
1. اذهب إلى [vercel.com](https://vercel.com)
2. Import Project
3. اختر GitHub repository: `SabUser`
4. Vercel سيكتشف تلقائياً أنه Expo
5. اضغط Deploy

---

## ⚙️ إعدادات Vercel المقترحة:

### Build Settings:
- **Framework Preset:** Other
- **Build Command:** `npx expo export:web`
- **Output Directory:** `dist`
- **Install Command:** `npm install`

### Environment Variables:
انسخ من ملف `.env`:
- `EXPO_PUBLIC_FIREBASE_API_KEY`
- `EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `EXPO_PUBLIC_FIREBASE_PROJECT_ID`
- ... إلخ

---

## 🎯 النتيجة النهائية:

بعد النشر، ستحصل على:
- ✅ **رابط ويب:** `sabuser.vercel.app` (مثلاً)
- ✅ **تحديثات تلقائية:** كل push لـ GitHub = deploy جديد
- ✅ **نفس التصميم:** مثل تطبيق الموبايل بالضبط
- ✅ **نفس Firebase:** يستخدم نفس البيانات مع Admin Panel

---

## 📱 مقارنة المنصات:

| المنصة | الرابط | الاستخدام |
|--------|---------|-----------|
| **Admin Panel** | `sab-store-user.vercel.app` | إدارة المنتجات والطلبات |
| **Web App** | `sabuser.vercel.app` | العملاء - المتصفح |
| **Android App** | APK/Google Play | العملاء - أندرويد |
| **iOS App** | IPA/App Store | العملاء - آيفون |
| **Firebase** | مشترك بين الكل | قاعدة البيانات الموحدة |

---

## ⚡ بدء التنفيذ الآن؟

هل تريد أن أبدأ بتنفيذ الخطوات؟ سأحتاج:
1. ✅ موافقتك للبدء
2. 📝 اسم الريبو المفضل على GitHub
3. 🔑 التأكد من أن .env فيه جميع متغيرات Firebase

بعدها سنكون جاهزين للنشر! 🚀
