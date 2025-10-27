// BANNERS_QUICK_START_AR.md - dummy content
# 🚀 دليل سريع: إضافة البانرات في Firebase

## خطوات سريعة

### 1️⃣ افتح Firebase Console
👉 https://console.firebase.google.com/
- اختر المشروع: **sab-store-9b947**
- اذهب إلى **Firestore Database**

### 2️⃣ أنشئ مجموعة البانرات
- انقر **Start collection** أو **Add collection**
- اسم المجموعة: `banners`
- انقر **Next**

### 3️⃣ أضف بانر
استخدم **Auto-ID** أو ID مخصص، ثم أضف الحقول التالية:

#### 📝 الحقول المطلوبة:

| الحقل | النوع | القيمة (مثال) |
|-------|------|---------------|
| **title** | map | - |
| title.**en** | string | "Summer Sale" |
| title.**ar** | string | "تخفيضات الصيف" |
| **subtitle** | map | - |
| subtitle.**en** | string | "Up to 50% off" |
| subtitle.**ar** | string | "خصم حتى 50%" |
| **image** | string | رابط الصورة (انظر الأمثلة أدناه) |
| **order** | number | 1 |

---

## 🖼️ روابط صور جاهزة

انسخ والصق أي من هذه الروابط:

```
تسوق وأزياء:
https://images.unsplash.com/photo-1441986300917-64674bd600d8

إلكترونيات:
https://images.unsplash.com/photo-1498049794561-7780e7231661

منزل ومطبخ:
https://images.unsplash.com/photo-1556909212-d5b604d0c90d

مستحضرات تجميل:
https://images.unsplash.com/photo-1596462502278-27bfdc403348

عروض وتخفيضات:
https://images.unsplash.com/photo-1607083206968-13611e3d76db

وصل حديثاً:
https://images.unsplash.com/photo-1483985988355-763728e1935b
```

---

## 📋 أمثلة كاملة جاهزة للنسخ

### بانر 1: تخفيضات الصيف
```
title (map):
  ├─ en: "Summer Sale"
  └─ ar: "تخفيضات الصيف"

subtitle (map):
  ├─ en: "Up to 50% off on selected items"
  └─ ar: "خصم حتى 50% على منتجات مختارة"

image: "https://images.unsplash.com/photo-1607083206968-13611e3d76db"
order: 1
```

### بانر 2: وصل حديثاً
```
title (map):
  ├─ en: "New Arrivals"
  └─ ar: "وصل حديثاً"

subtitle (map):
  ├─ en: "Discover the latest trends"
  └─ ar: "اكتشف أحدث الصيحات"

image: "https://images.unsplash.com/photo-1483985988355-763728e1935b"
order: 2
```

### بانر 3: إلكترونيات
```
title (map):
  ├─ en: "Electronics Deals"
  └─ ar: "عروض الإلكترونيات"

subtitle (map):
  ├─ en: "Latest tech at best prices"
  └─ ar: "أحدث التقنيات بأفضل الأسعار"

image: "https://images.unsplash.com/photo-1498049794561-7780e7231661"
order: 3
```

---

## 🎯 نصائح مهمة

✅ **ترتيب البانرات**: الرقم الأقل في `order` يظهر أولاً  
✅ **حجم الصورة**: يفضل 1200×600 بكسل  
✅ **النصوص**: قصيرة وجذابة  
✅ **الترجمة**: تأكد من إضافة النسخة العربية والإنجليزية  

---

## ✅ التحقق من العمل

بعد الإضافة:
1. افتح التطبيق
2. اذهب إلى الصفحة الرئيسية
3. يجب أن ترى البانرات في الأعلى تتحرك تلقائياً

---

## ❌ حل المشاكل

**البانرات لا تظهر؟**
- تأكد من أن اسم المجموعة `banners` بالضبط
- تحقق من صلاحيات Firebase (يجب السماح بالقراءة)
- تأكد من أن جميع الحقول موجودة

**الصور لا تظهر؟**
- تحقق من رابط الصورة في المتصفح
- تأكد من أن الرابط يبدأ بـ `https://`

---

## 📚 للمزيد من التفاصيل

راجع الملف الكامل: `BANNERS_GUIDE.md`

---

**Firebase Project**: sab-store-9b947  
**آخر تحديث**: 2025-10-26
