# أوامر النشر السريعة - Quick Deployment Commands

## 🚀 النشر الأولي | Initial Release

### بناء ورفع لكلا المنصتين
```bash
# 1. بناء Android و iOS
eas build --platform all --profile production

# 2. رفع للمتاجر
eas submit --platform all --profile production
```

---

## 🔄 التحديثات السريعة (OTA) | Quick Updates

### نشر تحديث فوري (بدون مراجعة المتجر)
```bash
# تحديث فوري للإنتاج
eas update --branch production --message "إصلاح أخطاء وتحسينات"

# أو بالإنجليزية
eas update --branch production --message "Bug fixes and improvements"
```

### أمثلة رسائل تحديث:
```bash
# إصلاح مشكلة
eas update --branch production --message "Fix: حل مشكلة عرض المنتجات"

# ميزة جديدة
eas update --branch production --message "Feature: إضافة فلتر الفئات"

# تحسينات UI
eas update --branch production --message "UI: تحسين تصميم الصفحة الرئيسية"

# تحديث محتوى
eas update --branch production --message "Content: تحديث الصور والبنرات"
```

---

## 📱 بناء المنصات منفصلة | Platform-Specific Builds

### Android فقط
```bash
# بناء
eas build --platform android --profile production

# رفع
eas submit --platform android --profile production
```

### iOS فقط
```bash
# بناء
eas build --platform ios --profile production

# رفع
eas submit --platform ios --profile production
```

---

## 🧪 الاختبار | Testing

### بناء للاختبار (Preview)
```bash
# Android APK للاختبار
eas build --platform android --profile preview

# iOS للاختبار الداخلي
eas build --platform ios --profile preview
```

### تحديث قناة الاختبار
```bash
eas update --branch preview --message "Testing new feature"
```

---

## 📊 المراقبة | Monitoring

### عرض قائمة التحديثات
```bash
# جميع التحديثات على قناة الإنتاج
eas update:list --branch production

# جميع البناءات
eas build:list
```

### حالة التحديث
```bash
# معلومات التحديث الحالي
eas update:view --branch production
```

---

## 🔙 التراجع | Rollback

### العودة لتحديث سابق
```bash
# 1. عرض قائمة التحديثات
eas update:list --branch production

# 2. نسخ ID التحديث المطلوب
# 3. نشره مجدداً
eas branch:publish --branch production --update-id <update-id>
```

---

## 🔧 إدارة القنوات | Channel Management

### إنشاء قناة جديدة
```bash
eas channel:create staging
```

### عرض جميع القنوات
```bash
eas channel:list
```

### ربط قناة بـ branch
```bash
eas channel:edit production --branch production
```

---

## 📦 إدارة الإصدارات | Version Management

### قبل كل build جديد للمتجر:
```json
// في app.json
{
  "version": "1.0.15",  // ⬆️ زيادة الرقم
  "runtimeVersion": "1.0.15"  // ⬆️ نفس الرقم
}
```

### رقم البناء (Build Number)
- ✅ يزداد تلقائياً (`autoIncrement: true` في eas.json)
- لا حاجة لتغييره يدوياً

---

## 🎯 Workflow النشر الكامل

### للتحديث الصغير (Bug Fix):
```bash
# 1. إصلاح الكود
# 2. نشر OTA فوراً
eas update --branch production --message "Fix: حل مشكلة السلة"

# ✅ المستخدمون يحصلون على التحديث خلال دقائق
```

### للتحديث الكبير (New Feature):
```bash
# 1. تطوير الميزة
# 2. اختبار على preview
eas update --branch preview --message "Test: ميزة البحث المتقدم"

# 3. بعد التأكد، زيادة version في app.json
# "version": "1.0.15"

# 4. بناء جديد
eas build --platform all --profile production

# 5. رفع للمتاجر
eas submit --platform all --profile production

# ⏱️ انتظار الموافقة (1-3 أيام)
```

---

## 🔐 الأمان | Security

### فحص الأسرار (Secrets)
```bash
# عرض secrets المشروع
eas secret:list
```

### إضافة secret جديد
```bash
eas secret:create --scope project --name API_KEY --value "your-secret-key"
```

---

## 🆘 حل المشاكل | Troubleshooting

### مسح الكاش وإعادة البناء
```bash
# مسح الكاش
eas build --platform android --profile production --clear-cache

# أو
eas build --platform ios --profile production --clear-cache
```

### إعادة المحاولة بعد فشل
```bash
# إعادة آخر build
eas build:retry <build-id>
```

### فحص الـ logs
```bash
# logs البناء
eas build:view <build-id>

# logs التحديث
eas update:view <update-id>
```

---

## 📱 تسجيل الدخول | Authentication

### تسجيل الدخول لـ EAS
```bash
eas login
```

### عرض معلومات الحساب
```bash
eas whoami
```

---

## 🎉 الخلاصة السريعة

### الأوامر الأكثر استخداماً:

```bash
# 1️⃣ تحديث سريع (الأكثر شيوعاً)
eas update --branch production --message "Bug fixes"

# 2️⃣ بناء جديد للمتجر
eas build --platform all --profile production

# 3️⃣ رفع للمتاجر
eas submit --platform all --profile production

# 4️⃣ مراقبة التحديثات
eas update:list --branch production

# 5️⃣ اختبار قبل النشر
eas update --branch preview --message "Testing"
```

---

**💡 نصيحة:** احفظ هذا الملف كمرجع سريع لجميع أوامر النشر!
